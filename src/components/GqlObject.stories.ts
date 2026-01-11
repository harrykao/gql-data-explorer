import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import testSchemaWithNode from "../test_schemas/with_node.json";
import testSchemaWithoutNode from "../test_schemas/without_node.json";
import GqlObject from "./GqlObject";

const meta = {
    title: "Components/GqlObject",
    component: GqlObject,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof GqlObject>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ScalarField: Story = {
    parameters: { introspectionData: testSchemaWithoutNode },
    args: {
        def: {
            description: "Object description.",
            fields: new Map([
                [
                    "scalarField",
                    {
                        name: "scalarField",
                        description: "A field.",
                        type: {
                            name: "String",
                            kind: "SCALAR",
                            isNullable: true,
                            isList: false,
                            isListNullable: true,
                        },
                        args: [],
                        requiresArguments: false,
                    },
                ],
            ]),
        },
        data: {
            __typename: "Incentive",
            scalarField: "a scalar value",
        },
        parentPathSpecs: [],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(await canvas.findByText("scalarField: a scalar value")).toBeInTheDocument();
        await expect(canvas.queryByLabelText("direct link")).not.toBeInTheDocument();
    },
};

export const ScalarFieldWithNodeQuery: Story = {
    parameters: { introspectionData: testSchemaWithNode },
    args: {
        def: {
            description: "Object description.",
            fields: new Map([
                [
                    "scalarField",
                    {
                        name: "scalarField",
                        description: "A field.",
                        type: {
                            name: "String",
                            kind: "SCALAR",
                            isNullable: true,
                            isList: false,
                            isListNullable: true,
                        },
                        args: [],
                        requiresArguments: false,
                    },
                ],
            ]),
        },
        data: {
            __typename: "Incentive",
            scalarField: "a scalar value",
        },
        parentPathSpecs: [],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(await canvas.findByText("scalarField: a scalar value")).toBeInTheDocument();
        await expect(canvas.queryByLabelText("direct link")).toBeInTheDocument();
    },
};
