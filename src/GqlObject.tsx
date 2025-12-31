import React from "react";
import { GqlObjectDef } from "./introspection";
import Link from "./Link";
import { PathSpec } from "./pathSpecs";
import { GqlObjectType } from "./types";

interface Props {
    def: GqlObjectDef;
    data: GqlObjectType;
    parentPathSpecs: readonly PathSpec[];
}

export default function GqlObject(props: Props) {
    const items: React.JSX.Element[] = [];

    console.log(props.def);

    props.def.fields.forEach((value, key) => {
        // scalar values
        if (props.data[key] !== undefined) {
            items.push(
                <div key={key}>
                    {key}: {String(props.data[key])}
                </div>,
            );
        }

        // objects
        else {
            items.push(
                <div key={key}>
                    {key}{" "}
                    <Link
                        pathSpecs={[...props.parentPathSpecs, new PathSpec(key, null)]}
                        requiresArguments={value.requiresArguments}
                    />
                </div>,
            );
        }
    });

    return items;
}
