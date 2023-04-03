/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { observer } from "mobx-react-lite";
import { Menu } from "../../components/Menu/Menu";
import { RequireConnection } from "../../hoc/RequireConnection";
import { GameCanvas } from "../../canvas/GameCanvas";

export const MainPage = observer(() => {
    return (
        <Menu />
        // <GameCanvas />
    );
});
export const MainPageWithConnectionRequired =
  RequireConnection(MainPage);
