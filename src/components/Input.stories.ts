import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { Input } from "./Form";

const meta = {
    title: "Arguments/Input",
    component: Input,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    args: { onChange: fn() },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NullableScalar: Story = {
    args: {
        name: "FieldName",
        type: {
            name: "TypeName",
            kind: "SCALAR",
            isNullable: true,
            isList: false,
            isListNullable: true,
        },
    },
    play: async ({ args, canvasElement, userEvent }) => {
        const canvas = within(canvasElement);

        await expect(await canvas.findByText("(TypeName)")).toBeInTheDocument();

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

export const NonNullableScalar: Story = {
    args: {
        name: "FieldName",
        type: {
            name: "TypeName",
            kind: "SCALAR",
            isNullable: false,
            isList: false,
            isListNullable: true,
        },
    },
    play: async ({ args, canvasElement, userEvent }) => {
        const canvas = within(canvasElement);

        await expect(await canvas.findByText("(TypeName!)")).toBeInTheDocument();

        await userEvent.type(canvas.getByLabelText("FieldName:"), "abcd");
        await expect(args.onChange).toHaveBeenLastCalledWith("abcd");
    },
};
