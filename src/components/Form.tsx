import React, { useEffect, useState } from "react";
import useIntrospection, { GqlTypeDef } from "../introspection";

interface NullableScalarInputProps {
    name: string;
    typeName: string;
    onChange: (value: string | null) => unknown;
}

export function NullableScalarInput(props: NullableScalarInputProps) {
    const { onChange } = props;
    const [isNull, setIsNull] = useState(true);
    const [value, setValue] = useState("");

    useEffect(() => {
        onChange(isNull ? null : value);
    }, [onChange, value, isNull]);

    return (
        <div style={{ margin: "4px 0" }}>
            <input
                type="checkbox"
                checked={!isNull}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
                onChange={(e) => {
                    setIsNull(!e.target.checked);
                }}
            />
            <label>
                {props.name}:{" "}
                <input
                    value={value}
                    disabled={isNull}
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                />
            </label>{" "}
            <span style={{ color: "gray", fontStyle: "italic" }}>({props.typeName})</span>
        </div>
    );
}

interface NonNullableScalarInputProps {
    name: string;
    typeName: string;
    onChange: (value: string) => unknown;
}

export function NonNullableScalarInput(props: NonNullableScalarInputProps) {
    const { onChange } = props;
    const [value, setValue] = useState("");

    useEffect(() => {
        onChange(value);
    }, [onChange, value]);

    return (
        <div style={{ margin: "4px 0" }}>
            <label>
                {props.name}:{" "}
                <input
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                />
            </label>{" "}
            <span style={{ color: "gray", fontStyle: "italic" }}>({props.typeName}!)</span>
        </div>
    );
}

interface InputProps {
    name: string;
    type: GqlTypeDef;
    onChange: (value: unknown) => unknown;
}

export function Input(props: InputProps) {
    const introspection = useIntrospection();

    if (!introspection) {
        return null;
    }

    if (props.type.isList) {
        //
    }

    // SCALAR
    else if (props.type.kind === "SCALAR") {
        if (props.type.isNullable) {
            return (
                <NullableScalarInput
                    name={props.name}
                    typeName={props.type.name}
                    onChange={props.onChange}
                />
            );
        } else {
            return (
                <NonNullableScalarInput
                    name={props.name}
                    typeName={props.type.name}
                    onChange={props.onChange}
                />
            );
        }
    }

    // INPUT_OBJECT
    else if (props.type.kind === "INPUT_OBJECT") {
        const inputObject = introspection.getInputObjectByTypeName(props.type.name);
        const rows: React.JSX.Element[] = [];
        inputObject.inputFields.forEach((field, name) => {
            rows.push(<Input key={name} name={name} type={field.type} onChange={props.onChange} />);
        });
        return (
            <div>
                {props.name}
                {props.type.isNullable ? "" : ", required"}:
                <div style={{ marginLeft: "24px" }}>{rows}</div>
            </div>
        );
    }

    // unexpected type
    else {
        return <>type {props.type.kind} not handled</>;
    }
}

// interface ListArgInputProps {
//     name: string;
//     type: GqlTypeDef;
// }

// function ListArgInput(props: ListArgInputProps) {
//     console.log(props.type);
//     return (
//         <div style={{ margin: "4px 0" }}>
//             {props.name}:<div style={{ marginLeft: "24px" }}>items go here</div>
//         </div>
//     );
// }
