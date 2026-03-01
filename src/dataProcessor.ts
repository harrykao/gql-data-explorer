import { ValidatedField, ValidatedView } from "./configuration";
import { GqlFieldDef, GqlObjectDef } from "./introspection";
import { GqlObjectData } from "./types";

interface DisplayField {
    label: string;
    value: string | null; // set for scalars, null for objects
    fieldDef: GqlFieldDef;
    fieldConfig: ValidatedField;
}

/**
 * From the GQL data and the View, determine what do display in the UI.
 */
export function getDisplayFields(
    def: GqlObjectDef,
    data: GqlObjectData,
    view: ValidatedView,
): DisplayField[] {
    if (def.name !== view.objectName) {
        throw new Error("view doesn't match object type");
    }

    return view.fields.map((fieldConfig) => {
        const fieldDef = fieldConfig.path[fieldConfig.path.length - 1].gqlField;
        const dataValue = getDataValue(data, fieldConfig);

        // scalar values
        if (fieldDef.type.kind !== "OBJECT") {
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

function getDataValue(data: GqlObjectData, fieldConfig: ValidatedField): unknown {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentValue: any = data;

    fieldConfig.path.forEach((pathPart) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        currentValue = currentValue[pathPart.str];
    });

    return currentValue;
}
