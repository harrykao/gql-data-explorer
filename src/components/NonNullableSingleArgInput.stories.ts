import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { NonNullableSingleArgInput } from "./Form";

const meta = {
    title: "Arguments/Non-Nullable Single Arg Input",
    component: NonNullableSingleArgInput,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    args: { onChange: fn() },
} satisfies Meta<typeof NonNullableSingleArgInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        name: "FieldName",
        typeName: "TypeName",
    },
    play: async ({ args, canvasElement, userEvent }) => {
        const canvas = within(canvasElement);

        const hint = canvas.getByText("(TypeName!)");
        await expect(hint).toBeInTheDocument();

        await userEvent.type(canvas.getByLabelText("FieldName:"), "abcd");
        await expect(args.onChange).toHaveBeenLastCalledWith("abcd");
    },
};
