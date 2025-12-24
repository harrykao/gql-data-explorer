import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { getIntrospectionQuery } from "graphql";
import {
    IntrospectionInputTypeRef,
    IntrospectionOutputTypeRef,
    IntrospectionQuery,
    IntrospectionObjectType,
    IntrospectionField,
    IntrospectionInputValue,
} from "graphql";

export interface GqlType {
    name: string;
    isNullable: boolean;
    isList: boolean;
}

export interface GqlField {
    name: string;
    type: GqlType;
    requiresArguments: boolean;
}

export interface GqlObject {
    fields: Map<string, GqlField>;
}

class TypeNotFoundError extends Error {}

export class Introspection {
    data: IntrospectionQuery;

    constructor(data: IntrospectionQuery) {
        this.data = data;
    }

    getRootObject(): GqlObject {
        return this.getObjectByTypeName(this.data.__schema.queryType.name);
    }

    getObjectByTypeName(typeName: string): GqlObject {
        const objectType = this._getObjectTypeByName(typeName);
        const fields = objectType.fields.map(this._createFieldStruct, this);
        return {
            fields: new Map(fields.map((f) => [f.name, f])),
        };
    }

    _getObjectTypeByName(typeName: string): IntrospectionObjectType {
        const matchingTypes = this.data.__schema.types.filter<IntrospectionObjectType>(
            (t): t is IntrospectionObjectType => t.kind === "OBJECT" && t.name === typeName,
        );
        if (matchingTypes.length === 0) {
            throw new TypeNotFoundError();
        }
        return matchingTypes[0];
    }

    _extractTypeInformation(
        typeSchema: IntrospectionInputTypeRef | IntrospectionOutputTypeRef,
    ): GqlType {
        const typeInfo =
            typeSchema.kind === "LIST" || typeSchema.kind === "NON_NULL"
                ? this._extractTypeInformation(typeSchema.ofType)
                : {
                      name: "PLACEHOLDER",
                      isNullable: true,
                      isList: false,
                  };

        if (typeSchema.kind === "NON_NULL") {
            typeInfo.isNullable = false;
        } else if (typeSchema.kind === "LIST") {
            typeInfo.isList = true;
        } else {
            typeInfo.name = typeSchema.name;
        }

        return typeInfo;
    }

    _anyArgsRequired(argsSchemas: readonly IntrospectionInputValue[]): boolean {
        for (const arg of argsSchemas) {
            if (!this._extractTypeInformation(arg.type).isNullable && arg.defaultValue == null) {
                return true;
            }
        }
        return false;
    }

    _createFieldStruct(fieldSchema: IntrospectionField): GqlField {
        return {
            name: fieldSchema.name,
            type: this._extractTypeInformation(fieldSchema.type),
            requiresArguments: this._anyArgsRequired(fieldSchema.args),
        };
    }
}

export default function useIntrospection(): Introspection | null {
    const { data } = useQuery<IntrospectionQuery>(gql(getIntrospectionQuery()));

    if (!data) {
        return null;
    }

    console.log(data);
    return new Introspection(data);
}
