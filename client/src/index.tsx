import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Modal from "react-modal";
import { SinglePlayerPageWithConnectionRequired } from "./pages/SinglePlayerPage/SinglePlayerPage";
import { ConnectionProvider } from "./context/ConnectionContext";

Modal.setAppElement("#modal-window");

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
);

root.render(
    <ConnectionProvider>
        <SinglePlayerPageWithConnectionRequired />,
    </ConnectionProvider>,
);
