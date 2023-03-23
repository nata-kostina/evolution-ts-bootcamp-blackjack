/* eslint-disable import/no-duplicates */
/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeAutoObservable, toJS } from "mobx";
import { reaction } from "mobx";
import { PlayerID, RoomID } from "../../types/socketTypes";
import {
    DealerInstance,
    Decision,
    GameSession,
    PlayerInstance,
    SeatPlace,
} from "../../types/types";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { UINotification } from "./UInotification";

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export type ForceStringType = {
    [place in SeatPlace]: PlayerInstance | null;
};

export class UIStore {
    // public session: GameSession | null = null;
    public betHistory: number[] = [];
    public playerID: PlayerID | null = null;
    public player: PlayerInstance | null = null;
    public roomID: RoomID = "";
    public players: Record<PlayerID, PlayerInstance> | null = null;

    public dealer: DealerInstance | null = null;
    public errorHandler: ErrorHandler = new ErrorHandler();
    public notification: UINotification = new UINotification();
    public seats: ForceStringType = {
        "left": null,
        "middle-left": null,
        "middle-right": null,
        "right": null,
    };

    public decisionHandler: ((decision: Decision) => void) | null = null;

    public constructor() {
        makeAutoObservable(this);
        reaction(
      () => this.players,
      (players) => {
          if (players) {
              const playersIDs = Object.keys(players);
              Object.keys(this.seats).forEach((seat) => {
                  const seatValue = this.seats[seat as keyof ForceStringType];
                  if (!(seatValue && playersIDs.includes(seatValue.playerID))) {
                      this.seats[seat as keyof ForceStringType] = null;
                  } else {
                      const prevPlayer = this.seats[seat as keyof ForceStringType];
                      if (prevPlayer) {
                          const pID = prevPlayer.playerID;
                          this.seats[seat as keyof ForceStringType] = players[pID];
                      }
                  }
              });
          } else {
              this.seats = {
                  "left": null,
                  "middle-left": null,
                  "middle-right": null,
                  "right": null,
              };
          }
      },
        );
    }

    public setPlayerID(playerID: PlayerID): void {
        this.playerID = playerID;
    }

    public setPlayerInfo(playerInfo: PlayerInstance): void {
    // const updatedState = this.session ? { ...this.session, player: playerInfo } : null;
    // this.session = updatedState;
    }

    public setDecisionHandler(handler: (decision: Decision) => void): void {
        this.decisionHandler = handler;
    }

    public resetDecisionHandler(): void {
        this.decisionHandler = null;
    }

    public setGameSession(session: GameSession): void {
        try {
            console.log("setGameSession");
            this.dealer = session.dealer;
            this.players = session.players;
            this.roomID = session.roomID;
            this.player = this.getPlayer(session.players);
        } catch (error) {}
    }

    public getPlayer(players: Record<PlayerID, PlayerInstance>): PlayerInstance {
        const playerID = Object.keys(players).find((p) => p === this.playerID);
        if (playerID) {
            return players[playerID];
        }
        throw new Error("Failed to get current player");
    }

    public placePlayers(): void {
        const prioritySeats: SeatPlace[] = [
            "right",
            "middle-right",
            "middle-left",
            "left",
        ];
        // prioritySeats.forEach((seat) => {

        // })
        if (this.players && Object.keys(this.players).length > 0) {
            Object.values(this.players).forEach((playerID, index) => {
                this.seats[prioritySeats[index]] = playerID;
            });
        }
    }

    public addBet(bet: number): void {
        try {
            if (this.player) {
                this.player.bet += bet;
                this.player.balance -= bet;
                this.betHistory.push(bet);
            } else {
                this.errorHandler.setHandler({ execute: () => {} });
            }
        } catch (error) {
            console.log("Failed to add bet");
        }
    }

    public undoBet(): void {
        try {
            const lastBet = this.betHistory.pop();
            if (lastBet && this.player) {
                this.player.bet -= lastBet;
                this.player.balance += lastBet;
            }
        } catch (error) {
            console.log("Failed to undo bet");
        }
    }

    public clearBets(): void {
        while (this.betHistory.length > 0) {
            this.undoBet();
        }
    }
}
