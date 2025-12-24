import useIntrospection, { Introspection, GqlObject } from "./introspection";

export class QueryBuilder {
    introspection: Introspection;

    constructor(introspection: Introspection) {
        this.introspection = introspection;
    }

    /**
     * Construct a query string for the fields that don't require arguments
     * (meaning that they either don't accept arguments or all arguments have
     * default values).
     */
    makeObjectQuery(object: GqlObject): string | null {
        const queryFields = [...object.fields.values()].filter(
            (f) => !f.requiresArguments && !f.type.isList,
        );
        return queryFields.length ? `{ ${queryFields.map((f) => f.name).join(" ")} }` : null;
    }

    makeFullQuery(parentSpecs: string[], target: GqlObject): string | null {
        let query = this.makeObjectQuery(target);

        if (!query) {
            return null;
        }

        while (parentSpecs.length) {
            const parentSpec = parentSpecs.pop();
            query = `{ ${parentSpec} ${query} }`;
        }

        return query;
    }
}

export default function useQueryBuilder(): {
    introspection: Introspection | null;
    queryBuilder: QueryBuilder | null;
} {
    const introspection = useIntrospection();

    if (!introspection) {
        return { introspection: null, queryBuilder: null };
    }

    return { introspection: introspection, queryBuilder: new QueryBuilder(introspection) };
}
