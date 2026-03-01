import { Link as RouterLink } from "@tanstack/react-router";
import { Link as LinkIcon } from "lucide-react";
import React from "react";
import { ValidatedView } from "../configuration";
import { getDisplayFields } from "../dataProcessor";
import useIntrospection, { GqlObjectDef } from "../introspection";
import { makeUrlPath, PathSpec } from "../pathSpecs";
import { GqlObjectData } from "../types";
import Link from "./Link";

interface Props {
    def: GqlObjectDef;
    data: GqlObjectData;
    view: ValidatedView;
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
                if (displayField.value !== null && !displayField.fieldConfig.linkPath) {
                    return (
                        <div
                            key={displayField.fieldConfig.path
                                .map((pathPart) => pathPart.str)
                                .join(".")}
                        >
                            {displayField.label}: {displayField.value}
                        </div>
                    );
                } else if (displayField.fieldConfig.linkPath) {
                    return (
                        <div
                            key={displayField.fieldConfig.path
                                .map((pathPart) => pathPart.str)
                                .join(".")}
                        >
                            {displayField.label}:{" "}
                            <Link
                                pathSpecs={[
                                    ...props.parentPathSpecs,
                                    ...displayField.fieldConfig.linkPath.map(
                                        (pathPart) => new PathSpec(pathPart, null, null),
                                    ),
                                ]}
                                args={displayField.fieldDef.args}
                                requiresArguments={displayField.fieldDef.requiresArguments}
                                linkText={displayField.value ?? ""}
                            />
                        </div>
                    );
                } else {
                    return (
                        <div
                            key={displayField.fieldConfig.path
                                .map((pathPart) => pathPart.str)
                                .join(".")}
                        >
                            {displayField.label}{" "}
                            <Link
                                pathSpecs={[
                                    ...props.parentPathSpecs,
                                    new PathSpec(displayField.fieldConfig.path[0].str, null, null),
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
