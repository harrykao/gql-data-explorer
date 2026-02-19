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
        nestedObject: Object
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
                    fields: [{ path: ["missingField"], displayName: null }],
                },
            ],
        };
        const introspection = new Introspection(getTestSchema(SCHEMA));
        const result = validateConfiguration(config, introspection);
        expect(result).toEqual(["Field `Object.missingField` does not exist."]);
    });

    it("succeeds when field exists", () => {
        const config: Config = {
            views: [
                {
                    objectName: "Object",
                    fields: [{ path: ["field"], displayName: null }],
                },
            ],
        };
        const introspection = new Introspection(getTestSchema(SCHEMA));
        const result = validateConfiguration(config, introspection);
        expect(result).toEqual([]);
    });

    it("fails when intermediate path part is not an object", () => {
        const config: Config = {
            views: [
                {
                    objectName: "Object",
                    fields: [{ path: ["field", "anotherField"], displayName: null }],
                },
            ],
        };
        const introspection = new Introspection(getTestSchema(SCHEMA));
        const result = validateConfiguration(config, introspection);
        expect(result).toEqual([
            "Field `Object.field.anotherField` does not point to a valid field.",
        ]);
    });

    it("succeeds with multi-part path", () => {
        const config: Config = {
            views: [
                {
                    objectName: "Object",
                    fields: [{ path: ["nestedObject", "field"], displayName: null }],
                },
            ],
        };
        const introspection = new Introspection(getTestSchema(SCHEMA));
        const result = validateConfiguration(config, introspection);
        expect(result).toEqual([]);
    });
});
