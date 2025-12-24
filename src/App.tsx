import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from "@tanstack/react-router";
import { getIntrospectionQuery } from "graphql";
import React from "react";
import GqlList from "./GqlList";
import GqlObject from "./GqlObject";
import { GqlObjectDef } from "./introspection";
import useQueryBuilder from "./queryBuilder";

function App() {
    const params = useParams({ strict: false });
    const splat = params._splat;
    const { introspection, queryBuilder } = useQueryBuilder();

    const parentObjects: GqlObjectDef[] = [];
    const parentSpecs: string[] = [];

    if (introspection && splat) {
        // TODO: extend to multiple levels
        parentObjects.push(introspection?.getRootObject());
        parentSpecs.push(splat);
    }

    let targetObject: GqlObjectDef | null = null;

    if (introspection) {
        if (splat === "") {
            targetObject = introspection.getRootObject();
        } else {
            const parent = parentObjects[parentObjects.length - 1];
            const field = parent.fields.get(splat);
            if (field) {
                targetObject = introspection.getObjectByTypeName(field.type.name);
            }
        }
    }

    const gqlQueryString =
        queryBuilder && targetObject ? queryBuilder.makeFullQuery(parentSpecs, targetObject) : null;

    const { data: fullData } = useQuery(
        gqlQueryString ? gql(gqlQueryString) : gql(getIntrospectionQuery()),
        { skip: !gqlQueryString },
    );

    const targetData = fullData ? fullData[splat] : null;

    if (!targetObject) {
        return null;
    }

    if (gqlQueryString && !targetData) {
        return null;
    }

    if (targetData && Array.isArray(targetData)) {
        return <GqlList def={targetObject} data={targetData} />;
    } else {
        return <GqlObject def={targetObject} />;
    }
}

export default App;
