import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { Input } from "./Form";

const meta = {
    title: "Arguments/Input",
    component: Input,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    args: { disabled: false, onChange: fn() },
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
        await expect(canvas.getByLabelText("set non-null")).not.toBeChecked();
        await expect(canvas.getByLabelText("FieldName:")).toBeDisabled();
        await expect(args.onChange).toHaveBeenLastCalledWith(null);

        // check the box that enables the input
        await userEvent.click(canvas.getByLabelText("set non-null"));
        await expect(canvas.getByLabelText("set null")).toBeChecked();
        await expect(canvas.getByLabelText("FieldName:")).toBeEnabled();
        await expect(args.onChange).toHaveBeenLastCalledWith("");

        // type something
        await userEvent.type(canvas.getByLabelText("FieldName:"), "abcd");
        await expect(args.onChange).toHaveBeenLastCalledWith("abcd");

        // disable the input
        await userEvent.click(canvas.getByLabelText("set null"));
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

        await expect(await canvas.findByText("(TypeName)")).toBeInTheDocument();

        await userEvent.type(canvas.getByLabelText("FieldName:"), "abcd");
        await expect(args.onChange).toHaveBeenLastCalledWith("abcd");
    },
};

export const NullableList: Story = {
    args: {
        name: "FieldName",
        type: {
            name: "TypeName",
            kind: "SCALAR",
            isNullable: false,
            isList: true,
            isListNullable: true,
        },
    },
    play: async ({ args, canvasElement, userEvent }) => {
        const canvas = within(canvasElement);

        await expect(await canvas.findByText("FieldName:")).toBeInTheDocument();

        // initial state: null
        await expect(canvas.getByLabelText("set non-null")).not.toBeChecked();
        await expect(args.onChange).toHaveBeenLastCalledWith(null);

        // add an input
        await userEvent.click(canvas.getByLabelText("add item"));
        await expect(args.onChange).toHaveBeenLastCalledWith(null);

        // enable
        await userEvent.click(canvas.getByLabelText("set non-null"));
        await expect(args.onChange).toHaveBeenLastCalledWith([""]);

        // disble
        await userEvent.click(canvas.getByLabelText("set null"));
        await expect(args.onChange).toHaveBeenLastCalledWith(null);
    },
};

export const NonNullableList: Story = {
    args: {
        name: "FieldName",
        type: {
            name: "TypeName",
            kind: "SCALAR",
            isNullable: false,
            isList: true,
            isListNullable: false,
        },
    },
    play: async ({ args, canvasElement, userEvent }) => {
        const canvas = within(canvasElement);

        await expect(await canvas.findByText("FieldName:")).toBeInTheDocument();

        // initial state: no inputs
        await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
        await expect(args.onChange).toHaveBeenLastCalledWith([]);

        // add two inputs
        await userEvent.click(canvas.getByLabelText("add item"));
        await userEvent.click(canvas.getByLabelText("add item"));
        await expect(canvas.getAllByRole("textbox")).toHaveLength(2);
        await expect(args.onChange).toHaveBeenLastCalledWith(["", ""]);

        // type in the second one
        await userEvent.type(canvas.getByLabelText("2:"), "2");
        await expect(args.onChange).toHaveBeenLastCalledWith(["", "2"]);

        // add a third input
        await userEvent.click(canvas.getByLabelText("add item"));
        await expect(args.onChange).toHaveBeenLastCalledWith(["", "2", ""]);

        // type in first and third
        await userEvent.type(canvas.getByLabelText("1:"), "1");
        await userEvent.type(canvas.getByLabelText("3:"), "3");
        await expect(args.onChange).toHaveBeenLastCalledWith(["1", "2", "3"]);

        // remove the second (the third item gets renumbered from 3 -> 2)
        await userEvent.click(canvas.getByLabelText("remove item 2"));
        await expect(args.onChange).toHaveBeenLastCalledWith(["1", "3"]);
        await expect(canvas.getByText("1:")).toBeInTheDocument();
        await expect(canvas.getByText("2:")).toBeInTheDocument();

        // remove the (current) second
        await userEvent.click(canvas.getByLabelText("remove item 2"));
        await expect(args.onChange).toHaveBeenLastCalledWith(["1"]);
    },
};
