import React from "react";
import { Link } from "react-router-dom";

interface Props {
    text: string;
    link: string;
    socketID: string;
}

export const MenuItem = ({ text, link, socketID }: Props) => {
    return (
        <li className="menu__item">
            <Link to={`${link}/${socketID}`}>{text}</Link>
        </li>
    );
};
