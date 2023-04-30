import { Server } from "socket.io";
import { SinglePlayerController } from "./controllers/SinglePlayer.controller.js";
import { PlayerStore } from "./store/Players.store.class.js";
import { ClientToServerEvents, Controller, ServerToClientEvents } from "./types/index.js";
import {
    actionSchema,
    betSchema,
    modeSchema,
    playerSchema,
    roomSchema,
    seatSchema,
    yesNoResponseSchema,
} from "./utils/validation.js";
import { GameStore } from "./store/Game.store.class.js";
import { IResponseManager, ResponseManager } from "./utils/responseManager.js";

export class AppServer {
    private readonly _IO: Server<ClientToServerEvents, ServerToClientEvents>;
    private readonly _responseManager: IResponseManager;
    private readonly _controller: Controller;

    public constructor(clientURL: string) {
        this._IO = new Server<ClientToServerEvents, ServerToClientEvents>(3000, {
            cors: {
                origin: clientURL,
            },
        });

        this._IO.engine.on("headers", (headers) => {
            headers["Access-Control-Allow-Credentials"] = true;
        });

        this._responseManager = new ResponseManager(this._IO);
        this._controller = new SinglePlayerController(PlayerStore, GameStore, this._responseManager);
    }

    public listen(): void {
        this._IO.on("connection", (socket) => {
            socket.on("initGame", async ({ playerID, mode }) => {
                try {
                    const { error } = modeSchema.validate(mode);
                    if (error) {
                        throw new Error("Invalid parameter");
                    }

                    await this._controller.handleInitGame({ playerID, socket });
                } catch (e: unknown) {
                    this._IO.to(socket.id).emit("initGame", { ok: false, statusText: "Failed to initialize a game" });
                }
            });

            socket.on("makeDecision", async ({ roomID, playerID, action }) => {
                try {
                    const { error: roomSchemaError } = roomSchema.validate(roomID);
                    const { error: playerSchemaError } = playerSchema.validate(playerID);
                    const { error: actionSchemaError } = actionSchema.validate(action);
                    if (roomSchemaError || playerSchemaError || actionSchemaError) {
                        throw new Error("Invalid parameter");
                    }
                    await this._controller.handleDecision({ roomID, playerID, action });
                } catch (e: unknown) {
                    this._IO.to(socket.id).emit("updateSession", { ok: false, statusText: "Failed to handle player's decision" });
                }
            });

            socket.on("placeBet", async ({ roomID, playerID, bet }) => {
                try {
                    const { error: roomSchemaError } = roomSchema.validate(roomID);
                    const { error: playerSchemaError } = playerSchema.validate(playerID);
                    const { error: betSchemaError } = betSchema.validate(bet, {
                        context: { min: 0.1, max: PlayerStore.getPlayerBalance(playerID) },
                    });
                    if (roomSchemaError || playerSchemaError || betSchemaError) {
                        throw new Error("Invalid parameter");
                    }
                    await this._controller.handlePlaceBet({ roomID, playerID, bet, socketID: socket.id });
                    await this._controller.startPlay({ roomID, playerID });
                } catch (e: unknown) {
                    this._IO.to(socket.id).emit("updateSession", { ok: false, statusText: "Failed to handle placing bet" });
                }
            });

            socket.on("takeMoneyDecision", async ({ roomID, playerID, response }) => {
                try {
                    const { error: roomSchemaError } = roomSchema.validate(roomID);
                    const { error: playerSchemaError } = playerSchema.validate(playerID);
                    const { error: responseSchemaError } = yesNoResponseSchema.validate(response);
                    if (roomSchemaError || playerSchemaError || responseSchemaError) {
                        throw new Error("Invalid parameter");
                    }
                    await this._controller.handleTakeMoneyDecision({ roomID, playerID, response });
                } catch (e: unknown) {
                    this._IO.to(socket.id).emit("updateSession", { ok: false, statusText: "Failed to handle player's decision" });
                }
            });

            socket.on("chooseSeat", ({ roomID, playerID, seat }) => {
                try {
                    const { error: roomSchemaError } = roomSchema.validate(roomID);
                    const { error: playerSchemaError } = playerSchema.validate(playerID);
                    const { error: seatSchemaError } = seatSchema.validate(seat);
                    if (roomSchemaError || playerSchemaError || seatSchemaError) {
                        throw new Error("Invalid parameter");
                    }
                    this._controller.handleChooseSeat({ roomID, playerID, seat });
                } catch (e: unknown) {
                    this._IO.to(socket.id).emit("updateSession", { ok: false, statusText: "Failed to handle choose seat" });
                }
            });

            socket.on("disconnect", () => {
                console.log(`Socket ${socket.id} was disconnected`);
            });
        });
    }
}
