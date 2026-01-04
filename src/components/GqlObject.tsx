import React from "react";
import { GqlObjectDef } from "../introspection";
import { PathSpec } from "../pathSpecs";
import { GqlObjectType } from "../types";
import Link from "./Link";

interface Props {
    def: GqlObjectDef;
    data: GqlObjectType;
    parentPathSpecs: readonly PathSpec[];
}

export default function GqlObject(props: Props) {
    const items: React.JSX.Element[] = [];

    props.def.fields.forEach((field, name) => {
        // scalar values
        if (props.data[name] !== undefined) {
            items.push(
                <div key={name}>
                    {name}: {String(props.data[name])}
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

    return items;
}
