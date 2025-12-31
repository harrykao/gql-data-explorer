import React from "react";
import { GqlObjectDef } from "./introspection";
import Link from "./Link";
import { PathSpec } from "./pathSpecs";
import { GqlObjectType } from "./types";

interface GqlListProps {
    def: GqlObjectDef;
    data: readonly GqlObjectType[];
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
    data: GqlObjectType;
    parentPathSpecs: readonly PathSpec[];
}

function Row(props: RowProps) {
    const columns: React.JSX.Element[] = [];

    props.def.fields.forEach((value, key) => {
        let content: React.JSX.Element | null = null;

        if (props.data[key] !== undefined) {
            content = <>{String(props.data[key])}</>;
        } else if (value.requiresArguments) {
            content = <>{key} (requires arguments)</>;
        } else {
            content = (
                <Link
                    pathSpecs={[
                        ...props.parentPathSpecs.slice(0, -1),
                        new PathSpec(
                            props.parentPathSpecs[props.parentPathSpecs.length - 1].fieldName,
                            props.index,
                        ),
                        new PathSpec(key, null),
                    ]}
                    label={key}
                />
            );
        }

        columns.push(
            <td key={key} style={{ verticalAlign: "top" }}>
                {content}
            </td>,
        );
    });

    return <tr key={props.index}>{columns}</tr>;
}
