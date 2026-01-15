import { IntrospectionQuery } from "graphql";
import { beforeEach, describe, expect, it } from "vitest";
import { Introspection } from "./introspection";
import { PathSpec } from "./pathSpecs";
import { QueryBuilder } from "./queryBuilder";
import introspection_data from "./test_schemas/introspection_data.json";
import with_node_introspection_data from "./test_schemas/with_node.json";

describe("makes query", () => {
    let introspection: Introspection;
    let queryBuilder: QueryBuilder;

    beforeEach(() => {
        introspection = new Introspection(introspection_data as IntrospectionQuery);
        queryBuilder = new QueryBuilder(introspection);
    });

    it("queries simple object", () => {
        const { request } = queryBuilder.makeFullQuery([new PathSpec("rootField", null, null)]);
        expect(request).toEqual({
            queryStr: "query { rootField { stringField __typename } }",
            vars: null,
        });
    });

    it("handles arguments", () => {
        const { request } = queryBuilder.makeFullQuery([
            new PathSpec("rootField", { foo: "bar", bar: "baz" }, null),
        ]);
        expect(request).toEqual({
            queryStr:
                "query ($var0: ID!, $var1: String) { rootField(foo: $var0, bar: $var1) { stringField __typename } }",
            vars: { var0: "bar", var1: "baz" },
        });
    });

    describe("with node query", () => {
        beforeEach(() => {
            introspection = new Introspection(with_node_introspection_data as IntrospectionQuery);
            queryBuilder = new QueryBuilder(introspection);
        });

        it("uses inline fragment on node query", () => {
            const { request } = queryBuilder.makeFullQuery(
                [new PathSpec("node", { id: "NODE_ID" }, null)],
                "Doctype",
            );
            expect(request).toEqual({
                queryStr:
                    "query ($var0: ID!) { node(id: $var0) { ... on Doctype { id pk __typename } } }",
                vars: { var0: "NODE_ID" },
            });
        });
    });
});
