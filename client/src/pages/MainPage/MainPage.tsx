import React from "react";
import { observer } from "mobx-react-lite";
import { Menu } from "../../components/Menu/Menu";
import { connection } from "../../store";

export const MainPage = observer(() => {
    return (
        <div>
            {connection.status === "connected" ?
                <Menu socketID="sdf" /> : (
                    <>
                        <button onClick={() => {
                            window.location.reload();
                        }}
                        >Reload Page
                        </button>
                        <span>Status: {connection.status}</span>
                    </>
                )}
        </div>
    );
});
