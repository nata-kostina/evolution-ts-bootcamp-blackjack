import React from "react";
import "./styles.css";

export const PlayerActions = () => {
    const handleDeal = () => { };
    return (
        <ul className="player-actions">
            <li className="action_item" />
            <li className="action_item"><button type="button" onClick={handleDeal}>Deal</button></li>
            <li className="action_item">Double</li>
        </ul>
    );
};
