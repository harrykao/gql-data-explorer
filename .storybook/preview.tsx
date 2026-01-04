import { gql } from "@apollo/client";
import { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import type { Preview } from "@storybook/react-vite";
import { getIntrospectionQuery } from "graphql";
import React from "react";
import introspectionData from "./introspection_data.json";
import withRouter from "./routerDecorator";

const INTROSPECTION_MOCK: MockLink.MockedResponse = {
    request: {
        query: gql(getIntrospectionQuery()),
    },
    result: {
        data: introspectionData,
    },
};

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        a11y: {
            // 'todo' - show a11y violations in the test UI only
            // 'error' - fail CI on a11y violations
            // 'off' - skip a11y checks entirely
            test: "todo",
        },
        layout: "centered",
    },
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <MockedProvider mocks={[INTROSPECTION_MOCK]}>
                <Story />
            </MockedProvider>
        ),
        withRouter,
    ],
};

export default preview;
