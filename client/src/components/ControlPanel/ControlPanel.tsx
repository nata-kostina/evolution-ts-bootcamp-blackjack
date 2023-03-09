import React from "react";
import { connection } from "../../store";
import { Balance } from "../Balance/Balance";
import { BetsForm } from "../BetsForm/BetsForm";
import { PlayerActions } from "../PlayerActions/PlayerActions";
import "./styles.css";

export const ControlPanel = () => {
    return (
        <div>
            <Balance />
            <BetsForm />
            <PlayerActions />
            <button onClick={() => {
                connection.socket.disconnect();
            }}
            >Disconnect
            </button>
        </div>
    );
};
