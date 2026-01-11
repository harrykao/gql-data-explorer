import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ApolloProvider } from "@apollo/client/react";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import { client } from "./apollo";
import { IntrospectionProvider } from "./IntrospectionProvider";
import { router } from "./router";

const rootEl = document.getElementById("root");

if (rootEl) {
    createRoot(rootEl).render(
        <StrictMode>
            <ApolloProvider client={client}>
                <IntrospectionProvider>
                    <RouterProvider router={router} />
                </IntrospectionProvider>
            </ApolloProvider>
        </StrictMode>,
    );
}
