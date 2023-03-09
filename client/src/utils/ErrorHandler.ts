interface IErrorHandler {
    execute: () => void;
}

export class ErrorHandler {
    public handler: IErrorHandler | null = null;

    public setHandler(handler: IErrorHandler): void {
        this.handler = handler;
    }

    public execute(): void {
        this.handler?.execute();
    }
}
