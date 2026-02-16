import { createContext, useContext } from "react";
import { GqlObjectDef, Introspection, TypeNotFoundError } from "./introspection";

export interface Field {
    fieldName: string;
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
        errors.push(...validateField(f, gqlObject));
    });
    return errors;
}

function validateField(field: Field, gqlObject: GqlObjectDef): string[] {
    if (!gqlObject.fields.has(field.fieldName)) {
        return [`Field \`${gqlObject.name}.${field.fieldName}\` does not exist.`];
    }
    return [];
}

export const ConfigContext = createContext<Config | null>(null);

export default function useConfiguration(): Config | null {
    return useContext(ConfigContext);
}
