export function makeUrlPath(parts: readonly string[]): string {
    return parts.join("/");
}

export function parseUrlPath(path: string): string[] {
    return path.split("/");
}
