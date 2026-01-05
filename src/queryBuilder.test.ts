import { IntrospectionQuery } from "graphql";
import { beforeEach, describe, expect, it } from "vitest";
import introspection_data from "../.storybook/introspection_data.json";
import { Introspection } from "./introspection";
import { PathSpec } from "./pathSpecs";
import { QueryBuilder } from "./queryBuilder";

describe("makes query", () => {
    let introspection: Introspection;
    let queryBuilder: QueryBuilder;

    beforeEach(() => {
        introspection = new Introspection(introspection_data as IntrospectionQuery);
        queryBuilder = new QueryBuilder(introspection);
    });

    it("queries simple object", () => {
        const query = queryBuilder.makeFullQuery([new PathSpec("rootField", null, null)]);
        expect(query).toEqual({
            queryStr: "query { rootField { stringField __typename } }",
            vars: null,
        });
    });

    it("handles arguments", () => {
        const query = queryBuilder.makeFullQuery([
            new PathSpec("rootField", { foo: "bar", bar: "baz" }, null),
        ]);
        expect(query).toEqual({
            queryStr:
                "query ($var0: ID!, $var1: String) { rootField(foo: $var0, bar: $var1) { stringField __typename } }",
            vars: { var0: "bar", var1: "baz" },
        });
    });
});
