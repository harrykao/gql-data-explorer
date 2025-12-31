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

    props.def.fields.forEach((value, key) => {
        if (props.data[key] !== undefined) {
            items.push(
                <div key={key}>
                    {key}: {String(props.data[key])}
                </div>,
            );
        } else if (value.requiresArguments) {
            items.push(<div key={key}>{key} (requires arguments)</div>);
        } else {
            items.push(
                <div key={key}>
                    <Link
                        pathSpecs={[...props.parentPathSpecs, new PathSpec(key, null)]}
                        label={key}
                    />
                </div>,
            );
        }
    });

    return items;
}
