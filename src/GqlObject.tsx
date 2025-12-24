import { Link } from "@tanstack/react-router";
import React from "react";
import { GqlObjectDef } from "./introspection";

interface Props {
    def: GqlObjectDef;
}

export default function GqlObject(props: Props) {
    return (
        <>
            {[...props.def.fields.values()].map((f) => {
                if (f.requiresArguments) {
                    return <div key={f.name}>{f.name}</div>;
                } else {
                    return (
                        <div key={f.name}>
                            <Link to={`/${f.name}`}>{f.name}</Link>
                        </div>
                    );
                }
            })}
        </>
    );
}
