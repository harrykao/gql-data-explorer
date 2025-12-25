export class PathSpec {
    fieldName: string;
    arrayIndex: number | null;

    constructor(fieldName: string, arrayIndex: number | null) {
        this.fieldName = fieldName;
        this.arrayIndex = arrayIndex;
    }

    toString(): string {
        let str = this.fieldName;
        str += this.arrayIndex === null ? "" : `[${this.arrayIndex}]`;
        return str;
    }

    static fromString(str: string): PathSpec {
        let fieldName = str;
        let arrayIndex: number | null = null;

        if (str.endsWith("]")) {
            const openBracketIndex = str.lastIndexOf("[");
            const indexStr = str.substring(openBracketIndex + 1, str.length - 1);
            fieldName = str.substring(0, openBracketIndex);
            arrayIndex = Number(indexStr);
        }

        return new PathSpec(fieldName, arrayIndex);
    }
}

export function makeUrlPath(parts: readonly PathSpec[]): string {
    return parts.map((p) => encodeURIComponent(p.toString())).join("/");
}

export function parseUrlPath(path: string): PathSpec[] {
    return path.split("/").map((p) => PathSpec.fromString(decodeURIComponent(p)));
}
