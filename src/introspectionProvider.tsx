import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { getIntrospectionQuery, IntrospectionQuery } from "graphql";
import React from "react";
import { Introspection, IntrospectionContext } from "./introspection";

export const IntrospectionProvider = ({ children }) => {
    const { data } = useQuery<IntrospectionQuery>(gql(getIntrospectionQuery()));
    return (
        <IntrospectionContext.Provider value={data ? new Introspection(data) : null}>
            {children}
        </IntrospectionContext.Provider>
    );
};
