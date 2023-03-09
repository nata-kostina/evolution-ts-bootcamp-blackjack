import React from "react";
import { observer } from "mobx-react-lite";
import { connection } from "../store";

export const RequireConnection = (Component: React.FC) => {
    const ComponentWithRequireConnection: React.FC = observer(() => {
        const status = connection.status;
        return (
            <div>
                {status === "connected" ? <Component /> : "Oooops the connection is broken"}
            </div>
        );
    });

    return ComponentWithRequireConnection;
};
