import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from "@tanstack/react-router";
import { getIntrospectionQuery } from "graphql";
import React from "react";
import { GqlObjectDef, Introspection } from "../introspection";
import { PathSpec, parseUrlPath } from "../pathSpecs";
import useQueryBuilder from "../queryBuilder";
import { GqlObjectType } from "../types";
import GqlList from "./GqlList";
import GqlObject from "./GqlObject";

class PathNotFoundError extends Error {}

class TargetDataNotFoundError extends Error {}

function getObjects(
    introspection: Introspection | null,
    pathSpecs: PathSpec[],
): { parentObjects: GqlObjectDef[] | null; targetObject: GqlObjectDef | null } {
    if (!introspection) {
        return { parentObjects: null, targetObject: null };
    }

    const parentObjects: GqlObjectDef[] = [];
    let targetObject = introspection.getRootObject();

    pathSpecs.forEach((spec) => {
        parentObjects.push(targetObject);
        const field = targetObject.fields.get(spec.fieldName);
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
    const pathSpecs = params._splat ? parseUrlPath(params._splat) : [];

    const { introspection, queryBuilder } = useQueryBuilder();
    const { targetObject } = getObjects(introspection, pathSpecs);

    const gqlQueryString =
        queryBuilder && targetObject ? queryBuilder.makeFullQuery(pathSpecs, targetObject) : null;

    const { data: fullData } = useQuery(
        gqlQueryString ? gql(gqlQueryString) : gql(getIntrospectionQuery()),
        { skip: !targetObject },
    );

    if (!(targetObject && fullData)) {
        return null;
    }

    let targetData = fullData;

    pathSpecs.forEach((spec) => {
        if (typeof targetData === "object" && !Array.isArray(targetData) && targetData !== null) {
            targetData = targetData[spec.fieldName];
        } else {
            throw new TargetDataNotFoundError();
        }

        if (spec.arrayIndex !== null) {
            if (Array.isArray(targetData)) {
                targetData = targetData[spec.arrayIndex];
            } else {
                throw new TargetDataNotFoundError();
            }
        }
    });

    if (targetData && Array.isArray(targetData)) {
        return <GqlList def={targetObject} data={targetData} parentPathSpecs={pathSpecs} />;
    } else {
        return (
            <GqlObject
                def={targetObject}
                data={(targetData || {}) as GqlObjectType}
                parentPathSpecs={pathSpecs}
            />
        );
    }
}

export default App;
