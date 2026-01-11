import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { Input } from "./Form";

const meta = {
    title: "Components/Form",
    component: Input,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    args: { disabled: false, onChange: fn() },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ScalarNullable: Story = {
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
        await expect(canvas.getByLabelText("omit")).toBeChecked();
        await expect(canvas.getByLabelText("set null")).not.toBeChecked();
        await expect(canvas.getByLabelText("set value")).not.toBeChecked();
        await expect(canvas.getByLabelText("FieldName:")).toBeDisabled();
        await expect(args.onChange).toHaveBeenLastCalledWith(undefined);

        // check the box that enables the input
        await userEvent.click(canvas.getByLabelText("set value"));
        await expect(canvas.getByLabelText("set value")).toBeChecked();
        await expect(canvas.getByLabelText("FieldName:")).toBeEnabled();
        await expect(args.onChange).toHaveBeenLastCalledWith("");

        // type something
        await userEvent.type(canvas.getByLabelText("FieldName:"), "abcd");
        await expect(args.onChange).toHaveBeenLastCalledWith("abcd");

        // set null
        await userEvent.click(canvas.getByLabelText("set null"));
        await expect(canvas.getByLabelText("set null")).toBeChecked();
        await expect(args.onChange).toHaveBeenLastCalledWith(null);
    },
};

export const ScalarNonNullable: Story = {
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

export const ListNullable: Story = {
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
        await expect(canvas.getByLabelText("set value")).not.toBeChecked();
        await expect(args.onChange).toHaveBeenLastCalledWith(undefined);

        // add an input
        await userEvent.click(canvas.getByLabelText("add item"));
        await expect(args.onChange).toHaveBeenLastCalledWith(undefined);

        // enable
        await userEvent.click(canvas.getByLabelText("set value"));
        await expect(args.onChange).toHaveBeenLastCalledWith([""]);

        // disble
        await userEvent.click(canvas.getByLabelText("set null"));
        await expect(args.onChange).toHaveBeenLastCalledWith(null);
    },
};

export const ListNonNullable: Story = {
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

export const ObjectNullable: Story = {
    args: {
        name: "FieldName",
        type: {
            name: "SimpleInput",
            kind: "INPUT_OBJECT",
            isNullable: true,
            isList: false,
            isListNullable: false,
        },
    },
    play: async ({ args, canvasElement, userEvent }) => {
        const canvas = within(canvasElement);

        await expect(await canvas.findAllByLabelText("add item")).toHaveLength(2);

        // initially omitted
        await expect(args.onChange).toHaveBeenLastCalledWith(undefined);

        // set to null
        await userEvent.click(canvas.getAllByLabelText("set null")[0]);
        await expect(args.onChange).toHaveBeenLastCalledWith(null);

        // enable
        await userEvent.click(canvas.getAllByLabelText("set value")[0]);
        await expect(args.onChange).toHaveBeenLastCalledWith({
            nonNullableListOfNonNullableStrings: [],
        });
    },
};

export const ObjectNonNullable: Story = {
    args: {
        name: "FieldName",
        type: {
            name: "SimpleInput",
            kind: "INPUT_OBJECT",
            isNullable: false,
            isList: false,
            isListNullable: false,
        },
    },
    play: async ({ args, canvasElement, userEvent }) => {
        const canvas = within(canvasElement);

        await expect(await canvas.findAllByRole("radio")).toHaveLength(6);

        // change string field
        await userEvent.click(canvas.getAllByLabelText("set value")[0]);
        await userEvent.type(canvas.getAllByRole("textbox")[0], "foo");
        await expect(args.onChange).toHaveBeenLastCalledWith({
            nullableString: "foo",
            nonNullableListOfNonNullableStrings: [],
        });
    },
};
