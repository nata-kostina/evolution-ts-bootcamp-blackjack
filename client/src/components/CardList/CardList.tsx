import React, { ReactNode } from "react";
import { Card } from "../../types/types";
import { CardItem } from "../Card/CardItem";
import "./styles.css";

interface Props {
    cards: Card[];
    points: number;
    children?: ReactNode;
}

export const CardList = ({ cards, points, children }: Props) => {
    return (
        <>
            {cards.length > 0 && (
                <>
                    <span>Points: {points}</span>
                    <ul className="card-list">
                        {cards.map((card) => <CardItem key={card.id} card={card} />)}
                        {children}
                    </ul>
                </>
            )}
        </>
    );
};
