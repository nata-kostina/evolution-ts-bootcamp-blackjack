/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Link } from "react-router-dom";

interface Props {
    text: string;
    link: string;
}

export const MenuItem = ({ text, link }: Props) => {
    return (
        <li className="menu__item">
            <Link to={`${link}/dfg`}>{text}</Link>
        </li>
    );
};
