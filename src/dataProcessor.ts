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
        const dataValue = getDataValue(data, fieldConfig);

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

function getDataValue(data: GqlObjectData, fieldConfig: Field): unknown {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentValue: any = data;

    fieldConfig.path.forEach((pathPart) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        currentValue = currentValue[pathPart];
    });

    return currentValue;
}
