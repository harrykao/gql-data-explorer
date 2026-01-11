import { useParams } from "@tanstack/react-router";
import React from "react";
import { parseUrlPath } from "../pathSpecs";
import useTargetObjectData from "../queryBuilder";
import { GqlObjectType } from "../types";
import GqlList from "./GqlList";
import GqlObject from "./GqlObject";

function App() {
    const params = useParams({ from: "/$" });
    const pathSpecs = params._splat ? parseUrlPath(params._splat) : [];

    const queryResult = useTargetObjectData(pathSpecs);

    if (queryResult === null) {
        return null;
    }

    const { targetObject, targetData } = queryResult;

    if (Array.isArray(targetData)) {
        return <GqlList def={targetObject} data={targetData} parentPathSpecs={pathSpecs} />;
    } else {
        return (
            <GqlObject
                def={targetObject}
                data={targetData as GqlObjectType}
                parentPathSpecs={pathSpecs}
            />
        );
    }
}

export default App;
