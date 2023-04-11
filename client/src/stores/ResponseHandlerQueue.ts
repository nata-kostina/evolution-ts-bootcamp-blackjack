export type Handler = () => Promise<void>;
export type QueueItem = {
    handler: Handler;
    resolve: (value: void | PromiseLike<void>) => void;
    reject: (value: void | PromiseLike<void>) => void;
};

export class ResponseQueue {
    private _queue: Array<QueueItem> = [];
    private _pendingPromise = false;

    public async enqueue(handler: Handler): Promise<void> {
        console.log("Enqueue");
        return new Promise<void>((resolve, reject) => {
            this._queue.push({ handler, resolve, reject });
            this.dequeue();
        });
    }

    public async dequeue(): Promise<boolean> {
        console.log("Dequeue, _pendingPromise: ", this._pendingPromise);

        if (this._pendingPromise) { return false; }

        const item = this._queue[0];
        this._queue = this._queue.slice(1);
        if (!item) { return false; }

        try {
            this._pendingPromise = true;
            console.log("Execute handler");
            const payload = await item.handler();

            this._pendingPromise = false;
            item.resolve(payload);
        } catch (e) {
            this._pendingPromise = false;
            item.reject();
        } finally {
            this.dequeue();
        }
        return true;
    }
}
