import useIntrospection, { GqlObjectDef, Introspection } from "./introspection";

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
    makeObjectQuery(object: GqlObjectDef): string | null {
        const queryFields = [...object.fields.values()].filter(
            (f) => !f.requiresArguments && !f.type.isList && !(f.type.kind === "OBJECT"),
        );
        return queryFields.length ? `{ ${queryFields.map((f) => f.name).join(" ")} }` : null;
    }

    makeFullQuery(parentSpecs: readonly string[], target: GqlObjectDef): string | null {
        const parentSpecsCopy = [...parentSpecs];
        let query = this.makeObjectQuery(target);

        if (!query) {
            return null;
        }

        while (parentSpecsCopy.length) {
            const parentSpec = parentSpecsCopy.pop();
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
