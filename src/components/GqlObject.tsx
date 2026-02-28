import { Link as RouterLink } from "@tanstack/react-router";
import { Link as LinkIcon } from "lucide-react";
import React from "react";
import { View } from "../configuration";
import { getDisplayFields } from "../dataProcessor";
import useIntrospection, { GqlObjectDef } from "../introspection";
import { makeUrlPath, PathSpec } from "../pathSpecs";
import { GqlObjectData } from "../types";
import Link from "./Link";

interface Props {
    def: GqlObjectDef;
    data: GqlObjectData;
    view: View;
    parentPathSpecs: readonly PathSpec[];
}

export default function GqlObject(props: Props) {
    const introspection = useIntrospection();

    if (!introspection) {
        return null;
    }

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
            {getDisplayFields(props.def, props.data, props.view).map((displayField) => {
                if (displayField.value !== null) {
                    return (
                        <div key={displayField.fieldConfig.path.join(".")}>
                            {displayField.label}: {displayField.value}
                        </div>
                    );
                } else {
                    return (
                        <div key={displayField.fieldConfig.path.join(".")}>
                            {displayField.label}{" "}
                            <Link
                                pathSpecs={[
                                    ...props.parentPathSpecs,
                                    new PathSpec(displayField.fieldConfig.path[0], null, null),
                                ]}
                                args={displayField.fieldDef.args}
                                requiresArguments={displayField.fieldDef.requiresArguments}
                            />
                        </div>
                    );
                }
            })}
        </>
    );
}
