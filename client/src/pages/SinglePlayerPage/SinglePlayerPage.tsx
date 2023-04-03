import React from "react";
import { RequireConnection } from "../../hoc/RequireConnection";
import { ControlPanel } from "../../components/ControlPanel/ControlPanel";
import { useGame } from "../../store/useGame";

const SinglePlayerPage = () => {
    useGame();
    return (
        <ControlPanel />
    );
};

export const SinglePlayerPageWithConnectionRequired =
  RequireConnection(SinglePlayerPage);
