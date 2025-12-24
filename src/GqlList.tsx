import { Link } from "@tanstack/react-router";
import React from "react";
import { GqlObjectDef } from "./introspection";

interface GqlListProps {
    def: GqlObjectDef;
    data: Record<string, unknown>[];
}

export default function GqlList(props: GqlListProps) {
    return (
        <>
            {props.data.map((rowData, i) => (
                <Row key={i} index={i} def={props.def} data={rowData} />
            ))}
        </>
    );
}

interface RowProps {
    index: number;
    def: GqlObjectDef;
    data: Record<string, unknown>;
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
            content = <Link to={`/${value.name}`}>{value.name}</Link>;
        }

        columns.push(
            <span key={key} style={{ marginRight: "12px" }}>
                {content}
            </span>,
        );
    });

    return <div key={props.index}>{columns}</div>;
}
