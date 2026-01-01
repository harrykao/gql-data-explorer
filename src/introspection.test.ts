import {
    IntrospectionListTypeRef,
    IntrospectionNonNullTypeRef,
    IntrospectionScalarType,
} from "graphql";
import { GqlTypeDef, extractTypeInformation } from "./introspection";

describe("extractTypeInformation", () => {
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
