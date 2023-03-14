import React from "react";
import { Card, DealerInstance, PlayerInstance, SeatPlace } from "../../types/types";
import { CardItem } from "../Card/CardItem";
import { CardList } from "../CardList/CardList";

interface Props {
    type: SeatPlace;
    member: PlayerInstance | DealerInstance;
    cards: Card[];
    points: number;
}

export const Seat = ({ type, cards, points, member }: Props) => {
    return (
        <div>
            <span>Type: {type}</span>
            <div>
                <CardList points={points} cards={cards}>
                    {isDealer(member) && member.hasHole &&
                        <CardItem card={{ id: "HOLE", suit: "HOLE", value: "HOLE" }} />}
                </CardList>
            </div>
        </div>
    );
};

export function isDealer(member: PlayerInstance | DealerInstance): member is DealerInstance {
    return "hasHole" in member;
}
