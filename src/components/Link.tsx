/**
 * A link to an object or a list of objects.
 */

import { Link as RouterLink } from "@tanstack/react-router";
import { CircleArrowRight, SquarePen, SquareX } from "lucide-react";
import React, { useState } from "react";
import { GqlArgumentDef } from "../introspection";
import { PathSpec, makeUrlPath } from "../pathSpecs";
import { Input } from "./Form";

interface Props {
    pathSpecs: readonly PathSpec[];
    args: readonly GqlArgumentDef[];
    requiresArguments: boolean;
}

export default function Link(props: Props) {
    const [showArgs, setShowArgs] = useState(false);
    const [argValues, setArgValues] = useState<Record<string, unknown>>({});

    if (showArgs && props.args.length) {
        return (
            <div style={{ marginLeft: "24px" }}>
                {props.args.map((arg) => (
                    <Input
                        key={arg.name}
                        name={arg.name}
                        type={arg.type}
                        disabled={false}
                        onChange={(value) => {
                            setArgValues((oldValues) =>
                                oldValues[arg.name] !== value
                                    ? { ...oldValues, [arg.name]: value }
                                    : oldValues,
                            );
                        }}
                    />
                ))}
                <div>
                    <span role="button" style={{ verticalAlign: "middle" }}>
                        <SquareX
                            size={24}
                            aria-label="remove arguments"
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
                            _splat: makeUrlPath([
                                ...props.pathSpecs.slice(0, -1),
                                new PathSpec(
                                    props.pathSpecs[props.pathSpecs.length - 1].fieldName,
                                    argValues,
                                    props.pathSpecs[props.pathSpecs.length - 1].arrayIndex,
                                ),
                            ]),
                        }}
                        aria-label="query field"
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
                <span role="button" style={{ verticalAlign: "middle" }}>
                    <SquarePen
                        size={14}
                        aria-label="edit arguments"
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
                    aria-label="query field"
                    style={{ verticalAlign: "middle" }}
                >
                    <CircleArrowRight size={14} />
                </RouterLink>
            )}
        </>
    );
}
