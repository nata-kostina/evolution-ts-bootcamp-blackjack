import { Server } from "socket.io";
import http from "http";
import { PlayerStore } from "./store/players.store.js";
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
import { GameStore } from "./store/game.store.js";
import { IResponseManager, ResponseManager } from "./utils/responseManager.js";
import { SinglePlayerController } from "./controllers/controller.js";

export class AppServer {
    private readonly _IO: Server<ClientToServerEvents, ServerToClientEvents>;
    private readonly _responseManager: IResponseManager;
    private readonly _controller: Controller;

    public constructor(httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) {
        this._IO = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
            cookie: false,
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
            transports: ["websocket"],
        },
        );

        this._IO.engine.on("headers", (headers) => {
            headers["Access-Control-Allow-Credentials"] = true;
        });

        this._responseManager = new ResponseManager(this._IO);
        this._controller = new SinglePlayerController(PlayerStore, GameStore, this._responseManager);
    }

    public listen(): void {
        // eslint-disable-next-line no-restricted-properties
        this._IO.listen(parseInt(<string>process.env.PORT, 10) || 3000);
        console.log("Server is listening...");
        this._IO.on("connection", (socket) => {
            console.log(`Socket: ${socket.id} was connected`);
            socket.on("initGame", async ({ playerID, mode, debug }) => {
                try {
                    const { error } = modeSchema.validate(mode);
                    if (error) {
                        throw new Error("Invalid parameter");
                    }

                    await this._controller.handleInitGame({ playerID, socket, debug });
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
