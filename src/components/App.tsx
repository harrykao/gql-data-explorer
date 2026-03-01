import { useParams } from "@tanstack/react-router";
import React from "react";
import useConfiguration, { validateConfiguration, ValidatedConfig } from "../configuration";
import useIntrospection from "../introspection";
import { parseUrlPath, PathSpec } from "../pathSpecs";
import useTargetObjectData from "../queryBuilder";
import { GqlObjectData } from "../types";
import GqlList from "./GqlList";
import GqlObject from "./GqlObject";

interface GqlDataProps {
    config: ValidatedConfig;
    pathSpecs: PathSpec[];
}

function GqlData(props: GqlDataProps) {
    const queryResult = useTargetObjectData(props.pathSpecs, props.config);

    if (queryResult === null) {
        return null;
    }

    const { targetObject, targetData, view } = queryResult;

    if (Array.isArray(targetData)) {
        return (
            <GqlList
                def={targetObject}
                data={targetData}
                view={view}
                parentPathSpecs={props.pathSpecs}
            />
        );
    } else {
        return (
            <GqlObject
                def={targetObject}
                data={targetData as GqlObjectData}
                view={view}
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

    const [validatedConfig, errors] = validateConfiguration(config, introspection);

    if (!validatedConfig) {
        return (
            <>
                <p>Configuration validation errors:</p>
                <ul>
                    {errors.map((e) => (
                        <li key={e}>{e}</li>
                    ))}
                </ul>
            </>
        );
    }

    return <GqlData config={validatedConfig} pathSpecs={pathSpecs} />;
}

export default App;
