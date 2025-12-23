import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { getIntrospectionQuery } from 'graphql';
import { IntrospectionQuery, IntrospectionObjectType } from 'graphql';

export interface GqlType {
    name: string
    isNullable: boolean
    isList: boolean
}

export interface GqlField {
    name: string
    type: GqlType
    requiresArguments: boolean
}

export interface GqlObject {
    fields: Map<string, GqlField>
}

class TypeNotFoundError extends Error {}

class FieldNotFoundError extends Error {}

export class Introspection {

    data: IntrospectionQuery

    constructor(data: IntrospectionQuery) {
        this.data = data
    }

    getRootObject(): GqlObject {
        return this.getObjectByTypeName(this.data.__schema.queryType.name)
    }

    getObjectByTypeName(typeName: string): GqlObject {
        const objectType = this._getObjectTypeByName(typeName)
        const fields = objectType.fields.map(this._createFieldStruct, this)
        return {
            fields: new Map(fields.map(f => [f.name, f]))
        }
    }

    _getObjectTypeByName(typeName: string): IntrospectionObjectType {
        const matchingTypes = this.data.__schema.types.filter<IntrospectionObjectType>(
          (t): t is IntrospectionObjectType => (t.kind === "OBJECT") && (t.name === typeName)
        )
        if (matchingTypes.length === 0) {
            throw new TypeNotFoundError()
        }
        return matchingTypes[0]
    }

    _extractTypeInformation(typeSchema: any): GqlType {

        const typeInfo = (typeSchema.ofType === null) ? {
            name: "PLACEHOLDER",
            isNullable: true,
            isList: false,
        } : this._extractTypeInformation(typeSchema.ofType)

        if (typeSchema.kind === "NON_NULL") {
            typeInfo.isNullable = false
        } else if (typeSchema.kind === "LIST") {
            typeInfo.isList = true
        }

        if (typeSchema.name) {
            typeInfo.name = typeSchema.name
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

    _createFieldStruct(fieldSchema: any): GqlField {
        return {
            name: fieldSchema.name,
            type: this._extractTypeInformation(fieldSchema.type),
            requiresArguments: this._anyArgsRequired(fieldSchema.args)
        }
    }
}

export default function useIntrospection(): Introspection | null {

    const { data } = useQuery<IntrospectionQuery>(gql(getIntrospectionQuery()));

    if (!data) {
        return null
    }

    console.log(data)
    return new Introspection(data)
}