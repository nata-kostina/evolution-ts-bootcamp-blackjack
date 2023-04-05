import React from "react";
import { observer } from "mobx-react-lite";
import { RequireConnection } from "../../hoc/RequireConnection";
import { ControlPanel } from "../../components/ControlPanel/ControlPanel";
import { useLaunchGame } from "../../store/useLaunchGame";

const SinglePlayerPage = observer(() => {
    useLaunchGame();
    return (
        <ControlPanel />
    );
});

export const SinglePlayerPageWithConnectionRequired =
  RequireConnection(SinglePlayerPage);
