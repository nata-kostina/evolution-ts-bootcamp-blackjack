import React from "react";
import { observer } from "mobx-react-lite";
import { connection } from "../../store";

export const MultiplePlayersPage = observer(() => {
    const status = connection.status;
    return <div>{status.toString()}</div>;
});
