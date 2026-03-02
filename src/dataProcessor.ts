import { ValidatedField, ValidatedView } from "./configuration";
import { GqlFieldDef, GqlObjectDef } from "./introspection";
import { GqlObjectData } from "./types";

interface DisplayField {
    label: string;
    value: string | null | undefined; // set or null for scalars, undefined for objects
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
        let displayValue: string | null | undefined = undefined;

        // objects
        if (fieldDef.type.kind === "OBJECT") {
            displayValue = undefined;
        }

        // scalar values
        else {
            if (fieldDef.type.kind === "SCALAR") {
                switch (fieldDef.type.name) {
                    case "Boolean":
                        displayValue = dataValue ? "true" : "false";
                        break;
                    case "ID":
                        displayValue = String(dataValue);
                        break;
                    case "String":
                        displayValue = String(dataValue);
                        break;
                    default:
                        displayValue = `unhandled scalar type: ${fieldDef.type.name}`;
                        break;
                }
            } else if (fieldDef.type.kind === "ENUM") {
                displayValue = String(dataValue);
            } else {
                displayValue = `unhandled field kind: ${fieldDef.type.kind}`;
            }
        }

        return {
            label: fieldConfig.displayName ?? fieldDef.name,
            value: displayValue,
            fieldDef,
            fieldConfig,
        };
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
