import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ApolloProvider } from "@apollo/client/react";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import { client } from "./apollo";
import { router } from "./router";

const rootEl = document.getElementById("root");

if (rootEl) {
    createRoot(rootEl).render(
        <StrictMode>
            <ApolloProvider client={client}>
                <RouterProvider router={router} />
            </ApolloProvider>
        </StrictMode>,
    );
}
