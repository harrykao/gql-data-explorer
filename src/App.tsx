import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from "@tanstack/react-router";
import { getIntrospectionQuery } from "graphql";
import React from "react";
import GqlList from "./GqlList";
import GqlObject from "./GqlObject";
import { GqlObjectDef, Introspection } from "./introspection";
import { parseUrlPath } from "./pathSpecs";
import useQueryBuilder from "./queryBuilder";

class PathNotFoundError extends Error {}

function getObjects(
    introspection: Introspection | null,
    pathSpecs: string[],
): { parentObjects: GqlObjectDef[] | null; targetObject: GqlObjectDef | null } {
    if (!introspection) {
        return { parentObjects: null, targetObject: null };
    }

    const parentObjects: GqlObjectDef[] = [];
    let targetObject = introspection.getRootObject();

    pathSpecs.forEach((spec) => {
        parentObjects.push(targetObject);
        const field = targetObject.fields.get(spec);
        if (field) {
            targetObject = introspection.getObjectByTypeName(field.type.name);
        } else {
            throw new PathNotFoundError();
        }
    });

    return { parentObjects, targetObject }; // TODO: is parentObjects used?
}

function App() {
    const params = useParams({ strict: false });
    const pathSpecs: string[] = params._splat ? parseUrlPath(params._splat) : [];

    const { introspection, queryBuilder } = useQueryBuilder();

    const { targetObject } = getObjects(introspection, pathSpecs);

    const gqlQueryString =
        queryBuilder && targetObject ? queryBuilder.makeFullQuery(pathSpecs, targetObject) : null;

    const { data: fullData } = useQuery(
        gqlQueryString ? gql(gqlQueryString) : gql(getIntrospectionQuery()),
        { skip: !gqlQueryString },
    );

    const targetData = fullData ? fullData[pathSpecs[pathSpecs.length - 1]] : null; // TODO: generalize

    if (!targetObject) {
        return null;
    }

    if (gqlQueryString && !targetData) {
        return null;
    }

    if (targetData && Array.isArray(targetData)) {
        return <GqlList def={targetObject} data={targetData} parentPathSpecs={pathSpecs} />;
    } else {
        return <GqlObject def={targetObject} />;
    }
}

export default App;
