import useIntrospection, {
    GqlFieldDef,
    GqlObjectDef,
    Introspection,
    makeTypeStrFromDef,
} from "./introspection";
import { PathSpec } from "./pathSpecs";

class FieldNotFoundError extends Error {}

class ArgNotFoundError extends Error {}

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

interface GqlRequest {
    queryStr: string;
    vars: Record<string, unknown> | null;
}

interface _PathSpecAndGqlObject {
    pathSpec: PathSpec | null;
    parentGqlObject: GqlObjectDef | null;
    gqlObject: GqlObjectDef;
}

export class QueryBuilder {
    introspection: Introspection;

    constructor(introspection: Introspection) {
        this.introspection = introspection;
    }

    _get_parent_objects(pathSpecs: readonly PathSpec[]): _PathSpecAndGqlObject[] {
        const objs: _PathSpecAndGqlObject[] = [
            {
                pathSpec: null,
                parentGqlObject: null,
                gqlObject: this.introspection.getRootObject(),
            },
        ];

        pathSpecs.forEach((spec) => {
            const parentObj = objs[objs.length - 1].gqlObject;
            const field = parentObj.fields.get(spec.fieldName);
            if (!field) {
                throw new FieldNotFoundError();
            }
            objs.push({
                pathSpec: spec,
                parentGqlObject: objs[objs.length - 1].gqlObject,
                gqlObject: this.introspection.getObjectByTypeName(field.type.name),
            });
        });

        return objs;
    }

    /**
     * Construct a query string for the fields that don't require arguments
     * (meaning that they either don't accept arguments or all arguments have
     * default values).
     */
    _makeObjectQuery(object: GqlObjectDef): string {
        const queryFields = [...object.fields.values()].filter(includeFieldInQuery);
        return `{ ${[...queryFields.map((f) => f.name), "__typename"].join(" ")} }`;
    }

    makeFullQuery(parentSpecs: readonly PathSpec[]): GqlRequest {
        const specsAndObjects = this._get_parent_objects(parentSpecs);

        // variable name -> [value, GQL type string]
        const vars: Record<string, [unknown, string]> = {};

        // we'll add to this string as we build the query from inside out
        let queryStr = this._makeObjectQuery(specsAndObjects[specsAndObjects.length - 1].gqlObject);

        // iterate through the objects from the leaf to the root
        let specAndObject: _PathSpecAndGqlObject | undefined;
        while ((specAndObject = specsAndObjects.pop())) {
            const { pathSpec, parentGqlObject } = specAndObject;

            // if we haven't reached the root, add the field name/arguments
            if (pathSpec && parentGqlObject) {
                let fieldStr = pathSpec.fieldName;

                // add args if we have any
                if (pathSpec.args && Object.keys(pathSpec.args).length) {
                    const args = pathSpec.args;

                    // make a list of [arg name, var name] tuples
                    const argAndVarNames = Object.keys(args).map((argName) => {
                        const varNum = Object.keys(vars).length;
                        const varName = `var${String(varNum)}`;

                        // find the argument definition in order to determin the arg's type
                        const field = parentGqlObject.fields.get(pathSpec.fieldName);
                        if (!field) {
                            throw new FieldNotFoundError();
                        }
                        const arg = field.args.find((a) => a.name === argName);
                        if (!arg) {
                            throw new ArgNotFoundError();
                        }

                        // save the value (to return for use in the query) and
                        // the GQL type string (for constructing the query)
                        vars[varName] = [args[argName], makeTypeStrFromDef(arg.type)];
                        return [argName, varName] as const;
                    });

                    // append the args to the field name
                    const argsStr = argAndVarNames
                        .map(([argName, varName]) => `${argName}: $${varName}`)
                        .join(", ");
                    fieldStr = `${fieldStr}(${argsStr})`;
                }

                queryStr = `{ ${fieldStr} ${queryStr} }`;
            }

            // root
            else {
                // add variable definitions
                if (Object.keys(vars).length) {
                    const varDefStr = Object.keys(vars)
                        .map((varName) => {
                            const type = vars[varName][1];
                            return `$${varName}: ${type}`;
                        })
                        .join(", ");
                    queryStr = `(${varDefStr}) ${queryStr}`;
                }
                queryStr = `query ${queryStr}`;
            }
        }

        // Make a new dict mapping variable names to variable values. This will
        // be passed to the GQL query.
        let query_vars: Record<string, unknown> | null = null;
        if (Object.keys(vars).length) {
            query_vars = {};
            for (const varName of Object.keys(vars)) {
                query_vars[varName] = vars[varName][0];
            }
        }
        return { queryStr, vars: query_vars };
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
