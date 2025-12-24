import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Link, useParams } from "@tanstack/react-router";
import { getIntrospectionQuery } from "graphql";
import React from "react";
import { GqlObject } from "./introspection";
import useQueryBuilder from "./queryBuilder";

// TODO
function App() {
    const params = useParams({ strict: false });
    const splat = params._splat;
    const { introspection, queryBuilder } = useQueryBuilder();

    const parentObjects: GqlObject[] = [];
    const parentSpecs: string[] = [];

    if (introspection && splat) {
        // TODO: extend to multiple levels
        parentObjects.push(introspection?.getRootObject());
        parentSpecs.push(splat);
    }

    let targetObject: GqlObject | null = null;

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
        return (
            <>
                {targetData.map((row) => (
                    <div>{Object.values(row)}</div>
                ))}
            </>
        ); // TODO: add key
    }

    return (
        <>
            {[...targetObject.fields.values()].map((f) => {
                if (f.requiresArguments) {
                    return <div key={f.name}>{f.name}</div>;
                } else {
                    return (
                        <div key={f.name}>
                            <Link to={`/${f.name}`}>{f.name}</Link>
                        </div>
                    );
                }
            })}
        </>
    );
}

export default App;
