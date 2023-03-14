import React from "react";
import { observer } from "mobx-react-lite";
import "./styles.css";
import { uiStore } from "../../store";

export const Balance = observer(() => {
    return (
        <>{uiStore.session && (
            <div className="balance">
                <div className="balance-amount">
                    <div>Balance</div>
                    <span>{uiStore.session.player.balance}</span>
                </div>
                <div className="bet-amount">
                    <div>Bet</div>
                    <span>{uiStore.session.player.bet}</span>
                </div>
            </div>
        )}
        </>
    );
});
