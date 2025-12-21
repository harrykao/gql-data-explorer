import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import useIntrospection from "./introspection"

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

function findTypeName(type) {
  if (type.name) {
    return type.name
  } else {
    return findTypeName(type.ofType)
  }
}

function App() {

  const schema = useIntrospection()
  const params = useParams({ strict: false })

  const rootFieldName = params.rootField
  const { data: fieldData } = useQuery(makeQueryGql(rootFieldName) || "", {skip: !rootFieldName});

  if (!schema) {
    return <div />
  }

  if (params.rootField) {

    let objectName = ""

    for (const f of schema.data.__schema.queryType.fields) {
      if (f.name === params.rootField) {
        objectName = findTypeName(f.type)
      }
    }

    for (const t of schema.data.__schema.types) {
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
        {schema.getRootFields().map(f => {
          if (f.requiresArguments) {
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
