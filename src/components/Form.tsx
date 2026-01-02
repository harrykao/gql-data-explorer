import React, { useEffect, useState } from "react";

interface NonNullableSingleArgInputProps {
    name: string;
    typeName: string;
    onChange: (string) => unknown;
}

export function NonNullableSingleArgInput(props: NonNullableSingleArgInputProps) {
    const [value, setValue] = useState("");

    useEffect(() => {
        props.onChange(value);
    }, [value]);

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
            <span style={{ color: "gray", fontStyle: "italic" }}>({props.typeName})</span>
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
