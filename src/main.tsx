import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import { router } from "./router";

const client = new ApolloClient({
    link: new HttpLink({ uri: "https://countries.trevorblades.com/" }),
    cache: new InMemoryCache(),
});

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
