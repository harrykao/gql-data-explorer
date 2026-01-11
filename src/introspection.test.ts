import {
    IntrospectionListTypeRef,
    IntrospectionNonNullTypeRef,
    IntrospectionQuery,
    IntrospectionScalarType,
} from "graphql";
import { describe, expect, it } from "vitest";
import {
    GqlTypeDef,
    Introspection,
    extractTypeInformation,
    makeTypeStrFromDef,
} from "./introspection";
import testSchemaWithNode from "./test_schemas/with_node.json";
import testSchemaWithNodeOfWrongType from "./test_schemas/with_node_of_wrong_type.json";
import testSchemaWithoutNode from "./test_schemas/without_node.json";

describe("extractTypeInformation()", () => {
    it("parses nullable scalar", () => {
        const typeSchema: IntrospectionScalarType = {
            name: "TypeName",
            kind: "SCALAR",
        };
        const expected: GqlTypeDef = {
            name: "TypeName",
            kind: "SCALAR",
            isNullable: true,
            isList: false,
            isListNullable: true,
        };

        const typeDef = extractTypeInformation(typeSchema);
        expect(typeDef).toStrictEqual(expected);
    });

    it("parses non-nullable scalar", () => {
        const typeSchema: IntrospectionNonNullTypeRef<IntrospectionScalarType> = {
            kind: "NON_NULL",
            ofType: {
                name: "TypeName",
                kind: "SCALAR",
            },
        };
        const expected: GqlTypeDef = {
            name: "TypeName",
            kind: "SCALAR",
            isNullable: false,
            isList: false,
            isListNullable: true,
        };

        const typeDef = extractTypeInformation(typeSchema);
        expect(typeDef).toStrictEqual(expected);
    });

    it("parses nullable list of nullable scalars", () => {
        const typeSchema: IntrospectionListTypeRef<IntrospectionScalarType> = {
            kind: "LIST",
            ofType: {
                name: "TypeName",
                kind: "SCALAR",
            },
        };
        const expected: GqlTypeDef = {
            name: "TypeName",
            kind: "SCALAR",
            isNullable: true,
            isList: true,
            isListNullable: true,
        };

        const typeDef = extractTypeInformation(typeSchema);
        expect(typeDef).toStrictEqual(expected);
    });

    it("parses nullable list of non-nullable scalars", () => {
        const typeSchema: IntrospectionListTypeRef<
            IntrospectionNonNullTypeRef<IntrospectionScalarType>
        > = {
            kind: "LIST",
            ofType: {
                kind: "NON_NULL",
                ofType: {
                    name: "TypeName",
                    kind: "SCALAR",
                },
            },
        };
        const expected: GqlTypeDef = {
            name: "TypeName",
            kind: "SCALAR",
            isNullable: false,
            isList: true,
            isListNullable: true,
        };

        const typeDef = extractTypeInformation(typeSchema);
        expect(typeDef).toStrictEqual(expected);
    });

    it("parses non-nullable list of nullable scalars", () => {
        const typeSchema: IntrospectionNonNullTypeRef<
            IntrospectionListTypeRef<IntrospectionScalarType>
        > = {
            kind: "NON_NULL",
            ofType: {
                kind: "LIST",
                ofType: {
                    name: "TypeName",
                    kind: "SCALAR",
                },
            },
        };
        const expected: GqlTypeDef = {
            name: "TypeName",
            kind: "SCALAR",
            isNullable: true,
            isList: true,
            isListNullable: false,
        };

        const typeDef = extractTypeInformation(typeSchema);
        expect(typeDef).toStrictEqual(expected);
    });
});

describe("makeTypeStrFromDef()", () => {
    it("makes type string for nullable scalar", () => {
        const str = makeTypeStrFromDef({
            name: "String",
            kind: "SCALAR",
            isNullable: true,
            isList: false,
            isListNullable: true,
        });
        expect(str).toEqual("String");
    });

    it("makes type string for non-nullable scalar", () => {
        const str = makeTypeStrFromDef({
            name: "String",
            kind: "SCALAR",
            isNullable: false,
            isList: false,
            isListNullable: true,
        });
        expect(str).toEqual("String!");
    });

    it("makes type string for nullable list of nullable scalars", () => {
        const str = makeTypeStrFromDef({
            name: "String",
            kind: "SCALAR",
            isNullable: true,
            isList: true,
            isListNullable: true,
        });
        expect(str).toEqual("[String]");
    });

    it("makes type string for non-nullable list of nullable scalars", () => {
        const str = makeTypeStrFromDef({
            name: "String",
            kind: "SCALAR",
            isNullable: true,
            isList: true,
            isListNullable: false,
        });
        expect(str).toEqual("[String]!");
    });

    it("makes type string for non-nullable list of non-nullable scalars", () => {
        const str = makeTypeStrFromDef({
            name: "String",
            kind: "SCALAR",
            isNullable: false,
            isList: true,
            isListNullable: false,
        });
        expect(str).toEqual("[String!]!");
    });
});

describe("Introspection.supportsNodeQuery()", () => {
    it("identifies schemas that support the `node` query", () => {
        const result = new Introspection(
            testSchemaWithNode as IntrospectionQuery,
        ).supportsNodeQuery();
        expect(result).toBe(true);
    });

    it("returns false for node fields of wrong type", () => {
        const result = new Introspection(
            testSchemaWithNodeOfWrongType as IntrospectionQuery,
        ).supportsNodeQuery();
        expect(result).toBe(false);
    });

    it("returns false for schema without node field", () => {
        const result = new Introspection(
            testSchemaWithoutNode as IntrospectionQuery,
        ).supportsNodeQuery();
        expect(result).toBe(false);
    });
});

describe("Introspection.doesNodeQuerySupportType()", () => {
    it("returns true for supported type", () => {
        const result = new Introspection(
            testSchemaWithNode as IntrospectionQuery,
        ).doesNodeQuerySupportType("Doctype");
        expect(result).toBe(true);
    });

    it("returns false for unsupported type", () => {
        const result = new Introspection(
            testSchemaWithNode as IntrospectionQuery,
        ).doesNodeQuerySupportType("UnsupportedType");
        expect(result).toBe(false);
    });

    it("returns false for schema without node field", () => {
        const result = new Introspection(
            testSchemaWithoutNode as IntrospectionQuery,
        ).doesNodeQuerySupportType("Doctype");
        expect(result).toBe(false);
    });
});
