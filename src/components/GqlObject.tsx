import { Link as RouterLink } from "@tanstack/react-router";
import { Link as LinkIcon } from "lucide-react";
import React from "react";
import { Field, View } from "../configuration";
import useIntrospection, { GqlObjectDef } from "../introspection";
import { makeUrlPath, PathSpec } from "../pathSpecs";
import { GqlObjectData } from "../types";
import Link from "./Link";

interface Props {
    def: GqlObjectDef;
    data: GqlObjectData;
    view: View | null;
    parentPathSpecs: readonly PathSpec[];
}

export default function GqlObject(props: Props) {
    const introspection = useIntrospection();

    if (!introspection) {
        return null;
    }

    if (props.view && props.def.name !== props.view.objectName) {
        throw new Error("view doesn't match object type");
    }

    let fieldConfigs: Field[] = [];

    if (props.view) {
        fieldConfigs = props.view.fields;
    } else {
        // if there's no view configured, create an "identity view"
        props.def.fields.forEach((field, name) => {
            fieldConfigs.push({ fieldName: name, displayName: name });
        });
    }

    const items: React.JSX.Element[] = [];

    fieldConfigs.forEach((fieldConfig) => {
        const fieldDef = props.def.fields.get(fieldConfig.fieldName);
        const dataValue = props.data[fieldConfig.fieldName];

        if (!fieldDef) {
            throw new Error("field not found");
        }

        // scalar values
        if (dataValue !== undefined) {
            const valueStr = typeof dataValue === "string" ? dataValue : "(unsupported type)";
            items.push(
                <div key={fieldConfig.fieldName}>
                    {fieldConfig.displayName}: {valueStr}
                </div>,
            );
        }

        // objects
        else {
            items.push(
                <div key={fieldConfig.fieldName}>
                    {fieldConfig.displayName}{" "}
                    <Link
                        pathSpecs={[
                            ...props.parentPathSpecs,
                            new PathSpec(fieldConfig.fieldName, null, null),
                        ]}
                        args={fieldDef.args}
                        requiresArguments={fieldDef.requiresArguments}
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
