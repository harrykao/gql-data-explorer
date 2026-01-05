import { SquareCheck, SquareDot, SquareMinus, SquarePlus, SquareX } from "lucide-react";
import React, { useEffect, useState } from "react";
import useIntrospection, { GqlTypeDef } from "../introspection";

interface NullableModeSelectorProps {
    onChange: (mode: true | null | undefined) => unknown;
}

function NullableModeSelector(props: NullableModeSelectorProps) {
    const { onChange } = props;
    const [mode, setMode] = useState<true | null | undefined>(undefined);

    useEffect(() => {
        onChange(mode);
    }, [onChange, mode]);

    return (
        <span role="radiogroup" style={{ marginRight: "4px", verticalAlign: "middle" }}>
            <SquareMinus
                size={16}
                onClick={() => {
                    setMode(undefined);
                }}
                role="radio"
                aria-label="omit"
                aria-checked={mode === undefined}
                style={{
                    marginRight: "4px",
                    cursor: "pointer",
                    ...(mode === undefined && { color: "steelblue" }),
                }}
            />
            <SquareDot
                size={16}
                onClick={() => {
                    setMode(null);
                }}
                role="radio"
                aria-label="set null"
                aria-checked={mode === null}
                style={{
                    marginRight: "4px",
                    cursor: "pointer",
                    ...(mode === null && { color: "steelblue" }),
                }}
            />
            <SquareCheck
                size={16}
                onClick={() => {
                    setMode(true);
                }}
                role="radio"
                aria-label="set value"
                aria-checked={mode === true}
                style={{
                    marginRight: "4px",
                    cursor: "pointer",
                    ...(mode === true && { color: "steelblue" }),
                }}
            />
        </span>
    );
}

interface InlineScalarInputProps {
    name: string;
    typeName: string;
    disabled: boolean;
    onChange: (value: string) => unknown;
    onRemove?: () => unknown;
}

function InlineScalarInput(props: InlineScalarInputProps) {
    const { onChange } = props;
    const [value, setValue] = useState("");

    useEffect(() => {
        onChange(value);
    }, [onChange, value]);

    return (
        <>
            <label>
                {props.name}:{" "}
                <input
                    value={value}
                    disabled={props.disabled}
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                />
            </label>
            <span style={{ marginLeft: "8px", color: "gray", fontStyle: "italic" }}>
                ({props.typeName})
            </span>
            {props.onRemove && (
                <span style={{ marginLeft: "8px", verticalAlign: "middle" }}>
                    <SquareX
                        size={16}
                        onClick={props.onRemove}
                        aria-label={`remove item ${props.name}`}
                        style={{
                            marginRight: "4px",
                            cursor: "pointer",
                        }}
                    />
                </span>
            )}
        </>
    );
}

interface NullableScalarInputProps {
    name: string;
    typeName: string;
    disabled: boolean;
    onChange: (value: string | null | undefined) => unknown;
    onRemove?: () => unknown;
}

function NullableScalarInput(props: NullableScalarInputProps) {
    const { onChange } = props;
    const [mode, setMode] = useState<true | null | undefined>(undefined);
    const [value, setValue] = useState("");

    useEffect(() => {
        onChange(mode ? value : mode);
    }, [onChange, mode, value]);

    return (
        <div style={{ margin: "4px 0" }}>
            <NullableModeSelector onChange={setMode} />
            <InlineScalarInput
                name={props.name}
                typeName={props.typeName}
                disabled={props.disabled || !mode}
                onChange={setValue}
                onRemove={props.onRemove}
            />
        </div>
    );
}

interface NonNullableScalarInputProps {
    name: string;
    typeName: string;
    disabled: boolean;
    onChange: (value: string) => unknown;
    onRemove?: () => unknown;
}

function NonNullableScalarInput(props: NonNullableScalarInputProps) {
    return (
        <div style={{ margin: "4px 0" }}>
            <InlineScalarInput
                name={props.name}
                typeName={props.typeName}
                disabled={props.disabled}
                onChange={props.onChange}
                onRemove={props.onRemove}
            />
        </div>
    );
}

interface ListItemsInputProps {
    type: GqlTypeDef;
    disabled: boolean;
    onChange: (value: unknown[]) => unknown;
}

function ListItemsInput(props: ListItemsInputProps) {
    const { onChange } = props;
    const [rowIds, setRowIds] = useState<string[]>([]);
    const [values, setValues] = useState<unknown[]>([]);

    useEffect(() => {
        onChange(values);
    }, [onChange, values]);

    return (
        <>
            <div style={{ marginLeft: "24px" }}>
                {rowIds.map((id, i) => (
                    <Input
                        key={id}
                        name={String(i + 1)}
                        type={{ ...props.type, isList: false }}
                        disabled={props.disabled}
                        onChange={(itemValue) => {
                            setValues((oldArray) =>
                                values[i] !== itemValue
                                    ? [...oldArray.slice(0, i), itemValue, ...oldArray.slice(i + 1)]
                                    : oldArray,
                            );
                        }}
                        onRemove={() => {
                            setRowIds((oldRowIds) => [
                                ...oldRowIds.slice(0, i),
                                ...oldRowIds.slice(i + 1),
                            ]);
                            setValues((oldArray) => [
                                ...oldArray.slice(0, i),
                                ...oldArray.slice(i + 1),
                            ]);
                        }}
                    />
                ))}
                <div>
                    <SquarePlus
                        size={16}
                        onClick={() => {
                            setRowIds((oldRowIds) => [...oldRowIds, crypto.randomUUID()]);
                        }}
                        aria-label="add item"
                        style={{
                            marginRight: "4px",
                            cursor: "pointer",
                        }}
                    />
                </div>
            </div>
        </>
    );
}

interface NullableListInputProps {
    name: string;
    type: GqlTypeDef;
    disabled: boolean;
    onChange: (value: unknown[] | null | undefined) => unknown;
}

function NullableListInput(props: NullableListInputProps) {
    const { onChange } = props;
    const [mode, setMode] = useState<true | null | undefined>(undefined);
    const [value, setValue] = useState<unknown[]>([]);

    useEffect(() => {
        onChange(mode ? value : mode);
    }, [onChange, mode, value]);

    return (
        <>
            <div style={{ margin: "4px 0", verticalAlign: "middle" }}>
                <NullableModeSelector onChange={setMode} />
                {props.name}:
            </div>
            <ListItemsInput
                type={props.type}
                disabled={props.disabled || !mode}
                onChange={setValue}
            />
        </>
    );
}

interface NonNullableListInputProps {
    name: string;
    type: GqlTypeDef;
    disabled: boolean;
    onChange: (value: unknown[]) => unknown;
}

function NonNullableListInput(props: NonNullableListInputProps) {
    return (
        <>
            <div>{props.name}:</div>
            <ListItemsInput type={props.type} disabled={props.disabled} onChange={props.onChange} />
        </>
    );
}

interface ObjectFieldsInputProps {
    name: string;
    typeName: string;
    disabled: boolean;
    onChange: (value: Record<string, unknown>) => unknown;
}

function ObjectFieldsInput(props: ObjectFieldsInputProps) {
    const { onChange } = props;
    const introspection = useIntrospection();
    const [value, setValue] = useState<Record<string, unknown>>({});

    useEffect(() => {
        onChange(value);
    }, [onChange, value]);

    if (!introspection) {
        return null;
    }

    const inputObject = introspection.getInputObjectByTypeName(props.typeName);
    const rows: React.JSX.Element[] = [];
    inputObject.inputFields.forEach((field, name) => {
        rows.push(
            <Input
                key={name}
                name={name}
                type={field.type}
                disabled={props.disabled}
                onChange={(fieldValue) => {
                    setValue((oldValue) =>
                        oldValue[name] !== fieldValue ? { ...value, [name]: fieldValue } : oldValue,
                    );
                }}
            />,
        );
    });
    return <div style={{ marginLeft: "24px" }}>{rows}</div>;
}

interface NullableObjectInputProps {
    name: string;
    typeName: string;
    disabled: boolean;
    onChange: (value: Record<string, unknown> | null | undefined) => unknown;
}

function NullableObjectInput(props: NullableObjectInputProps) {
    const { onChange } = props;
    const [mode, setMode] = useState<true | null | undefined>(undefined);
    const [value, setValue] = useState<Record<string, unknown>>({});

    useEffect(() => {
        onChange(mode ? value : mode);
    }, [onChange, mode, value]);

    return (
        <div>
            <div>
                <NullableModeSelector onChange={setMode} />
                {props.name}:
            </div>
            <ObjectFieldsInput
                name={props.name}
                typeName={props.typeName}
                disabled={props.disabled || !mode}
                onChange={setValue}
            />
        </div>
    );
}

interface NonNullableObjectInputProps {
    name: string;
    typeName: string;
    disabled: boolean;
    onChange: (value: Record<string, unknown>) => unknown;
}

function NonNullableObjectInput(props: NonNullableObjectInputProps) {
    return (
        <div>
            {props.name}:
            <ObjectFieldsInput
                name={props.name}
                typeName={props.typeName}
                disabled={props.disabled}
                onChange={props.onChange}
            />
        </div>
    );
}

interface InputProps {
    name: string;
    type: GqlTypeDef;
    disabled: boolean;
    onChange: (value: unknown) => unknown;
    onRemove?: () => unknown;
}

export function Input(props: InputProps) {
    // list
    if (props.type.isList) {
        if (props.type.isListNullable) {
            return (
                <NullableListInput
                    name={props.name}
                    type={props.type}
                    disabled={props.disabled}
                    onChange={props.onChange}
                />
            );
        } else {
            return (
                <NonNullableListInput
                    name={props.name}
                    type={props.type}
                    disabled={props.disabled}
                    onChange={props.onChange}
                />
            );
        }
    }

    // SCALAR
    else if (props.type.kind === "SCALAR") {
        if (props.type.isNullable) {
            return (
                <NullableScalarInput
                    name={props.name}
                    typeName={props.type.name}
                    disabled={props.disabled}
                    onChange={props.onChange}
                    onRemove={props.onRemove}
                />
            );
        } else {
            return (
                <NonNullableScalarInput
                    name={props.name}
                    typeName={props.type.name}
                    disabled={props.disabled}
                    onChange={props.onChange}
                    onRemove={props.onRemove}
                />
            );
        }
    }

    // INPUT_OBJECT
    else if (props.type.kind === "INPUT_OBJECT") {
        if (props.type.isNullable) {
            return (
                <NullableObjectInput
                    name={props.name}
                    typeName={props.type.name}
                    disabled={props.disabled}
                    onChange={props.onChange}
                />
            );
        } else {
            return (
                <NonNullableObjectInput
                    name={props.name}
                    typeName={props.type.name}
                    disabled={props.disabled}
                    onChange={props.onChange}
                />
            );
        }
    }

    // unexpected type
    else {
        return <>type {props.type.kind} not handled</>;
    }
}
