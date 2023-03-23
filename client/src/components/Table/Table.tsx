import React from "react";
import { SeatPlace } from "../../types/types";
import { DealerSeat } from "../Seat/DealerSeat";
import { Seat } from "../Seat/Seat";

const seatArray: SeatPlace[] = ["right", "middle-right", "middle-left", "left"];

export const Table = () => {
    return (
        <div>
            <div>
                <h2>Dealer</h2>
                <DealerSeat />
            </div>
            <div style={{ display: "flex" }}>
                <h2>Players:</h2>
                {seatArray.map((seat) => {
                    return <Seat key={seat} seatType={seat} />;
                })}
            </div>
        </div>
    );
};
