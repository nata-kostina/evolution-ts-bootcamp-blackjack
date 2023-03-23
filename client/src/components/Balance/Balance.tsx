import React from "react";
import { observer } from "mobx-react-lite";
import "./styles.css";
import { game } from "../../store";

export const Balance = observer(() => {
    return (
        <>{game.ui.player && (
            <div className="balance">
                <div className="balance-amount">
                    <div>Balance</div>
                    <span>{game.ui.player.balance}</span>
                </div>
                <div className="bet-amount">
                    <div>Bet</div>
                    <span>{game.ui.player.bet}</span>
                </div>
            </div>
        )}
        </>
    );
});
