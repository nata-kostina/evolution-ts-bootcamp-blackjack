/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import ReactDOM from "react-dom/client";
import "./normalize.css";
import "./index.css";
import Modal from "react-modal";
import { SinglePlayerPageWithConnectionRequired } from "./pages/SinglePlayerPage/SinglePlayerPage";
import { ConnectionProvider } from "./context/ConnectionContext";
import { GameProvider } from "./context/GameContext";
import { ControlPanel } from "./components/ActionControlPanel/ControlPanel";

Modal.setAppElement("#modal-window");

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
);

root.render(
    <ConnectionProvider>
        <GameProvider>
            <SinglePlayerPageWithConnectionRequired />,
        </GameProvider>
    </ConnectionProvider>,
);
