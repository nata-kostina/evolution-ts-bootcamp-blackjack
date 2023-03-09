import React from "react";
import { observer } from "mobx-react-lite";
import { player } from "../../store/index";
import "./styles.css";

export const Balance = observer(() => {
    return (
        <div className="balance">
            <div className="balance-amount">
                <div>Balance</div>
                <span>{player.balance}</span>
            </div>
            <div className="bet-amount">
                <div>Bet</div>
                <span>{player.bet}</span>
            </div>
        </div>
    );
});
