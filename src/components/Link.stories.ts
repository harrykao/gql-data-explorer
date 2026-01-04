import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { makeUrlPath, PathSpec } from "../pathSpecs";
import Link from "./Link";

const meta = {
    title: "Components/Link",
    component: Link,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    // args: { disabled: false, onChange: fn() },
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithoutArgs: Story = {
    args: {
        pathSpecs: [new PathSpec("fieldName", null, null)],
        args: [],
        requiresArguments: false,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.queryAllByRole("link")).toHaveLength(1);
        await expect(canvas.queryAllByRole("button")).toHaveLength(0);
        await expect(canvas.getByLabelText("query field")).toBeInTheDocument();
        await expect(canvas.getByLabelText("query field")).toHaveAttribute("href", "/fieldName");
    },
};

export const WithArgs: Story = {
    args: {
        pathSpecs: [new PathSpec("fieldName", null, null)],
        args: [
            {
                name: "argName",
                description: "Description.",
                type: {
                    kind: "SCALAR",
                    name: "TypeName",
                    isNullable: true,
                    isList: false,
                    isListNullable: true,
                },
                defaultValue: null,
            },
        ],
        requiresArguments: false,
    },
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement);

        await expect(canvas.queryAllByRole("link")).toHaveLength(1);
        await expect(canvas.queryAllByRole("button")).toHaveLength(1);
        await expect(canvas.getByLabelText("query field")).toBeInTheDocument();
        await expect(canvas.getByLabelText("query field")).toHaveAttribute("href", "/fieldName");

        // edit args
        await userEvent.click(canvas.getByLabelText("edit arguments"));
        await expect(canvas.getByLabelText("query field")).toHaveAttribute(
            "href",
            `/${encodeURI(makeUrlPath([new PathSpec("fieldName", { argName: null }, null)]))}`,
        );

        // cancel edit
        await userEvent.click(canvas.getByLabelText("remove arguments"));
        await expect(canvas.getByLabelText("query field")).toHaveAttribute("href", "/fieldName");
    },
};
