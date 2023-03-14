import React from "react";
import { Link } from "react-router-dom";
import { ErrorModalProps } from "../../types/types";

export const PlayerErrorModal = ({ closeModal }: Omit<ErrorModalProps, "type">) => {
    return (
        <div>
            <span>Ooops, the player is null</span>
            <button><Link to="/">Main Menu</Link></button>
            <button onClick={closeModal}>Try again</button>
        </div>
    );
};
