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

    if (showArgs && props.args.length) {
        return (
            <div style={{ marginLeft: "24px" }}>
                {props.args.map((arg) => (
                    <Input
                        key={arg.name}
                        name={arg.name}
                        type={arg.type}
                        onChange={() => {
                            console.log();
                        }}
                    />
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
