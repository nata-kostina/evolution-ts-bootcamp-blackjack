import React from "react";
import { observer } from "mobx-react-lite";
import { uiStore } from "../../store";
import { Balance } from "../Balance/Balance";
import { BetsForm } from "../BetsForm/BetsForm";
import { PlayerActions } from "../PlayerActions/PlayerActions";
import { Seat } from "../Seat/Seat";
import "./styles.css";
import { SeatPlace } from "../../types/types";

export const ControlPanel = observer(() => {
    return (
        <div>
            {uiStore.session && (
                <>
                    <Balance />
                    <BetsForm />
                    <PlayerActions />
                    <Seat
                        type={SeatPlace.Dealer}
                        member={uiStore.session.dealer}
                        points={uiStore.session.dealer.points}
                        cards={uiStore.session.dealer.cards}
                    />
                    <Seat
                        type={SeatPlace.MiddleRight}
                        member={uiStore.session.player}
                        points={uiStore.session.player.points}
                        cards={uiStore.session.player.cards}
                    />
                </>
            )}
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
