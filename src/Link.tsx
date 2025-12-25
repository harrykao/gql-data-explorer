import { Link as RouterLink } from "@tanstack/react-router";
import React from "react";

interface Props {
    pathSpecs: string[];
    label: string;
}

export default function Link(props: Props) {
    return <RouterLink to={`/${props.pathSpecs.join("/")}`}>{props.label}</RouterLink>;
}
