import { gql } from "@apollo/client";
import { MockLink } from "@apollo/client/testing";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Config } from "../configuration";
import { getTestSchema } from "../test_schemas/testSchemas";
import App from "./App";

const meta = {
    title: "Components/App",
    component: App,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof App>;

export default meta;

type Story = StoryObj<typeof meta>;

const TEST_SCHEMA = `
    type Query {
        singleObjectField: SimpleObject!
        listField: [SimpleObject!]!
    }

    type SimpleObject {
        field1: String!
        field2: String!
        nestedObject: SimpleObject
    }
`;

export const WithInvalidConfig: Story = {
    parameters: {
        config: { views: [{ objectName: "MissingObject", fields: [] }] } as Config,
        introspectionData: getTestSchema(TEST_SCHEMA),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(
            await canvas.findByText("Configuration validation errors:"),
        ).toBeInTheDocument();
        await expect(canvas.getByText("Type `MissingObject` does not exist.")).toBeInTheDocument();
    },
};

export const ObjectWithNoConfig: Story = {
    parameters: {
        introspectionData: getTestSchema(TEST_SCHEMA),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText("singleObjectField")).toBeInTheDocument();
        await expect(canvas.getByText("listField")).toBeInTheDocument();
    },
};

export const ObjectWithConfig: Story = {
    parameters: {
        config: {
            views: [
                {
                    objectName: "Query",
                    fields: [{ path: ["singleObjectField"], displayName: "Simple Object Field" }],
                },
            ],
        } as Config,
        introspectionData: getTestSchema(TEST_SCHEMA),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // defaults to raw view
        await expect(await canvas.findByText("singleObjectField")).toBeInTheDocument();
        await expect(canvas.getByText("listField")).toBeInTheDocument();

        // switch to view from config
        await userEvent.click(canvas.getByRole("link", { name: "VIEW" }));

        await expect(canvas.getByText("Simple Object Field")).toBeInTheDocument();
        await expect(canvas.queryByText("listField")).not.toBeInTheDocument();
    },
};

export const ObjectWithMultiPathConfig: Story = {
    parameters: {
        urlPath: "/singleObjectField",
        config: {
            views: [
                {
                    objectName: "SimpleObject",
                    fields: [
                        { path: ["nestedObject", "field1"], displayName: "Nested Object Field 1" },
                    ],
                },
            ],
        } as Config,
        introspectionData: getTestSchema(TEST_SCHEMA),
        mockResponses: [
            // request when we're using the raw view
            {
                request: {
                    query: gql(`
                        {
                            singleObjectField {
                                field1
                                field2
                                __typename
                            }
                        }
                    `),
                },
                result: {
                    data: {
                        singleObjectField: {
                            field1: "field 1 value",
                            field2: "field 2 value",
                            __typename: "SimpleObject",
                        },
                    },
                },
            } as MockLink.MockedResponse,
            // request when we're using the view from the config
            {
                request: {
                    query: gql(`
                        {
                            singleObjectField {
                                nestedObject {
                                    field1
                                }
                                __typename
                            }
                        }
                    `),
                },
                result: {
                    data: {
                        singleObjectField: {
                            nestedObject: {
                                field1: "field 1 value",
                            },
                            __typename: "SimpleObject",
                        },
                    },
                },
            } as MockLink.MockedResponse,
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(await canvas.findByRole("link", { name: "VIEW" }));
        await expect(
            await canvas.findByText("Nested Object Field 1: field 1 value"),
        ).toBeInTheDocument();
    },
};

export const ObjectWithLinkPath: Story = {
    parameters: {
        config: {
            views: [
                {
                    objectName: "Query",
                    fields: [
                        {
                            path: ["singleObjectField", "nestedObject", "field1"],
                            displayName: "Simple Object Field",
                            linkPath: ["singleObjectField", "nestedObject"],
                        },
                    ],
                },
            ],
        } as Config,
        introspectionData: getTestSchema(TEST_SCHEMA),
        mockResponses: [
            {
                request: {
                    query: gql(`
                        {
                            singleObjectField {
                                nestedObject {
                                    field1
                                    __typename
                                }
                                __typename
                            }
                            __typename
                        }
                    `),
                },
                result: {
                    data: {
                        singleObjectField: {
                            nestedObject: {
                                field1: "field 1 value",
                                __typename: "SimpleObject",
                            },
                            __typename: "SimpleObject",
                        },
                        __typename: "Query",
                    },
                },
            } as MockLink.MockedResponse,
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // switch to view from config
        await userEvent.click(await canvas.findByRole("link", { name: "VIEW" }));

        await expect(await canvas.findByText("Simple Object Field:")).toBeInTheDocument();
        await expect(canvas.getByRole("link", { name: "field 1 value" })).toBeInTheDocument();
        await expect(canvas.getByRole("link", { name: "field 1 value" })).toHaveAttribute(
            "href",
            "/singleObjectField/nestedObject",
        );
    },
};

export const ListWithNoConfig: Story = {
    parameters: {
        urlPath: "/listField",
        introspectionData: getTestSchema(TEST_SCHEMA),
        mockResponses: [
            {
                request: {
                    query: gql(`
                        {
                            listField {
                                field1
                                field2
                                __typename
                            }
                        }
                    `),
                },
                result: {
                    data: {
                        listField: [
                            {
                                field1: "row 1, field 1",
                                field2: "row 1, field 2",
                                __typename: "SimpleObject",
                            },
                            {
                                field1: "row 2, field 1",
                                field2: "row 2, field 2",
                                __typename: "SimpleObject",
                            },
                        ],
                    },
                },
            } as MockLink.MockedResponse,
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText("field1")).toBeInTheDocument();
        await expect(canvas.getByText("field2")).toBeInTheDocument();
    },
};

export const ListWithConfig: Story = {
    parameters: {
        config: {
            views: [
                {
                    objectName: "SimpleObject",
                    fields: [{ path: ["field1"], displayName: "Field 1" }],
                },
            ],
        } as Config,
        urlPath: "/listField",
        introspectionData: getTestSchema(TEST_SCHEMA),
        mockResponses: [
            // request when we're using the raw view
            {
                request: {
                    query: gql(`
                        {
                            listField {
                                field1
                                field2
                                __typename
                            }
                        }
                    `),
                },
                result: {
                    data: {
                        listField: [
                            {
                                field1: "row 1, field 1",
                                field2: "row 1, field 2",
                                __typename: "SimpleObject",
                            },
                            {
                                field1: "row 2, field 1",
                                field2: "row 2, field 2",
                                __typename: "SimpleObject",
                            },
                        ],
                    },
                },
            } as MockLink.MockedResponse,
            // request when we're using the view from the config
            {
                request: {
                    query: gql(`
                        {
                            listField {
                                field1
                                __typename
                            }
                        }
                    `),
                },
                result: {
                    data: {
                        listField: [
                            {
                                field1: "row 1, field 1",
                                __typename: "SimpleObject",
                            },
                            {
                                field1: "row 2, field 1",
                                __typename: "SimpleObject",
                            },
                        ],
                    },
                },
            } as MockLink.MockedResponse,
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(await canvas.findByRole("link", { name: "VIEW" }));
        await expect(await canvas.findByText("Field 1")).toBeInTheDocument();
        await expect(canvas.queryByText("field2")).not.toBeInTheDocument();
    },
};

export const ListWithLinkPath: Story = {
    parameters: {
        config: {
            views: [
                {
                    objectName: "SimpleObject",
                    fields: [
                        {
                            path: ["nestedObject", "field1"],
                            displayName: "Field 1",
                            linkPath: ["nestedObject"],
                        },
                    ],
                },
            ],
        } as Config,
        urlPath: "/listField",
        introspectionData: getTestSchema(TEST_SCHEMA),
        mockResponses: [
            // request when we're using the raw view
            {
                request: {
                    query: gql(`
                        {
                            listField {
                                field1
                                field2
                                __typename
                            }
                        }
                    `),
                },
                result: {
                    data: {
                        listField: [
                            {
                                field1: "row 1, field 1",
                                field2: "row 1, field 2",
                                __typename: "SimpleObject",
                            },
                            {
                                field1: "row 2, field 1",
                                field2: "row 2, field 2",
                                __typename: "SimpleObject",
                            },
                        ],
                    },
                },
            } as MockLink.MockedResponse,
            // request when we're using the view from the config
            {
                request: {
                    query: gql(`
                        {
                            listField {
                                nestedObject {
                                    field1
                                    __typename
                                }
                                __typename
                            }
                        }
                    `),
                },
                result: {
                    data: {
                        listField: [
                            {
                                nestedObject: {
                                    field1: "row 1, field 1",
                                    __typename: "SimpleObject",
                                },
                                __typename: "SimpleObject",
                            },
                            {
                                nestedObject: {
                                    field1: "row 2, field 1",
                                    __typename: "SimpleObject",
                                },
                                __typename: "SimpleObject",
                            },
                        ],
                    },
                },
            } as MockLink.MockedResponse,
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(await canvas.findByRole("link", { name: "VIEW" }));
        await expect(
            await canvas.findByRole("link", { name: "row 1, field 1" }),
        ).toBeInTheDocument();
        await expect(canvas.getByRole("link", { name: "row 2, field 1" })).toBeInTheDocument();
    },
};
