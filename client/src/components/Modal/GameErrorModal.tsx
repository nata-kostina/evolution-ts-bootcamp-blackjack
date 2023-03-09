import React from "react";
import { Link } from "react-router-dom";
import { ModalProps } from "../../types/types";

export const GameErrorModal = ({ closeModal }: ModalProps) => {
    return (
        <div>
            <button><Link to="/">Main Menu</Link></button>
            <button onClick={closeModal}>Try again</button>
        </div>
    );
};
