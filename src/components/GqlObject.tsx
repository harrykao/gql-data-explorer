import { Link as RouterLink } from "@tanstack/react-router";
import { Link as LinkIcon } from "lucide-react";
import React from "react";
import useIntrospection, { GqlObjectDef } from "../introspection";
import { makeUrlPath, PathSpec } from "../pathSpecs";
import { GqlObjectType } from "../types";
import Link from "./Link";

interface Props {
    def: GqlObjectDef;
    data: GqlObjectType;
    parentPathSpecs: readonly PathSpec[];
}

export default function GqlObject(props: Props) {
    const introspection = useIntrospection();

    if (!introspection) {
        return null;
    }

    const items: React.JSX.Element[] = [];

    props.def.fields.forEach((field, name) => {
        const dataValue = props.data[name];

        // scalar values
        if (dataValue !== undefined) {
            const valueStr = typeof dataValue === "string" ? dataValue : "(unsupported type)";
            items.push(
                <div key={name}>
                    {name}: {valueStr}
                </div>,
            );
        }

        // objects
        else {
            items.push(
                <div key={name}>
                    {name}{" "}
                    <Link
                        pathSpecs={[...props.parentPathSpecs, new PathSpec(name, null, null)]}
                        args={field.args}
                        requiresArguments={field.requiresArguments}
                    />
                </div>,
            );
        }
    });

    return (
        <>
            {introspection.doesNodeQuerySupportType(props.data.__typename) && (
                <RouterLink
                    to="/$"
                    params={{
                        _splat: makeUrlPath([new PathSpec("node", { id: props.data.id }, null)]),
                    }}
                >
                    <LinkIcon
                        size={24}
                        aria-label="direct link"
                        onClick={() => {
                            //
                        }}
                    />
                </RouterLink>
            )}
            {items}
        </>
    );
}
