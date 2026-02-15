import { ApolloProvider } from "@apollo/client/react";
import { RouterProvider } from "@tanstack/react-router";
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { client } from "./apollo";
import { ConfigurationProvider } from "./configurationProvider";
import { IntrospectionProvider } from "./introspectionProvider";
import { router } from "./router";

const rootEl = document.getElementById("root");

if (rootEl) {
    createRoot(rootEl).render(
        <StrictMode>
            <ConfigurationProvider>
                <ApolloProvider client={client}>
                    <IntrospectionProvider>
                        <RouterProvider router={router} />
                    </IntrospectionProvider>
                </ApolloProvider>
            </ConfigurationProvider>
        </StrictMode>,
    );
}
