import React from "react";
import { GqlObjectDef } from "../introspection";
import { PathSpec } from "../pathSpecs";
import { GqlObjectData } from "../types";
import Link from "./Link";

interface GqlListProps {
    def: GqlObjectDef;
    data: readonly GqlObjectData[];
    parentPathSpecs: readonly PathSpec[];
}

export default function GqlList(props: GqlListProps) {
    const allTypenames = new Set(props.data.map((rowData) => rowData.__typename));
    if (allTypenames.size > 1) {
        return "TODO: support heterogenous lists";
    }

    if (props.data.length === 0) {
        return "no data";
    }

    const fieldNames: string[] = [];
    for (const k of props.def.fields.keys()) {
        fieldNames.push(k);
    }

    return (
        <table style={{ borderSpacing: "12px 2px" }}>
            <tbody>
                <tr key="header">
                    {fieldNames.map((key) => (
                        <th key={key} style={{ textAlign: "left", verticalAlign: "top" }}>
                            {key}
                        </th>
                    ))}
                </tr>
                {props.data.map((rowData, i) => (
                    <Row
                        key={i}
                        index={i}
                        def={props.def}
                        data={rowData}
                        parentPathSpecs={props.parentPathSpecs}
                    />
                ))}
            </tbody>
        </table>
    );
}

interface RowProps {
    index: number;
    def: GqlObjectDef;
    data: GqlObjectData;
    parentPathSpecs: readonly PathSpec[];
}

function Row(props: RowProps) {
    const columns: React.JSX.Element[] = [];

    props.def.fields.forEach((field, name) => {
        let content: React.JSX.Element | null = null;

        if (props.data[name] !== undefined) {
            content = <>{String(props.data[name])}</>;
        } else if (field.requiresArguments) {
            content = <>{name} (requires arguments)</>;
        } else {
            content = (
                <Link
                    pathSpecs={[
                        ...props.parentPathSpecs.slice(0, -1),
                        new PathSpec(
                            props.parentPathSpecs[props.parentPathSpecs.length - 1].fieldName,
                            null,
                            props.index,
                        ),
                        new PathSpec(name, null, null),
                    ]}
                    args={field.args}
                    requiresArguments={field.requiresArguments}
                />
            );
        }

        columns.push(
            <td key={name} style={{ verticalAlign: "top" }}>
                {content}
            </td>,
        );
    });

    return <tr key={props.index}>{columns}</tr>;
}
