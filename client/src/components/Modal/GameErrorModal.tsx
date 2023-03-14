import React from "react";
import { Link } from "react-router-dom";
import { ErrorModalProps } from "../../types/types";

export const GameErrorModal = ({ closeModal }: Omit<ErrorModalProps, "type">) => {
    return (
        <div>
            <button><Link to="/">Main Menu</Link></button>
            <button onClick={closeModal}>Try again</button>
        </div>
    );
};
