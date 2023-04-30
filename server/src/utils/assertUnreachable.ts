// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertUnreachable(value: never): never {
    throw new Error("Unreachable code");
}
