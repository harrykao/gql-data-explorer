import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { getIntrospectionQuery } from "graphql";
import { Config, Field, View } from "./configuration";
import useIntrospection, {
    GqlFieldDef,
    GqlObjectDef,
    Introspection,
    makeTypeStrFromDef,
} from "./introspection";
import { PathSpec } from "./pathSpecs";

class FieldNotFoundError extends Error {}

class ArgNotFoundError extends Error {}

class TargetDataNotFoundError extends Error {}

class MissingNodeTypeError extends Error {}

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

function makeIdentityView(gqlObject: GqlObjectDef): View {
    const fieldConfigs: Field[] = [];
    gqlObject.fields.forEach((field, name) => {
        fieldConfigs.push({ path: [name], displayName: name });
    });
    return {
        objectName: gqlObject.name,
        fields: fieldConfigs,
    };
}

interface GqlRequest {
    queryStr: string;
    vars: Record<string, unknown> | null;
}

/**
 * A GQL query identifies the subset of the object graph that should be fetched. We'll model the
 * query in memory as a graph. Each node knows how to serialize itself to a string, and these
 * strings can be composed to obtain the entire GQL query.
 */
class QueryNode {
    /**
     * PathSpec corresponding to this node.
     *
     * Qualifiers like arguments and the array index are obtained from the PathSpec.
     *
     * This will be null for the root object.
     */
    pathSpec: PathSpec;

    /**
     * Object definition for this node, if it corresponds to a GQL object.
     */
    gqlObject: GqlObjectDef | null;

    /**
     * Object definition for the parent.
     *
     * Needed to look up field definitions to get the types that are used when declaring variables.
     *
     * This will be null for the root object.
     */
    parentGqlObject: GqlObjectDef;

    /**
     * The type when this frame corresponds to the node query.
     *
     * This will be null for all non-node fields.
     */
    nodeType: string | null;

    children: QueryNode[];

    constructor(
        pathSpec: PathSpec,
        gqlObject: GqlObjectDef | null,
        parentGqlObject: GqlObjectDef,
        nodeType: string | null,
    ) {
        this.pathSpec = pathSpec;
        this.gqlObject = gqlObject;
        this.parentGqlObject = parentGqlObject;
        this.nodeType = nodeType;
        this.children = [];
    }

    toGqlString(vars: Record<string, { value: unknown; gqlTypeStr: string }>): string {
        // set the GQL string to the field name to start; we may modify this later
        let gqlStr = this.pathSpec.fieldName;

        // add args if we have any
        if (this.pathSpec.args && Object.keys(this.pathSpec.args).length) {
            const args = this.pathSpec.args;

            // make a list of [arg name, var name] tuples
            const argAndVarNames = Object.keys(args).map((argName) => {
                const varNum = Object.keys(vars).length;
                const varName = `var${String(varNum)}`;

                // find the argument definition in order to determin the arg's type
                const field = this.parentGqlObject.fields.get(this.pathSpec.fieldName);
                if (!field) {
                    throw new FieldNotFoundError(this.pathSpec.fieldName);
                }
                const arg = field.args.find((a) => a.name === argName);
                if (!arg) {
                    throw new ArgNotFoundError();
                }

                // save the value (to return for use in the query) and the GQL type string (for
                // constructing the query)
                vars[varName] = {
                    value: args[argName],
                    gqlTypeStr: makeTypeStrFromDef(arg.type),
                };
                return [argName, varName] as const;
            });

            // append the args to the field name
            const argsStr = argAndVarNames
                .map(([argName, varName]) => `${argName}: $${varName}`)
                .join(", ");
            gqlStr = `${gqlStr}(${argsStr})`;
        }

        // If there are children, serialize them and wrap in braces. How this gets appended to the
        // GQL string depends on whether we're doing a Node query. (Since the Node interface is a
        // union of multiple types, we use an inline fragment.)
        const childGql = this.children.length
            ? `{ ${this.children.map((c) => c.toGqlString(vars)).join(" ")} }`
            : null;

        if (this.nodeType) {
            return `${gqlStr} { ... on ${this.nodeType} ${childGql ?? ""} }`;
        } else {
            return childGql ? `${gqlStr} ${childGql}` : gqlStr;
        }
    }
}

/**
 * The root of a query tree.
 */
class QueryTree {
    children: QueryNode[];

    constructor(children: QueryNode[]) {
        this.children = children;
    }

    toGqlRequest(): GqlRequest {
        // keep track of variables that we're using in the query
        const vars: Record<string, { value: unknown; gqlTypeStr: string }> = {};

        let queryStr = `{ ${this.children.map((c) => c.toGqlString(vars)).join(" ")} }`;

        // Make a new dict mapping variable names to variable values. This will
        // be passed to the GQL query.
        let query_vars: Record<string, unknown> | null = null;
        if (Object.keys(vars).length) {
            query_vars = {};
            for (const varName of Object.keys(vars)) {
                query_vars[varName] = vars[varName].value;
            }
        }

        // add variable definitions
        if (Object.keys(vars).length) {
            const varDefStr = Object.keys(vars)
                .map((varName) => {
                    const type = vars[varName].gqlTypeStr;
                    return `$${varName}: ${type}`;
                })
                .join(", ");
            queryStr = `(${varDefStr}) ${queryStr}`;
        }
        queryStr = `query ${queryStr}`;

        return { queryStr, vars: query_vars };
    }
}

export class QueryBuilder {
    introspection: Introspection;

    constructor(introspection: Introspection) {
        this.introspection = introspection;
    }

    _make_predecessor_query_tree(
        pathSpecs: readonly PathSpec[],
        nodeType: string | null,
    ): {
        queryTree: QueryTree;
        targetQueryObject: QueryNode | QueryTree;
        targetGqlObject: GqlObjectDef;
    } {
        const queryNodes: QueryNode[] = [];

        // The GQL object corresponding to the frame that we just added to the array. When we're
        // done iterating through the path specs, this will be the ultimate object that we're
        // querying.
        let currentGqlObject = this.introspection.getRootObject();

        pathSpecs.forEach((spec, i) => {
            let newNode: QueryNode;
            let newGqlObject: GqlObjectDef;

            // node query
            if (i === 0 && spec.fieldName === "node" && this.introspection.supportsNodeQuery()) {
                if (nodeType === null) {
                    throw new MissingNodeTypeError();
                }

                newGqlObject = this.introspection.getObjectByTypeName(nodeType);
                newNode = new QueryNode(spec, newGqlObject, currentGqlObject, nodeType);
            }

            // everything else
            else {
                const field = currentGqlObject.fields.get(spec.fieldName);
                if (!field) {
                    throw new FieldNotFoundError(spec.fieldName);
                }

                newGqlObject = this.introspection.getObjectByTypeName(field.type.name);
                newNode = new QueryNode(spec, newGqlObject, currentGqlObject, null);
            }

            if (queryNodes.length) {
                queryNodes[queryNodes.length - 1].children.push(newNode);
            }

            queryNodes.push(newNode);
            currentGqlObject = newGqlObject;
        });

        const queryTree = new QueryTree(queryNodes.length ? [queryNodes[0]] : []);

        return {
            queryTree,
            targetQueryObject: queryNodes.length ? queryNodes[queryNodes.length - 1] : queryTree,
            targetGqlObject: currentGqlObject,
        };
    }

    _make_query_tree(
        parentSpecs: readonly PathSpec[],
        nodeType: string | null,
        config: Config,
    ): { queryTree: QueryTree; targetGqlObject: GqlObjectDef; view: View } {
        const { queryTree, targetQueryObject, targetGqlObject } = this._make_predecessor_query_tree(
            parentSpecs,
            nodeType,
        );

        // see if there's a matching view
        const viewsByObjectName = new Map<string, View>();
        config.views.forEach((v) => {
            viewsByObjectName.set(v.objectName, v);
        });
        const view: View =
            viewsByObjectName.get(targetGqlObject.name) ?? makeIdentityView(targetGqlObject);

        // We need to create nodes for the queryable fields on the current object. These should be
        // added to the innermost `QueryNode` if one exists, or the `QueryTree` otherwise. (In the
        // latter case we must be querying the root object.)
        view.fields.forEach((f) => {
            const gqlField = targetGqlObject.fields.get(f.path[0]);
            if (gqlField && includeFieldInQuery(gqlField)) {
                targetQueryObject.children.push(
                    new QueryNode(
                        new PathSpec(f.path[f.path.length - 1], null, null),
                        null,
                        targetGqlObject,
                        null,
                    ),
                );
            }
        });
        targetQueryObject.children.push(
            new QueryNode(new PathSpec("__typename", null, null), null, targetGqlObject, null),
        );

        return { queryTree, targetGqlObject, view };
    }

    makeFullQuery(
        parentSpecs: readonly PathSpec[],
        nodeType: string | null,
        config: Config,
    ): { request: GqlRequest; targetObject: GqlObjectDef; view: View } {
        const {
            queryTree,
            targetGqlObject: targetObject,
            view,
        } = this._make_query_tree(parentSpecs, nodeType, config);
        return { request: queryTree.toGqlRequest(), targetObject, view };
    }
}

export default function useTargetObjectData(
    pathSpecs: PathSpec[],
    config: Config,
): {
    targetObject: GqlObjectDef;
    targetData: unknown;
    view: View;
} | null {
    const introspection = useIntrospection();

    // Figure out if we're starting from the root `node` field. This will be the case if the query
    // looks like this: { node(id: ID!) { ... } }
    const isNodeQuery = introspection
        ? introspection.supportsNodeQuery() &&
          pathSpecs.length >= 1 &&
          pathSpecs[0].fieldName === "node" &&
          pathSpecs[0].args?.id !== undefined
        : null;

    // If we're doing a node query, we need to determine the object type. (Which of the union of
    // Node types does this ID point to?)
    const { data: nodeTypeData } = useQuery(
        gql(`query ($id: ID!) { node(id: $id) { __typename } }`),
        { skip: !isNodeQuery, variables: { id: pathSpecs[0]?.args?.id } },
    );

    // We're ready to query the target object if:
    const readyToQueryTargetObject =
        introspection && // we've performed the introspection query
        isNodeQuery !== null && // we've determined whether this is a node query
        !(isNodeQuery && !nodeTypeData); // we're not waiting for the node type if it's a node query

    // Extract the object type if we're doing a node query. This will be null if (1) we're not
    // doing a node query or (2) we haven't yet finished the query that tells us the object type.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    const nodeType: string | null = nodeTypeData ? (nodeTypeData as any).node.__typename : null;

    const queryBuilder = introspection ? new QueryBuilder(introspection) : null;
    const {
        request: gqlQueryRequest,
        targetObject,
        view,
    } = readyToQueryTargetObject && queryBuilder
        ? queryBuilder.makeFullQuery(pathSpecs, nodeType, config)
        : { request: null, targetObject: null };

    const { data: fullData } = useQuery(
        gql(gqlQueryRequest ? gqlQueryRequest.queryStr : getIntrospectionQuery()),
        { skip: !targetObject, variables: gqlQueryRequest?.vars ?? undefined },
    );

    if (!(targetObject && fullData)) {
        return null;
    }

    let targetData = fullData;

    pathSpecs.forEach((spec) => {
        if (typeof targetData === "object" && !Array.isArray(targetData)) {
            const tmp: unknown = targetData[spec.fieldName];
            if (typeof tmp == "object" && tmp !== null) {
                targetData = tmp;
            } else {
                throw new TargetDataNotFoundError();
            }
        } else {
            throw new TargetDataNotFoundError();
        }

        if (spec.arrayIndex !== null) {
            if (Array.isArray(targetData)) {
                const tmp: unknown = targetData[spec.arrayIndex];
                if (typeof tmp == "object" && tmp !== null) {
                    targetData = tmp;
                } else {
                    throw new TargetDataNotFoundError();
                }
            } else {
                throw new TargetDataNotFoundError();
            }
        }
    });

    return { targetObject, targetData, view };
}
