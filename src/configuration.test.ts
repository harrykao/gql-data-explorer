import { describe, expect, it } from "vitest";
import { Config, validateConfiguration } from "./configuration";
import { Introspection } from "./introspection";
import { getTestSchema } from "./test_schemas/testSchemas";

const SCHEMA = `
    type Query {
        foo: String
    }

    type Object {
        field: String
    }
`;

describe("validates config", () => {
    it("returns error when object type doesn't exist", () => {
        const config: Config = {
            views: [{ objectName: "MissingObject", fields: [] }],
        };
        const introspection = new Introspection(getTestSchema(SCHEMA));
        const result = validateConfiguration(config, introspection);
        expect(result).toEqual(["Type `MissingObject` does not exist."]);
    });

    it("returns error when field doesn't exist", () => {
        const config: Config = {
            views: [
                {
                    objectName: "Object",
                    fields: [{ fieldName: "missingField", displayName: null }],
                },
            ],
        };
        const introspection = new Introspection(getTestSchema(SCHEMA));
        const result = validateConfiguration(config, introspection);
        expect(result).toEqual(["Field `Object.missingField` does not exist."]);
    });
});
