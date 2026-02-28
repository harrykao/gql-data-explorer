import React from "react";
import { View } from "../configuration";
import { getDisplayFields } from "../dataProcessor";
import { GqlObjectDef } from "../introspection";
import { PathSpec } from "../pathSpecs";
import { GqlObjectData } from "../types";
import Link from "./Link";

interface GqlListProps {
    def: GqlObjectDef;
    data: readonly GqlObjectData[];
    view: View;
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

    return (
        <table style={{ borderSpacing: "12px 2px" }}>
            <tbody>
                <tr key="header">
                    {props.view.fields.map((field) => (
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
                        view={props.view}
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
    view: View;
    parentPathSpecs: readonly PathSpec[];
}

function Row(props: RowProps) {
    return (
        <tr key={props.index}>
            {getDisplayFields(props.def, props.data, props.view).map((displayField) => {
                let content: React.JSX.Element | null = null;

                if (displayField.value) {
                    content = <>{displayField.value}</>;
                } else if (displayField.fieldDef.requiresArguments) {
                    content = <>{displayField.fieldConfig.path[0]} (requires arguments)</>;
                } else {
                    content = (
                        <Link
                            pathSpecs={[
                                ...props.parentPathSpecs.slice(0, -1),
                                new PathSpec(
                                    props.parentPathSpecs[props.parentPathSpecs.length - 1]
                                        .fieldName,
                                    null,
                                    props.index,
                                ),
                                new PathSpec(displayField.fieldConfig.path[0], null, null),
                            ]}
                            args={displayField.fieldDef.args}
                            requiresArguments={displayField.fieldDef.requiresArguments}
                        />
                    );
                }

                return (
                    <td
                        key={displayField.fieldConfig.path.join(".")}
                        style={{ verticalAlign: "top" }}
                    >
                        {content}
                    </td>
                );
            })}
        </tr>
    );
}
