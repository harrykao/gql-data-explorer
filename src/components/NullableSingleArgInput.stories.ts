import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { NullableSingleArgInput } from "./Form";

const meta = {
    title: "Arguments/Nullable Single Arg Input",
    component: NullableSingleArgInput,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    args: { onChange: fn() },
} satisfies Meta<typeof NullableSingleArgInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        name: "FieldName",
        typeName: "TypeName",
    },
    play: async ({ args, canvasElement, userEvent }) => {
        const canvas = within(canvasElement);

        const hint = canvas.getByText("(TypeName)");
        await expect(hint).toBeInTheDocument();

        // initial state: unchecked and field is disabled
        await expect(canvas.getByRole("checkbox")).not.toBeChecked();
        await expect(canvas.getByLabelText("FieldName:")).toBeDisabled();
        await expect(args.onChange).toHaveBeenLastCalledWith(null);

        // check the box that enables the input
        await userEvent.click(canvas.getByRole("checkbox"));
        await expect(canvas.getByRole("checkbox")).toBeChecked();
        await expect(canvas.getByLabelText("FieldName:")).toBeEnabled();
        await expect(args.onChange).toHaveBeenLastCalledWith("");

        // type something
        await userEvent.type(canvas.getByLabelText("FieldName:"), "abcd");
        await expect(args.onChange).toHaveBeenLastCalledWith("abcd");

        // disable the input
        await userEvent.click(canvas.getByRole("checkbox"));
        await expect(args.onChange).toHaveBeenLastCalledWith(null);
    },
};
