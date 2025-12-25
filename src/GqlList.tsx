import React from "react";
import { GqlObjectDef } from "./introspection";
import Link from "./Link";
import { PathSpec } from "./pathSpecs";

interface GqlListProps {
    def: GqlObjectDef;
    data: readonly Record<string, unknown>[];
    parentPathSpecs: readonly PathSpec[];
}

export default function GqlList(props: GqlListProps) {
    return (
        <>
            {props.data.map((rowData, i) => (
                <Row
                    key={i}
                    index={i}
                    def={props.def}
                    data={rowData}
                    parentPathSpecs={props.parentPathSpecs}
                />
            ))}
        </>
    );
}

interface RowProps {
    index: number;
    def: GqlObjectDef;
    data: Record<string, unknown>;
    parentPathSpecs: readonly PathSpec[];
}

function Row(props: RowProps) {
    const columns: React.JSX.Element[] = [];

    props.def.fields.forEach((value, key) => {
        let content: React.JSX.Element | null = null;

        if (props.data[key] !== undefined) {
            content = (
                <>
                    {key}: {String(props.data[key])}
                </>
            );
        } else if (value.requiresArguments) {
            content = <>{key}</>;
        } else {
            content = (
                <Link
                    pathSpecs={[
                        ...props.parentPathSpecs.slice(0, -2),
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
            <span key={key} style={{ marginRight: "12px" }}>
                {content}
            </span>,
        );
    });

    return <div key={props.index}>{columns}</div>;
}
