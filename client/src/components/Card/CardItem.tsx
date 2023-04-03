/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { observer } from "mobx-react-lite";
import {
    BsFillSuitDiamondFill,
    BsFillSuitClubFill,
    BsFillSuitHeartFill,
    BsFillSuitSpadeFill,
} from "react-icons/bs";
import { Card } from "../../types/types";
import "./styles.css";

interface Props {
    card: Card;
}

const suitMap = {
    diamonds: <BsFillSuitDiamondFill fill="red" />,
    clubs: <BsFillSuitClubFill fill="black" />,
    hearts: <BsFillSuitHeartFill fill="red" />,
    spades: <BsFillSuitSpadeFill fill="black" />,
    hole: <div>XXX</div>,
};

export const CardItem = observer(({ card }: Props) => {
    return (
        <div className="card">
            {/* <span className="suit">
                {card.suit}
            </span>
            <span className="value">
                {suitMap[card.suit as keyof typeof suitMap]}
            </span> */}
        </div>
    );
});
