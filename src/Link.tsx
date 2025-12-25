import { Link as RouterLink } from "@tanstack/react-router";
import React from "react";
import { PathSpec, makeUrlPath } from "./pathSpecs";

interface Props {
    pathSpecs: readonly PathSpec[];
    label: string;
}

export default function Link(props: Props) {
    return <RouterLink to={`/${makeUrlPath(props.pathSpecs)}`}>{props.label}</RouterLink>;
}
