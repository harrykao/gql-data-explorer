import { describe, expect, it } from "vitest";
import { makeUrlPath, parseUrlPath, PathSpec } from "./pathSpecs";

describe("PathSpec serialization", () => {
    it("serializes field name", () => {
        const spec = new PathSpec("fieldName", null, null);
        const str = spec.toString();
        expect(PathSpec.fromString(str)).toEqual(spec);
    });

    it("serializes array index", () => {
        const spec = new PathSpec("fieldName", null, 2);
        const str = spec.toString();
        expect(PathSpec.fromString(str)).toEqual(spec);
    });

    it("serializes params", () => {
        const spec = new PathSpec("fieldName", { paramName: '(["/])' }, null);
        const str = spec.toString();
        expect(PathSpec.fromString(str)).toEqual(spec);
    });

    it("serializes params and array index", () => {
        const spec = new PathSpec("fieldName", { paramName: '(["/])' }, 2);
        const str = spec.toString();
        expect(PathSpec.fromString(str)).toEqual(spec);
    });
});

describe("URL serialization", () => {
    it("makes and parses URL path", () => {
        const specs = [
            new PathSpec("parentField", null, null),
            new PathSpec("fieldName", { paramName: '(["/])' }, 2),
        ];
        const urlPath = makeUrlPath(specs);
        expect(parseUrlPath(urlPath)).toEqual(specs);
    });
});
