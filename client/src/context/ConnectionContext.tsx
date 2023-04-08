import React, { createContext, useContext } from "react";
import { connection } from "../init";
import { Connection } from "../stores/Connection";
import { ContextProviderProps } from "../types/context.types";

const ConnectionContext = createContext<Connection>(connection);

export const ConnectionProvider: React.FC<ContextProviderProps> = ({
    children,
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
