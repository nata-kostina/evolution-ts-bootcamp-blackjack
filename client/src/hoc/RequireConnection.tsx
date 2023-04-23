/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { useConnection } from "../context/ConnectionContext";
import { Connection } from "../stores/Connection";
import { SocketStatus } from "../types/socket.types";

const ErrorMessage: React.FC = () => {
    return <p>Error!</p>;
};

export const RequireConnection = (Component: React.FC) => {
    const connection = useConnection() as Connection;
    if (connection.status === SocketStatus.WithError) {
        return ErrorMessage;
    }
    return (Component);

    // const ComponentWithRequireConnection: React.FC = observer(() => {
    //     return (
    //         <>
    //            <Component />}

    //             {/* {connection.status === "connected" && <Component />}
    //             {connection.status === "waiting" && "Waiting connection"}
    //             {connection.status === "error" && (
    //                 <div>
    //                     <Link to="/">Main Page</Link>
    //                     <span>Oooops the connection is broken</span>
    //                 </div>
    //             )} */}

    //         </>
    //     );
    // });

    // return ComponentWithRequireConnection;
};
