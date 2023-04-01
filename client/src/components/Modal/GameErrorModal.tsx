import React from "react";
import { Link } from "react-router-dom";

export const GameErrorModal = () => {
    return (
        <div>
            <span>Something went wrong</span>
            <span>Please, return to the Main Menu</span>
            <button><Link to="/">Main Menu</Link></button>
        </div>
    );
};
