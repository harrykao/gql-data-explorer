import { beforeEach, describe, expect, it } from "vitest";
import { Introspection } from "./introspection";
import { PathSpec } from "./pathSpecs";
import { QueryBuilder } from "./queryBuilder";
import { getTestSchema, NODE_SCHEMA, QUERY_BUILDER_TEST_SCHEMA } from "./test_schemas/testSchemas";

describe("makes query", () => {
    let introspection: Introspection;
    let queryBuilder: QueryBuilder;

    beforeEach(() => {
        const schema = getTestSchema(QUERY_BUILDER_TEST_SCHEMA);
        introspection = new Introspection(schema);
        queryBuilder = new QueryBuilder(introspection);
    });

    it("queries root object", () => {
        const { request } = queryBuilder.makeFullQuery([], null, null);
        expect(request).toEqual({
            queryStr: "query { __typename }",
            vars: null,
        });
    });

    it("queries simple object", () => {
        const { request } = queryBuilder.makeFullQuery(
            [new PathSpec("rootField", null, null)],
            null,
            null,
        );
        expect(request).toEqual({
            queryStr: "query { rootField { stringField __typename } }",
            vars: null,
        });
    });

    it("handles arguments", () => {
        const { request } = queryBuilder.makeFullQuery(
            [new PathSpec("rootField", { foo: "bar", bar: "baz" }, null)],
            null,
            null,
        );
        expect(request).toEqual({
            queryStr:
                "query ($var0: ID!, $var1: String) { rootField(foo: $var0, bar: $var1) { stringField __typename } }",
            vars: { var0: "bar", var1: "baz" },
        });
    });

    describe("with node query", () => {
        beforeEach(() => {
            introspection = new Introspection(getTestSchema(NODE_SCHEMA));
            queryBuilder = new QueryBuilder(introspection);
        });

        it("uses inline fragment on node query", () => {
            const { request } = queryBuilder.makeFullQuery(
                [new PathSpec("node", { id: "NODE_ID" }, null)],
                "MyType",
                null,
            );
            expect(request).toEqual({
                queryStr:
                    "query ($var0: ID!) { node(id: $var0) { ... on MyType { id pk __typename } } }",
                vars: { var0: "NODE_ID" },
            });
        });
    });
});
