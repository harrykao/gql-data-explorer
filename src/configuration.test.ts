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
        const [validatedConfig, errors] = validateConfiguration(config, introspection);
        expect(validatedConfig).toBeNull();
        expect(errors).toEqual(["Type `MissingObject` does not exist."]);
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
        const [validatedConfig, errors] = validateConfiguration(config, introspection);
        expect(validatedConfig).toBeNull();
        expect(errors).toEqual(["Field `Object.missingField` does not exist."]);
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
        const [validatedConfig, errors] = validateConfiguration(config, introspection);
        expect(validatedConfig).toEqual({
            views: [
                {
                    objectName: "Object",
                    fields: [
                        {
                            path: [
                                {
                                    str: "field",
                                    gqlField: introspection
                                        .getObjectByTypeName("Object")
                                        .fields.get("field"),
                                },
                            ],
                            displayName: null,
                        },
                    ],
                },
            ],
        });
        expect(errors).toEqual([]);
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
        const [validatedConfig, errors] = validateConfiguration(config, introspection);
        expect(validatedConfig).toBeNull();
        expect(errors).toEqual([
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
        const [validatedConfig, errors] = validateConfiguration(config, introspection);
        expect(validatedConfig).toEqual({
            views: [
                {
                    objectName: "Object",
                    fields: [
                        {
                            path: [
                                {
                                    str: "nestedObject",
                                    gqlField: introspection
                                        .getObjectByTypeName("Object")
                                        .fields.get("nestedObject"),
                                },
                                {
                                    str: "field",
                                    gqlField: introspection
                                        .getObjectByTypeName("Object")
                                        .fields.get("field"),
                                },
                            ],
                            displayName: null,
                        },
                    ],
                },
            ],
        });
        expect(errors).toEqual([]);
    });
});
