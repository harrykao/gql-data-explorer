import { describe, expect, it } from "vitest";
import { getDisplayFields } from "./dataProcessor";
import { Introspection } from "./introspection";
import { getTestSchema } from "./test_schemas/testSchemas";

describe("gets display fields", () => {
    it("returns scalar", () => {
        const TEST_SCHEMA = `
            type Query {
                scalarField: String
            }
        `;

        const introspection = new Introspection(getTestSchema(TEST_SCHEMA));
        const gqlObject = introspection.getObjectByTypeName("Query");
        const gqlField = gqlObject.fields.get("scalarField");

        if (gqlField === undefined) {
            throw new Error();
        }

        const displayField = getDisplayFields(
            gqlObject,
            { scalarField: "foo", __typename: "Query" },
            {
                objectName: "Query",
                fields: [
                    {
                        path: [{ str: "scalarField", gqlField }],
                        displayName: "Scalar Field",
                    },
                ],
            },
        );

        expect(displayField).toEqual([
            {
                label: "Scalar Field",
                value: "foo",
                fieldDef: gqlField,
                fieldConfig: {
                    path: [{ str: "scalarField", gqlField }],
                    displayName: "Scalar Field",
                },
            },
        ]);
    });

    it("returns object", () => {
        const TEST_SCHEMA = `
            type Query {
                objectField: Object
            }

            type Object {
                scalarField: String
            }
        `;

        const introspection = new Introspection(getTestSchema(TEST_SCHEMA));
        const gqlObject = introspection.getObjectByTypeName("Query");
        const gqlField = gqlObject.fields.get("objectField");

        if (gqlField === undefined) {
            throw new Error();
        }

        const displayField = getDisplayFields(
            gqlObject,
            { __typename: "Object" }, // no `objectField`; it won't be included in the query
            {
                objectName: "Query",
                fields: [
                    {
                        path: [{ str: "objectField", gqlField }],
                        displayName: "Object Field",
                    },
                ],
            },
        );

        expect(displayField).toEqual([
            {
                label: "Object Field",
                value: null,
                fieldDef: gqlField,
                fieldConfig: {
                    path: [{ str: "objectField", gqlField }],
                    displayName: "Object Field",
                },
            },
        ]);
    });

    it("gets value for multi-part path", () => {
        const TEST_SCHEMA = `
            type Query {
                objectField: MyType
            }

            type MyType {
                nestedField: String
            }
        `;

        const introspection = new Introspection(getTestSchema(TEST_SCHEMA));
        const gqlQueryDef = introspection.getObjectByTypeName("Query");
        const gqlQueryField = gqlQueryDef.fields.get("objectField");
        const gqlMyTypeDef = introspection.getObjectByTypeName("MyType");
        const gqlMyTypeField = gqlMyTypeDef.fields.get("nestedField");

        if (gqlQueryField === undefined || gqlMyTypeField === undefined) {
            throw new Error();
        }

        const displayField = getDisplayFields(
            gqlQueryDef,
            { objectField: { nestedField: "foo" }, __typename: "Query" },
            {
                objectName: "Query",
                fields: [
                    {
                        path: [
                            { str: "objectField", gqlField: gqlQueryField },
                            { str: "nestedField", gqlField: gqlMyTypeField },
                        ],
                        displayName: "MyType's Nested Field",
                    },
                ],
            },
        );

        expect(displayField).toEqual([
            {
                label: "MyType's Nested Field",
                value: "foo",
                fieldDef: gqlMyTypeField,
                fieldConfig: {
                    path: [
                        { str: "objectField", gqlField: gqlQueryField },
                        { str: "nestedField", gqlField: gqlMyTypeField },
                    ],
                    displayName: "MyType's Nested Field",
                },
            },
        ]);
    });
});
