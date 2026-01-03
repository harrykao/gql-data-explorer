/**
 * A link to an object or a list of objects.
 */

import { Link as RouterLink } from "@tanstack/react-router";
import { CircleArrowRight, SquarePen, SquareX } from "lucide-react";
import React, { useState } from "react";
import useIntrospection, { GqlArgumentDef, GqlTypeDef } from "../introspection";
import { PathSpec, makeUrlPath } from "../pathSpecs";
import { NonNullableSingleArgInput, NullableSingleArgInput } from "./Form";

interface Props {
    pathSpecs: readonly PathSpec[];
    args: readonly GqlArgumentDef[];
    requiresArguments: boolean;
}

export default function Link(props: Props) {
    const [showArgs, setShowArgs] = useState(false);

    if (showArgs && props.args.length) {
        return (
            <div style={{ marginLeft: "24px" }}>
                {props.args.map((arg) => (
                    <Arg key={arg.name} name={arg.name} type={arg.type} />
                ))}
                <div>
                    <span style={{ verticalAlign: "middle" }}>
                        <SquareX
                            size={24}
                            onClick={() => {
                                setShowArgs(false);
                            }}
                            style={{
                                marginRight: "4px",
                                cursor: "pointer",
                            }}
                        />
                    </span>
                    <RouterLink
                        to="/$"
                        params={{
                            _splat: makeUrlPath(props.pathSpecs),
                        }}
                        style={{ verticalAlign: "middle" }}
                    >
                        <CircleArrowRight size={24} />
                    </RouterLink>
                </div>
            </div>
        );
    }

    return (
        <>
            {props.args.length > 0 && (
                <span style={{ verticalAlign: "middle" }}>
                    <SquarePen
                        size={14}
                        onClick={() => {
                            setShowArgs(true);
                        }}
                        style={{
                            marginRight: "4px",
                            cursor: "pointer",
                        }}
                    />
                </span>
            )}
            {!props.requiresArguments && (
                <RouterLink
                    to="/$"
                    params={{
                        _splat: makeUrlPath(props.pathSpecs),
                    }}
                    style={{ verticalAlign: "middle" }}
                >
                    <CircleArrowRight size={14} />
                </RouterLink>
            )}
        </>
    );
}

interface ArgProps {
    name: string;
    type: GqlTypeDef;
}

function Arg(props: ArgProps) {
    const introspection = useIntrospection();

    if (!introspection) {
        return null;
    }

    if (props.type.kind === "SCALAR") {
        if (props.type.isNullable) {
            return (
                <NullableSingleArgInput
                    name={props.name}
                    typeName={props.type.name}
                    onChange={(value: string | null) => {
                        console.log(value);
                    }}
                />
            );
        } else {
            return (
                <NonNullableSingleArgInput
                    name={props.name}
                    typeName={props.type.name}
                    onChange={(value: string) => {
                        console.log(value);
                    }}
                />
            );
        }
        // return props.type.isList ? (
        //     <ListArgInput name={props.name} type={props.type} />
        // ) : (
        //     <SingleArgInput name={props.name} type={props.type} />
        // );
    }

    // if it's not a SCALAR, it's an INPUT_OBJECT
    else {
        const inputObject = introspection.getInputObjectByTypeName(props.type.name);
        const rows: React.JSX.Element[] = [];
        inputObject.inputFields.forEach((field, name) => {
            rows.push(<Arg key={name} name={name} type={field.type} />);
        });
        return (
            <div>
                {props.name}
                {props.type.isNullable ? "" : ", required"}:
                <div style={{ marginLeft: "24px" }}>{rows}</div>
            </div>
        );
    }
}
