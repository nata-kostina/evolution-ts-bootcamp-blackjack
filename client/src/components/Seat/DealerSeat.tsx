import { observer } from "mobx-react-lite";
import React from "react";
import { game } from "../../store";
import { CardItem } from "../Card/CardItem";
import { CardList } from "../CardList/CardList";

export const DealerSeat = observer(() => {
    return (
        <div style={{ border: "2px solid purple", width: "200px", height: "300px" }}>
            {game.ui.dealer && (
                <CardList points={game.ui.dealer.points} cards={game.ui.dealer.cards}>
                    {game.ui.dealer.hasHoleCard && <CardItem card={{ id: "HOLE_CARD", suit: "hole", value: "hole" }} />}
                </CardList>
            )}
        </div>
    );
});
