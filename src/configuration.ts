import { createContext, useContext } from "react";
import { GqlObjectDef, Introspection, TypeNotFoundError } from "./introspection";

export interface Field {
    path: string[];
    displayName: string | null;
}

export interface View {
    objectName: string;
    fields: Field[];
}

export interface Config {
    views: View[];
}

export function validateConfiguration(config: Config, introspection: Introspection): string[] {
    const errors: string[] = [];
    config.views.forEach((view) => {
        errors.push(...validateView(view, introspection));
    });
    return errors;
}

function validateView(view: View, introspection: Introspection): string[] {
    let gqlObject: GqlObjectDef;

    try {
        gqlObject = introspection.getObjectByTypeName(view.objectName);
    } catch (e) {
        if (e instanceof TypeNotFoundError) {
            return [`Type \`${view.objectName}\` does not exist.`];
        } else {
            throw e;
        }
    }

    const errors: string[] = [];
    view.fields.forEach((f) => {
        errors.push(...validateField(f, gqlObject, introspection));
    });
    return errors;
}

function validateField(
    field: Field,
    gqlObject: GqlObjectDef,
    introspection: Introspection,
): string[] {
    if (field.path.length === 0) {
        return [`A field for \`${gqlObject.name}\` has an empty path.`];
    }

    // this will be updated as we walk the graph, following `field.path`
    let targetGqlObject = gqlObject;

    for (const [i, pathPart] of field.path.entries()) {
        const gqlField = targetGqlObject.fields.get(pathPart);

        if (!gqlField) {
            return [`Field \`${gqlObject.name}.${field.path.join(".")}\` does not exist.`];
        }

        // intermediate path parts must point to objects
        if (i < field.path.length - 1) {
            if (gqlField.type.kind !== "OBJECT") {
                return [
                    `Field \`${gqlObject.name}.${field.path.join(".")}\` does not point to a valid field.`,
                ];
            }
            targetGqlObject = introspection.getObjectByTypeName(gqlField.type.name);
        }
    }

    return [];
}

export const ConfigContext = createContext<Config | null>(null);

export default function useConfiguration(): Config | null {
    return useContext(ConfigContext);
}
