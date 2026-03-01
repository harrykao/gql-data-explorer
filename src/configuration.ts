import { createContext, useContext } from "react";
import { GqlFieldDef, GqlObjectDef, Introspection, TypeNotFoundError } from "./introspection";

export interface Config {
    views: View[];
}

export interface View {
    objectName: string;
    fields: Field[];
}

export interface Field {
    path: string[];
    displayName: string | null;
}

export interface ValidatedConfig {
    views: ValidatedView[];
}

export interface ValidatedView {
    objectName: string;
    fields: ValidatedField[];
}

export interface PathPart {
    str: string;
    gqlField: GqlFieldDef;
}

export interface ValidatedField {
    path: PathPart[];
    displayName: string | null;
}

export function validateConfiguration(
    config: Config,
    introspection: Introspection,
): [ValidatedConfig | null, string[]] {
    const validatedConfig: ValidatedConfig = { views: [] };
    const errors: string[] = [];

    config.views.forEach((view) => {
        const [validatedView, newErrors] = validateView(view, introspection);
        if (validatedView !== null) {
            validatedConfig.views.push(validatedView);
        }
        errors.push(...newErrors);
    });

    return [errors.length == 0 ? validatedConfig : null, errors];
}

function validateView(view: View, introspection: Introspection): [ValidatedView | null, string[]] {
    const validatedView: ValidatedView = { objectName: view.objectName, fields: [] };
    const errors: string[] = [];
    let gqlObject: GqlObjectDef;

    try {
        gqlObject = introspection.getObjectByTypeName(view.objectName);
    } catch (e) {
        if (e instanceof TypeNotFoundError) {
            return [null, [`Type \`${view.objectName}\` does not exist.`]];
        } else {
            throw e;
        }
    }

    view.fields.forEach((f) => {
        const [validatedField, newErrors] = validateField(f, gqlObject, introspection);
        if (validatedField !== null) {
            validatedView.fields.push(validatedField);
        }
        errors.push(...newErrors);
    });

    return [validatedView, errors];
}

function validateField(
    field: Field,
    gqlObject: GqlObjectDef,
    introspection: Introspection,
): [ValidatedField | null, string[]] {
    const validatedField: ValidatedField = { path: [], displayName: field.displayName };

    if (field.path.length === 0) {
        return [null, [`A field for \`${gqlObject.name}\` has an empty path.`]];
    }

    // this will be updated as we walk the graph, following `field.path`
    let targetGqlObject = gqlObject;

    for (const [i, pathPart] of field.path.entries()) {
        const gqlField = targetGqlObject.fields.get(pathPart);

        if (!gqlField) {
            return [null, [`Field \`${gqlObject.name}.${field.path.join(".")}\` does not exist.`]];
        }

        // intermediate path parts must point to objects
        if (i < field.path.length - 1) {
            if (gqlField.type.kind !== "OBJECT") {
                return [
                    null,
                    [
                        `Field \`${gqlObject.name}.${field.path.join(".")}\` does not point to a valid field.`,
                    ],
                ];
            }
        }

        validatedField.path.push({ str: pathPart, gqlField });
        if (i < field.path.length - 1) {
            targetGqlObject = introspection.getObjectByTypeName(gqlField.type.name);
        }
    }

    return [validatedField, []];
}

export const ConfigContext = createContext<Config | null>(null);

export default function useConfiguration(): Config | null {
    return useContext(ConfigContext);
}
