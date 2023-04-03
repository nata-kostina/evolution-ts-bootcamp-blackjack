/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { observer } from "mobx-react-lite";
import { game } from "../../store";
import {
    DealerInstance,
    PlayerInstance,
    SeatPlace,
} from "../../types/types";
import { CardList } from "../CardList/CardList";

interface Props {
    seatType: SeatPlace;
}

export const Seat = observer(({ seatType }: Props) => {
    // const player = game.ui.seats[seatType];
    return (
        <div style={{ border: "1px solid orange", width: "200px", height: "300px" }}>
            {/* {player && (
                <div>
                    <div><span>Player ID: </span>{player.playerID}</div>
                    <div><span>Balance: </span>{player.balance}</div>
                    <div><span>Bet: </span>{player.bet}</div>
                    <div><span>Insurance: </span>{player.insurance}</div>
                    <CardList points={player.points} cards={player.cards} />
                </div>
            )} */}

        </div>
    );
});

export function isDealer(
    member: PlayerInstance | DealerInstance,
): member is DealerInstance {
    return "hasHoleCard" in member;
}
