import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

const INTROSPECTION_QUERY = gql`
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

function makeQueryGql(fieldName) {
  return gql`
    query {
      ${fieldName} {
        code
        name
      }
    }
  `
}

function fieldRequiresInputs(field) {
  for (const arg of field.args) {
    if ((arg.type.kind === "NON_NULL") && (arg.defaultVaule == null)) {
      return true
    }
  }
  return false
}

function findTypeName(type) {
  if (type.name) {
    return type.name
  } else {
    return findTypeName(type.ofType)
  }
}

function App() {
  const { data: introspectionData } = useQuery(INTROSPECTION_QUERY);
  const params = useParams({ strict: false })

  const rootFieldName = params.rootField
  const { data: fieldData } = useQuery(makeQueryGql(rootFieldName) || "", {skip: !rootFieldName});

  if (!introspectionData) {
    return <div />
  }

  if (params.rootField) {

    let objectName = ""

    for (const f of introspectionData.__schema.queryType.fields) {
      if (f.name === params.rootField) {
        objectName = findTypeName(f.type)
      }
    }

    for (const t of introspectionData.__schema.types) {
      if (t.name === objectName) {
        console.log(t)
      }
    }
  }

  if (fieldData) {
    console.log(fieldData)
  }

  if (!rootFieldName) {
    return (
      <>
        {introspectionData.__schema.queryType.fields.map(f => {
          if (fieldRequiresInputs(f)) {
            return <div key={f.name}>{f.name}</div>
          } else {
            return <div key={f.name}><Link to={`/${f.name}`}>{f.name}</Link></div>
          }
        })}
      </>
    )
  } else if (fieldData) {
    return <>{fieldData[rootFieldName].map(item => <div key={item.code}>{item.code} {item.name}</div>)}</>
  }
}

export default App
