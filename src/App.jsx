import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const QUERY = gql`
  query IntrospectionQuery {
    __schema {
      queryType {
        ...FullType
      }
      mutationType {
        name
      }
      subscriptionType {
        name
      }
      types {
        ...FullType
      }
      directives {
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
    kind
    name
    description
    fields(includeDeprecated: true) {
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
    name
    description
    type {
      ...TypeRef
    }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
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
`

function fieldRequiresInputs(field) {
  for (const arg of field.args) {
    if ((arg.type.kind === "NON_NULL") && (arg.defaultVaule == null)) {
      return true
    }
  }
  return false
}

function App() {
  const { loading, error, data } = useQuery(QUERY);

  if (!data) {
    return <div />
  }

  return (
    <>
      {data.__schema.queryType.fields.map(f => {
        if (fieldRequiresInputs(f)) {
          return <div key={f.name}>{f.name}</div>
        } else {
          return <div key={f.name}>{f.name} (callable)</div>
        }
      })}
    </>
  )
}

export default App
