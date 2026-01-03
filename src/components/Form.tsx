import React, { useEffect, useState } from "react";

interface NullableSingleArgInputProps {
    name: string;
    typeName: string;
    onChange: (value: string | null) => unknown;
}

export function NullableSingleArgInput(props: NullableSingleArgInputProps) {
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

interface NonNullableSingleArgInputProps {
    name: string;
    typeName: string;
    onChange: (value: string) => unknown;
}

export function NonNullableSingleArgInput(props: NonNullableSingleArgInputProps) {
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
