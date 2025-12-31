/**
 * A link to an object or a list of objects.
 */

import { Link as RouterLink } from "@tanstack/react-router";
import { CircleArrowRight, SquarePen } from "lucide-react";
import React from "react";
import { PathSpec, makeUrlPath } from "./pathSpecs";

interface Props {
    pathSpecs: readonly PathSpec[];
    requiresArguments: boolean;
}

export default function Link(props: Props) {
    if (props.requiresArguments) {
        return (
            <span>
                <SquarePen size={14} style={{ verticalAlign: "middle" }} />
            </span>
        );
    } else {
        return (
            <RouterLink to={`/${makeUrlPath(props.pathSpecs)}`} style={{ verticalAlign: "middle" }}>
                <CircleArrowRight size={14} />
            </RouterLink>
        );
    }
}
