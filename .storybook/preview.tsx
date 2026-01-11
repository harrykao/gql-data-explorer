import { gql } from "@apollo/client";
import { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import type { Preview } from "@storybook/react-vite";
import { getIntrospectionQuery, IntrospectionQuery } from "graphql";
import React from "react";
import { IntrospectionProvider } from "../src/IntrospectionProvider";
import { default as defaultIntrospectionData } from "../src/test_schemas/introspection_data.json";
import withRouter from "./routerDecorator";

function makeIntrospectionMock(schema: IntrospectionQuery): MockLink.MockedResponse {
    return {
        request: {
            query: gql(getIntrospectionQuery()),
        },
        result: {
            data: schema,
        },
    };
}

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
        (Story, context) => {
            const { parameters } = context;
            return (
                <MockedProvider
                    mocks={[
                        makeIntrospectionMock(
                            (parameters.introspectionData ??
                                defaultIntrospectionData) as IntrospectionQuery,
                        ),
                    ]}
                >
                    <IntrospectionProvider>
                        <Story />
                    </IntrospectionProvider>
                </MockedProvider>
            );
        },
        withRouter,
    ],
};

export default preview;
