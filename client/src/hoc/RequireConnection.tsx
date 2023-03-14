import React from "react";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { connection } from "../store";

export const RequireConnection = (Component: React.FC) => {
    const ComponentWithRequireConnection: React.FC = observer(() => {
        return (
            <div>
                {connection.status === "connected" ? (
                    <Component />
                ) : (
                    <div>
                        <Link to="/">Main Page</Link>
                        <span>Oooops the connection is broken</span>
                    </div>
                )}
            </div>
        );
    });

    return ComponentWithRequireConnection;
};
