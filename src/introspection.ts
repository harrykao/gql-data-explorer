import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
    getIntrospectionQuery,
    IntrospectionField,
    IntrospectionInputObjectType,
    IntrospectionInputTypeRef,
    IntrospectionInputValue,
    IntrospectionObjectType,
    IntrospectionOutputTypeRef,
    IntrospectionQuery,
    IntrospectionType,
} from "graphql";

export interface GqlTypeDef {
    name: string;
    kind: IntrospectionType["kind"];
    isNullable: boolean;
    isList: boolean;
    isListNullable: boolean;
}

export interface GqlArgumentDef {
    name: string;
    description: string | null;
    type: GqlTypeDef;
    defaultValue: string | null;
}

export interface GqlFieldDef {
    name: string;
    description: string | null;
    type: GqlTypeDef;
    args: readonly GqlArgumentDef[];
    requiresArguments: boolean;
}

export interface GqlObjectDef {
    description: string | null;
    fields: Map<string, GqlFieldDef>;
}

export interface GqlInputFieldDef {
    name: string;
    description: string | null;
    type: GqlTypeDef;
    defaultValue: string | null;
}

export interface GqlInputObjectDef {
    description: string | null;
    inputFields: Map<string, GqlInputFieldDef>;
}

class TypeNotFoundError extends Error {}

export class Introspection {
    data: IntrospectionQuery;

    constructor(data: IntrospectionQuery) {
        this.data = data;
    }

    getRootObject(): GqlObjectDef {
        return this.getObjectByTypeName(this.data.__schema.queryType.name);
    }

    getObjectByTypeName(typeName: string): GqlObjectDef {
        const objectType = this._getObjectTypeByName(typeName);
        const fields = objectType.fields.map(createFieldStruct);
        return {
            description: objectType.description ?? null,
            fields: new Map(fields.map((f) => [f.name, f])),
        };
    }

    _getObjectTypeByName(typeName: string): IntrospectionObjectType {
        const matchingTypes = this.data.__schema.types.filter<IntrospectionObjectType>(
            (t): t is IntrospectionObjectType => t.kind === "OBJECT" && t.name === typeName,
        );
        if (matchingTypes.length === 0) {
            throw new TypeNotFoundError(typeName);
        }
        return matchingTypes[0];
    }

    getInputObjectByTypeName(typeName: string): GqlInputObjectDef {
        const objectType = this._getInputObjectTypeByName(typeName);
        const fields = objectType.inputFields.map(createInputFieldStruct);
        return {
            description: objectType.description ?? null,
            inputFields: new Map(fields.map((f) => [f.name, f])),
        };
    }

    _getInputObjectTypeByName(typeName: string): IntrospectionInputObjectType {
        const matchingTypes = this.data.__schema.types.filter<IntrospectionInputObjectType>(
            (t): t is IntrospectionInputObjectType =>
                t.kind === "INPUT_OBJECT" && t.name === typeName,
        );
        if (matchingTypes.length === 0) {
            throw new TypeNotFoundError(typeName);
        }
        return matchingTypes[0];
    }

    supportsNodeQuery(): boolean {
        const rootObject = this.getRootObject();
        const nodeField = rootObject.fields.get("node");
        return !!nodeField && nodeField.type.name === "Node";
    }

    doesNodeQuerySupportType(typeName: string): boolean {
        if (!this.supportsNodeQuery()) {
            return false;
        }

        // see if `typeName` matches any of the possible `Node` types
        for (const dataType of this.data.__schema.types) {
            if (dataType.kind === "INTERFACE" && dataType.name === "Node") {
                for (const possibleType of dataType.possibleTypes) {
                    if (possibleType.name === typeName) {
                        return true;
                    }
                }
            }
        }

        return false;
    }
}

function createFieldStruct(fieldSchema: IntrospectionField): GqlFieldDef {
    return {
        name: fieldSchema.name,
        description: fieldSchema.description ?? null,
        type: extractTypeInformation(fieldSchema.type),
        args: fieldSchema.args.map(extractArgInformation),
        requiresArguments: anyArgsRequired(fieldSchema.args),
    };
}

function createInputFieldStruct(fieldSchema: IntrospectionInputValue): GqlInputFieldDef {
    return {
        name: fieldSchema.name,
        description: fieldSchema.description ?? null,
        type: extractTypeInformation(fieldSchema.type),
        defaultValue: fieldSchema.defaultValue ?? null,
    };
}

function extractArgInformation(argSchema: IntrospectionInputValue): GqlArgumentDef {
    return {
        name: argSchema.name,
        description: argSchema.description ?? null,
        type: extractTypeInformation(argSchema.type),
        defaultValue: argSchema.defaultValue ?? null,
    };
}

function anyArgsRequired(argsSchemas: readonly IntrospectionInputValue[]): boolean {
    for (const arg of argsSchemas) {
        if (!extractTypeInformation(arg.type).isNullable && arg.defaultValue == null) {
            return true;
        }
    }
    return false;
}

/**
 * Flatten the recursive `type` object.
 *
 * https://stackoverflow.com/a/59128416
 */
export function extractTypeInformation(
    typeSchema: IntrospectionInputTypeRef | IntrospectionOutputTypeRef,
): GqlTypeDef {
    return extractTypeInformationRecursive(typeSchema)[0];
}

function extractTypeInformationRecursive(
    typeSchema: IntrospectionInputTypeRef | IntrospectionOutputTypeRef,
): [GqlTypeDef, "TERMINAL_TYPE" | "LIST"] {
    if (typeSchema.kind !== "LIST" && typeSchema.kind !== "NON_NULL") {
        return [
            {
                name: typeSchema.name,
                kind: typeSchema.kind,
                isNullable: true,
                isList: false,
                isListNullable: true,
            },
            "TERMINAL_TYPE",
        ];
    }

    const [typeDef, _wrappedType] = extractTypeInformationRecursive(typeSchema.ofType);
    let wrappedType = _wrappedType;

    switch (typeSchema.kind) {
        case "NON_NULL":
            if (wrappedType === "TERMINAL_TYPE") {
                typeDef.isNullable = false;
            } else {
                typeDef.isListNullable = false;
            }
            break;
        case "LIST":
            typeDef.isList = true;
            wrappedType = "LIST";
            break;
    }

    return [typeDef, wrappedType];
}

export function makeTypeStrFromDef(type: GqlTypeDef): string {
    let typeStr = type.name;
    if (!type.isNullable) {
        typeStr = `${typeStr}!`;
    }
    if (type.isList) {
        typeStr = `[${typeStr}]`;
    }
    if (!type.isListNullable) {
        typeStr = `${typeStr}!`;
    }
    return typeStr;
}

export default function useIntrospection(): Introspection | null {
    const { data } = useQuery<IntrospectionQuery>(gql(getIntrospectionQuery()));

    if (!data) {
        return null;
    }

    return new Introspection(data);
}
