import { Field, View } from "./configuration";
import { GqlFieldDef, GqlObjectDef } from "./introspection";
import { GqlObjectData } from "./types";

interface DisplayField {
    label: string;
    value: string | null; // set for scalers, null for objects
    fieldDef: GqlFieldDef;
    fieldConfig: Field;
}

/**
 * From the GQL data and the View, determine what do display in the UI.
 */
export function getDisplayFields(
    def: GqlObjectDef,
    data: GqlObjectData,
    view: View,
): DisplayField[] {
    if (def.name !== view.objectName) {
        throw new Error("view doesn't match object type");
    }

    return view.fields.map((fieldConfig) => {
        const fieldDef = def.fields.get(fieldConfig.path[0]);
        const dataValue = data[fieldConfig.path[0]];

        if (!fieldDef) {
            throw new Error("field not found");
        }

        // scalar values
        if (dataValue !== undefined) {
            const valueStr = typeof dataValue === "string" ? dataValue : "(unsupported type)";
            return {
                label: fieldConfig.displayName ?? fieldDef.name,
                value: valueStr,
                fieldDef,
                fieldConfig,
            };
        }

        // objects
        else {
            return {
                label: fieldConfig.displayName ?? fieldDef.name,
                value: null,
                fieldDef,
                fieldConfig,
            };
        }
    });
}
