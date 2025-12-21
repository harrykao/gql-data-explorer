import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const QUERY = gql`
  query {
    __schema {
      queryType {
        name
        fields(includeDeprecated: true) {
          name
          description
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
          args {
            name
            description
            type {
              name
              kind
            }
          }
        }
      }
      types {
        name
      }
    }
  }
`

function App() {
  const { loading, error, data } = useQuery(QUERY);

  if (!data) {
    return <div />
  }

  return (
    <>
      {data.__schema.queryType.fields.map(f => (<div key={f.name}>{f.name}</div>))}
    </>
  )
}

export default App
