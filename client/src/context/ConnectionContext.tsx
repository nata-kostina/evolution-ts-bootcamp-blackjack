import React, { createContext, ReactNode, useContext } from "react";
import { Connection } from "../stores/connection.store";

interface ConnectionContextProviderProps {
    children: ReactNode;
    connection: Connection;
}

const ConnectionContext = createContext<Connection | null>(null);

export const ConnectionProvider: React.FC<ConnectionContextProviderProps> = ({
    children,
    connection,
}) => {
    return (
        <ConnectionContext.Provider value={connection}>
            {children}
        </ConnectionContext.Provider>
    );
};

export const useConnection = () => {
    return useContext(ConnectionContext);
};
