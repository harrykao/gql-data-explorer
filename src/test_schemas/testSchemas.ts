import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphqlSync, IntrospectionQuery } from "graphql";

export const NO_NODE_SCHEMA = `
    type Query {
        foo: String
    }
`;

export const NODE_SCHEMA = `
    type Query {
        node(id: ID!): Node
    }
    
    interface Node {
        id: ID!
    }

    type MyType implements Node {
        id: ID!
        # The primary key.
        pk: String!
    }
`;

export const NODE_OF_WRONG_TYPE_SCHEMA = `
    type Query {
        node(id: ID!): String
    }
`;

export const QUERY_BUILDER_TEST_SCHEMA = `
    type Query {
        rootField(foo: ID!, bar: String): SimpleObject
    }

    type SimpleObject {
        stringField: String!
    }

    input SimpleInput {
        nullableString: String
        nullableListOfNullableStrings: [String]
        nonNullableListOfNonNullableStrings: [String!]!
    }
`;

// Apollo automatically inserts `__typename` fields and it'll behave weirdly if the response
// doesn't include them. They're not part of the standard introspection query so, to make our test
// mocks work, we'll copy the introspection query and insert `__typename` manually.
const INTROSPECTION_QUERY_WITH_TYPENAMES = /* GraphQL */ `
    query IntrospectionQuery {
        __schema {
            __typename
            queryType {
                __typename
                name
                kind
            }
            mutationType {
                __typename
                name
                kind
            }
            subscriptionType {
                __typename
                name
                kind
            }
            types {
                ...FullType
            }
            directives {
                __typename
                name
                description
                locations
                args {
                    ...InputValue
                }
            }
        }
    }

    fragment FullType on __Type {
        __typename
        kind
        name
        description
        fields(includeDeprecated: true) {
            __typename
            name
            description
            args {
                ...InputValue
            }
            type {
                ...TypeRef
            }
            isDeprecated
            deprecationReason
        }
        inputFields {
            ...InputValue
        }
        interfaces {
            ...TypeRef
        }
        enumValues(includeDeprecated: true) {
            __typename
            name
            description
            isDeprecated
            deprecationReason
        }
        possibleTypes {
            ...TypeRef
        }
    }

    fragment InputValue on __InputValue {
        __typename
        name
        description
        type {
            ...TypeRef
        }
        defaultValue
    }

    fragment TypeRef on __Type {
        __typename
        kind
        name
        ofType {
            __typename
            kind
            name
            ofType {
                __typename
                kind
                name
                ofType {
                    __typename
                    kind
                    name
                    ofType {
                        __typename
                        kind
                        name
                        ofType {
                            __typename
                            kind
                            name
                            ofType {
                                __typename
                                kind
                                name
                                ofType {
                                    __typename
                                    kind
                                    name
                                    ofType {
                                        __typename
                                        kind
                                        name
                                        ofType {
                                            __typename
                                            kind
                                            name
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

export function getTestSchema(typeDefs: string): IntrospectionQuery {
    const schema = makeExecutableSchema({ typeDefs });
    const result = graphqlSync({
        schema: schema,
        // source: getIntrospectionQuery(),
        source: INTROSPECTION_QUERY_WITH_TYPENAMES,
    });

    return result.data as unknown as IntrospectionQuery;
}
