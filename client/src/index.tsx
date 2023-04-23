import React from "react";
import ReactDOM from "react-dom/client";
import "./normalize.css";
import "./index.css";
import Modal from "react-modal";
import { SinglePlayerPage } from "./pages/SinglePlayerPage";
import { ConnectionProvider } from "./context/ConnectionContext";
import { GameProvider } from "./context/GameContext";
import { init } from "./init";

Modal.setAppElement("#modal-window");

const { connection, game } = init();

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
);

root.render(
    <ConnectionProvider connection={connection}>
        <GameProvider game={game}>
            <SinglePlayerPage />
        </GameProvider>
    </ConnectionProvider>,
);
