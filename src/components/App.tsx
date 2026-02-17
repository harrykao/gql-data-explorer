import { useParams } from "@tanstack/react-router";
import React from "react";
import useConfiguration, { Config, validateConfiguration, View } from "../configuration";
import useIntrospection from "../introspection";
import { parseUrlPath, PathSpec } from "../pathSpecs";
import useTargetObjectData from "../queryBuilder";
import { GqlObjectData } from "../types";
import GqlList from "./GqlList";
import GqlObject from "./GqlObject";

interface GqlDataProps {
    config: Config;
    pathSpecs: PathSpec[];
}

function GqlData(props: GqlDataProps) {
    const queryResult = useTargetObjectData(props.pathSpecs);

    if (queryResult === null) {
        return null;
    }

    const { targetObject, targetData } = queryResult;

    // see if there's a matching view
    const viewsByObjectName = new Map<string, View>();
    props.config.views.forEach((v) => {
        viewsByObjectName.set(v.objectName, v);
    });

    if (Array.isArray(targetData)) {
        return <GqlList def={targetObject} data={targetData} parentPathSpecs={props.pathSpecs} />;
    } else {
        return (
            <GqlObject
                def={targetObject}
                data={targetData as GqlObjectData}
                view={viewsByObjectName.get(targetObject.name) ?? null}
                parentPathSpecs={props.pathSpecs}
            />
        );
    }
}

function App() {
    const params = useParams({ from: "/$" });
    const pathSpecs = params._splat ? parseUrlPath(params._splat) : [];

    const introspection = useIntrospection();
    const config = useConfiguration();

    if (introspection === null || config === null) {
        return null;
    }

    const validationErrors = validateConfiguration(config, introspection);

    if (validationErrors.length) {
        return (
            <>
                <p>Configuration validation errors:</p>
                <ul>
                    {validationErrors.map((e) => (
                        <li key={e}>{e}</li>
                    ))}
                </ul>
            </>
        );
    }

    return <GqlData config={config} pathSpecs={pathSpecs} />;
}

export default App;
