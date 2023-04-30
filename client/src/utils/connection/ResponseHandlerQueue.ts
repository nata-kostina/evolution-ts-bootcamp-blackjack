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
        return new Promise<void>((resolve, reject) => {
            this._queue.push({ handler, resolve, reject });
            this.dequeue().then(() => {}).catch(() => {});
        });
    }

    public async dequeue(): Promise<void> {
        if (this._pendingPromise) { return; }

        const item = this._queue[0];
        this._queue = this._queue.slice(1);
        if (!item) { return; }

        try {
            this._pendingPromise = true;
            const payload = await item.handler();

            this._pendingPromise = false;
            item.resolve(payload);
        } catch (e) {
            this._pendingPromise = false;
            item.reject();
        } finally {
            await this.dequeue();
        }
    }
}
