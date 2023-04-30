import { UIStore } from "../stores/UI.store";
import { IBetCanvasElement } from "../types/canvas.types";
import { Seat } from "../types/game.types";
import { ClientToServerEvents, RequestParameters } from "../types/socket.types";

type RequestHandler = (request: RequestParameters<keyof ClientToServerEvents>) => void;

export class CanvasController {
    private readonly uiStore: UIStore;
    private _requestHandler: RequestHandler | null = null;

    public constructor(uiStore: UIStore) {
        this.uiStore = uiStore;
    }

    public set requestHandler(request: RequestHandler | null) {
        this._requestHandler = request;
    }

    public addBet(value: number): void {
        this.uiStore.addBet(value);
    }

    public setBetElement(betElement: IBetCanvasElement): void {
        this.uiStore.betElement = betElement;
    }

    public chooseSeat(seat: Seat): void {
        const playerID = this.uiStore.player?.playerID;
        const roomID = this.uiStore.player?.roomID;
        if (this._requestHandler && playerID && roomID) {
            this._requestHandler({ event: "chooseSeat", payload: [{ playerID, roomID, seat }] });
        }
    }
}
