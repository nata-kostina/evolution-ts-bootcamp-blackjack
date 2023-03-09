import React from "react";
import "./styles.css";
import { MenuItem } from "./MenuItem";
import { menu } from "../../constants/navigationConstants";

interface Props {
    socketID: string;
}

export const Menu = ({ socketID }: Props) => {
    return (
        <ul className="menu">
            {menu.map((item) => (
                <MenuItem
                    key={item.id}
                    text={item.text}
                    link={item.link}
                    socketID={socketID}
                />
            ))}
        </ul>
    );
};
