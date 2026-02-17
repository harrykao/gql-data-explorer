import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Config } from "../configuration";
import App from "./App";

const meta = {
    title: "Components/App",
    component: App,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof App>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithInvalidConfig: Story = {
    parameters: { config: { views: [{ objectName: "MissingObject", fields: [] }] } as Config },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(
            await canvas.findByText("Configuration validation errors:"),
        ).toBeInTheDocument();
        await expect(canvas.getByText("Type `MissingObject` does not exist.")).toBeInTheDocument();
    },
};

export const ObjectWithNoConfig: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText("rootField")).toBeInTheDocument();
    },
};

export const ObjectWithConfig: Story = {
    parameters: {
        config: {
            views: [
                {
                    objectName: "Query",
                    fields: [{ fieldName: "rootField", displayName: "Root Field" }],
                },
            ],
        } as Config,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText("Root Field")).toBeInTheDocument();
    },
};
