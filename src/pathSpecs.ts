export class PathSpec {
    fieldName: string;
    args: Record<string, unknown> | null;
    arrayIndex: number | null;

    constructor(
        fieldName: string,
        args: Record<string, unknown> | null,
        arrayIndex: number | null,
    ) {
        this.fieldName = fieldName;
        this.args = args;
        this.arrayIndex = arrayIndex;
    }

    toString(): string {
        let str = this.fieldName;

        if (this.args !== null && Object.keys(this.args).length > 0) {
            str = `${str}(${JSON.stringify(this.args)})`;
        }
        if (this.arrayIndex !== null) {
            str += `[${String(this.arrayIndex)}]`;
        }

        return str;
    }

    static fromString(str: string): PathSpec {
        let args: Record<string, unknown> | null = null;
        let arrayIndex: number | null = null;

        if (str.endsWith("]")) {
            const openBracketIndex = str.lastIndexOf("[");
            const indexStr = str.substring(openBracketIndex + 1, str.length - 1);
            str = str.substring(0, openBracketIndex);
            arrayIndex = Number(indexStr);
        }

        if (str.endsWith(")")) {
            const openParenIndex = str.indexOf("(");
            const argStr = str.substring(openParenIndex + 1, str.length - 1);
            str = str.substring(0, openParenIndex);
            args = JSON.parse(argStr) as Record<string, unknown>;
        }

        return new PathSpec(str, args, arrayIndex);
    }
}

export function makeUrlPath(parts: readonly PathSpec[]): string {
    return parts.map((p) => encodeURIComponent(p.toString())).join("/");
}

export function parseUrlPath(path: string): PathSpec[] {
    return path.split("/").map((p) => PathSpec.fromString(decodeURIComponent(p)));
}
