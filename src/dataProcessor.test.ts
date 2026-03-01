import { describe, expect, it } from "vitest";
import { getDisplayFields } from "./dataProcessor";
import { GqlFieldDef } from "./introspection";

describe("gets display fields", () => {
    it("returns scalar", () => {
        const fieldDef: GqlFieldDef = {
            name: "scalarField",
            description: "A field.",
            type: {
                name: "String",
                kind: "SCALAR",
                isNullable: true,
                isList: false,
                isListNullable: true,
            },
            args: [],
            requiresArguments: false,
        };
        const displayField = getDisplayFields(
            {
                name: "MyType",
                description: "Object description.",
                fields: new Map([["scalarField", fieldDef]]),
            },
            { scalarField: "foo", __typename: "MyType" },
            {
                objectName: "MyType",
                fields: [{ path: ["scalarField"], displayName: "Scalar Field" }],
            },
        );

        expect(displayField).toEqual([
            {
                label: "Scalar Field",
                value: "foo",
                fieldDef,
                fieldConfig: { path: ["scalarField"], displayName: "Scalar Field" },
            },
        ]);
    });

    it("returns object", () => {
        const fieldDef: GqlFieldDef = {
            name: "objectField",
            description: "A field.",
            type: {
                name: "Object",
                kind: "OBJECT",
                isNullable: true,
                isList: false,
                isListNullable: true,
            },
            args: [],
            requiresArguments: false,
        };
        const displayField = getDisplayFields(
            {
                name: "MyType",
                description: "Object description.",
                fields: new Map([["objectField", fieldDef]]),
            },
            { __typename: "MyType" }, // no `objectField`; it won't be included in the query
            {
                objectName: "MyType",
                fields: [{ path: ["objectField"], displayName: "Object Field" }],
            },
        );

        expect(displayField).toEqual([
            {
                label: "Object Field",
                value: null,
                fieldDef,
                fieldConfig: { path: ["objectField"], displayName: "Object Field" },
            },
        ]);
    });

    it("gets value for multi-part path", () => {
        const fieldDef: GqlFieldDef = {
            name: "objectField",
            description: "A field.",
            type: {
                name: "Object",
                kind: "OBJECT",
                isNullable: true,
                isList: false,
                isListNullable: true,
            },
            args: [],
            requiresArguments: false,
        };
        const displayField = getDisplayFields(
            {
                name: "MyType",
                description: "Object description.",
                fields: new Map([["objectField", fieldDef]]),
            },
            { objectField: { nestedField: "foo" }, __typename: "MyType" },
            {
                objectName: "MyType",
                fields: [
                    { path: ["objectField", "nestedField"], displayName: "Object's Nested Field" },
                ],
            },
        );

        expect(displayField).toEqual([
            {
                label: "Object's Nested Field",
                value: "foo",
                fieldDef,
                fieldConfig: {
                    path: ["objectField", "nestedField"],
                    displayName: "Object's Nested Field",
                },
            },
        ]);
    });
});
