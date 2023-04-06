/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { observer } from "mobx-react-lite";
import { RequireConnection } from "../../hoc/RequireConnection";
import { useLaunchGame } from "../../store/useLaunchGame";
import { ControlPanel } from "../../components/ActionControlPanel/ControlPanel";
import { connection } from "../../init";

const SinglePlayerPage = observer(() => {
    const connectionID = connection.getConncetionID();
    useLaunchGame(connectionID);
    return (
        <ControlPanel />
    );
});

export const SinglePlayerPageWithConnectionRequired =
  RequireConnection(SinglePlayerPage);
