/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { useConnection } from "../context/ConnectionContext";

export const RequireConnection = (Component: React.FC) => {
    // const connection = useConnection();
    // const status
    const ComponentWithRequireConnection: React.FC = observer(() => {
        return (
            <>
                {/* <h1>{connection.status}</h1> */}
                <Component />
                {/* {connection.status === "connected" && <Component />}
                {connection.status === "waiting" && "Waiting connection"}
                {connection.status === "error" && (
                    <div>
                        <Link to="/">Main Page</Link>
                        <span>Oooops the connection is broken</span>
                    </div>
                )} */}

            </>
        );
    });

    return ComponentWithRequireConnection;
};
