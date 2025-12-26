import useIntrospection, { GqlFieldDef, GqlObjectDef, Introspection } from "./introspection";
import { PathSpec } from "./pathSpecs";

function includeFieldInQuery(field: GqlFieldDef): boolean {
    if (field.requiresArguments) {
        return false;
    }
    if (field.type.kind === "OBJECT") {
        return false;
    }
    if (field.type.isList && field.type.kind !== "SCALAR") {
        return false;
    }
    return true;
}

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
        const queryFields = [...object.fields.values()].filter(includeFieldInQuery);
        return queryFields.length ? `{ ${queryFields.map((f) => f.name).join(" ")} }` : null;
    }

    makeFullQuery(parentSpecs: readonly PathSpec[], target: GqlObjectDef): string | null {
        const parentSpecsCopy = [...parentSpecs];
        let query = this.makeObjectQuery(target);

        if (!query) {
            return null;
        }

        while (parentSpecsCopy.length) {
            const parentSpec = parentSpecsCopy.pop();
            query = `{ ${parentSpec?.fieldName} ${query} }`;
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
