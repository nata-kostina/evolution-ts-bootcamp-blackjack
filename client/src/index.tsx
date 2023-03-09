import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Modal from "react-modal";
import { MainPage } from "./pages/MainPage/MainPage";
import { SinglePlayerPageWithConnectionRequired } from "./pages/SinglePlayerPage/SinglePlayerPage";
import { MultiplePlayersPage } from "./pages/MultiplePlayersPage/MultiplePlayersPage";

Modal.setAppElement("#modal-window");

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainPage />,
    },
    {
        path: "single-player/:roomId",
        element: <SinglePlayerPageWithConnectionRequired />,
    },
    {
        path: "multiple-players/:roomId",
        element: <MultiplePlayersPage />,
    },
]);

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
);

root.render(
    <RouterProvider router={router} />,
);
