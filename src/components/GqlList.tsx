import React from "react";
import { Field, View } from "../configuration";
import { GqlObjectDef } from "../introspection";
import { PathSpec } from "../pathSpecs";
import { GqlObjectData } from "../types";
import Link from "./Link";

interface GqlListProps {
    def: GqlObjectDef;
    data: readonly GqlObjectData[];
    view: View | null;
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

    let fieldConfigs: Field[] = [];

    if (props.view) {
        fieldConfigs = props.view.fields;
    } else {
        // if there's no view configured, create an "identity view"
        props.def.fields.forEach((field, name) => {
            fieldConfigs.push({ path: [name], displayName: name });
        });
    }

    return (
        <table style={{ borderSpacing: "12px 2px" }}>
            <tbody>
                <tr key="header">
                    {fieldConfigs.map((field) => (
                        <th
                            key={field.path.join(".")}
                            style={{ textAlign: "left", verticalAlign: "top" }}
                        >
                            {field.displayName}
                        </th>
                    ))}
                </tr>
                {props.data.map((rowData, i) => (
                    <Row
                        key={i}
                        index={i}
                        def={props.def}
                        data={rowData}
                        fieldConfigs={fieldConfigs}
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
    fieldConfigs: Field[];
    parentPathSpecs: readonly PathSpec[];
}

function Row(props: RowProps) {
    const columns: React.JSX.Element[] = [];

    // props.def.fields.forEach((field, name) => {
    props.fieldConfigs.forEach((field) => {
        let content: React.JSX.Element | null = null;
        const fieldDef = props.def.fields.get(field.path[0]);

        if (!fieldDef) {
            throw new Error();
        }

        if (props.data[field.path[0]] !== undefined) {
            content = <>{String(props.data[field.path[0]])}</>;
        } else if (fieldDef.requiresArguments) {
            content = <>{field.path[0]} (requires arguments)</>;
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
                        new PathSpec(field.path[0], null, null),
                    ]}
                    args={fieldDef.args}
                    requiresArguments={fieldDef.requiresArguments}
                />
            );
        }

        columns.push(
            <td key={field.path.join(".")} style={{ verticalAlign: "top" }}>
                {content}
            </td>,
        );
    });

    return <tr key={props.index}>{columns}</tr>;
}
