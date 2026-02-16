import { useParams } from "@tanstack/react-router";
import React from "react";
import useConfiguration, { validateConfiguration } from "../configuration";
import useIntrospection from "../introspection";
import { parseUrlPath, PathSpec } from "../pathSpecs";
import useTargetObjectData from "../queryBuilder";
import { GqlObjectType } from "../types";
import GqlList from "./GqlList";
import GqlObject from "./GqlObject";

interface GqlDataProps {
    pathSpecs: PathSpec[];
}

function GqlData(props: GqlDataProps) {
    const queryResult = useTargetObjectData(props.pathSpecs);

    if (queryResult === null) {
        return null;
    }

    const { targetObject, targetData } = queryResult;

    if (Array.isArray(targetData)) {
        return <GqlList def={targetObject} data={targetData} parentPathSpecs={props.pathSpecs} />;
    } else {
        return (
            <GqlObject
                def={targetObject}
                data={targetData as GqlObjectType}
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

    return <GqlData pathSpecs={pathSpecs} />;
}

export default App;
