import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Config } from "../configuration";
import { PathSpec } from "../pathSpecs";
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
    args: {
        pathSpecs: [new PathSpec("fieldName", null, null)],
        args: [],
        requiresArguments: false,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(
            await canvas.findByText("Configuration validation errors:"),
        ).toBeInTheDocument();
        await expect(canvas.getByText("Type `MissingObject` does not exist.")).toBeInTheDocument();
    },
};
