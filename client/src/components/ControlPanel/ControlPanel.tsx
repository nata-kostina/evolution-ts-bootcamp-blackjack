import React from "react";
import { observer } from "mobx-react-lite";
import { Balance } from "../Balance/Balance";
import { BetsForm } from "../BetsForm/BetsForm";
import { PlayerActions } from "../PlayerActions/PlayerActions";
import "./styles.css";
import { Table } from "../Table/Table";

export const ControlPanel = observer(() => {
    return (
        <div>

            <Balance />
            <BetsForm />
            <PlayerActions />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Table />
            </div>

            {/* <button onClick={() => {
                connection.socket.disconnect();
            }}
            >Disconnect
            </button>
            <button onClick={() => {
                game.imitateErrorResponse();
            }}
            >Disconnect a player
            </button> */}
        </div>
    );
});
