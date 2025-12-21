import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

const _INTROSPECTION_QUERY = gql`
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

interface TypeInfo {
    scalarTypeName: string
    isNullable: boolean
    isList: boolean
}

interface Field {
    name: string
    scalarTypeName: string
    isNullable: boolean
    isList: boolean
    requiresArguments: boolean
}

class Schema {

    data: any

    constructor(data: any) {
        this.data = data
    }

    getRootFields(): Field[] {
        return this.data.__schema.queryType.fields.map(this._createFieldStruct, this)
    }

    _extractTypeInformation(typeSchema: any): TypeInfo {

        const typeInfo = (typeSchema.ofType === null) ? {
            scalarTypeName: "PLACEHOLDER",
            isNullable: true,
            isList: false,
        } : this._extractTypeInformation(typeSchema.ofType)

        if (typeSchema.kind === "NON_NULL") {
            typeInfo.isNullable = false
        } else if (typeSchema.kind === "LIST") {
            typeInfo.isList = true
        }

        if (typeSchema.name) {
            typeInfo.scalarTypeName = typeSchema.name
        }

        return typeInfo
    }

    _anyArgsRequired(argsSchemas: any): boolean {
        for (const arg of argsSchemas) {
            if ((!this._extractTypeInformation(arg.type).isNullable) && (arg.defaultVaule == null)) {
                return true
            }
        }
        return false
    }

    _createFieldStruct(fieldSchema: any): Field {
        return {
            name: fieldSchema.name,
            ...this._extractTypeInformation(fieldSchema.type),
            requiresArguments: this._anyArgsRequired(fieldSchema.args)
        }
    }
}

export default function useIntrospection(): Schema | null {

    const { data } = useQuery(_INTROSPECTION_QUERY);

    if (!data) {
        return null
    }

    return new Schema(data)
}