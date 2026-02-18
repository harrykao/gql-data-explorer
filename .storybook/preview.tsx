import { gql } from "@apollo/client";
import { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import type { Preview } from "@storybook/react-vite";
import { getIntrospectionQuery, IntrospectionQuery } from "graphql";
import React from "react";
import { Config } from "../src/configuration";
import { MockedConfigurationProvider } from "../src/configurationProvider";
import { IntrospectionProvider } from "../src/introspectionProvider";
import { MockedRouterProvider } from "../src/routerMock";
import { getTestSchema, QUERY_BUILDER_TEST_SCHEMA } from "../src/test_schemas/testSchemas";
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
            const config = parameters.config ? (parameters.config as Config) : { views: [] };
            const urlPath = parameters.urlPath ? (parameters.urlPath as string) : null;
            const introspectionData = parameters.introspectionData
                ? (parameters.introspectionData as IntrospectionQuery)
                : getTestSchema(QUERY_BUILDER_TEST_SCHEMA);
            const mockResponses = parameters.mockResponses
                ? (parameters.mockResponses as MockLink.MockedResponse[])
                : [];

            return (
                <MockedConfigurationProvider config={config}>
                    <MockedProvider
                        mocks={[makeIntrospectionMock(introspectionData), ...mockResponses]}
                    >
                        <IntrospectionProvider>
                            <MockedRouterProvider component={Story} initialEntry={urlPath} />
                        </IntrospectionProvider>
                    </MockedProvider>
                </MockedConfigurationProvider>
            );
        },
        withRouter,
    ],
};

export default preview;
