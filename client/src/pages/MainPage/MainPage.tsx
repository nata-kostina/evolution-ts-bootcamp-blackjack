import React from "react";
import { observer } from "mobx-react-lite";
import { Menu } from "../../components/Menu/Menu";
import { RequireConnection } from "../../hoc/RequireConnection";

export const MainPage = observer(() => {
    return (
        <Menu />
    );
});
export const MainPageWithConnectionRequired =
  RequireConnection(MainPage);
