/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import "./styles.css";
import { MenuItem } from "./MenuItem";
import { menu } from "../../constants/navigationConstants";

export const Menu = () => {
    return (
        <ul className="menu">
            {menu.map((item) => (
                <MenuItem
                    key={item.id}
                    text={item.text}
                    link={item.link}
                />
            ))}
        </ul>
    );
};
