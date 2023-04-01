import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Modal from "react-modal";
import { MainPageWithConnectionRequired } from "./pages/MainPage/MainPage";
import { SinglePlayerPageWithConnectionRequired } from "./pages/SinglePlayerPage/SinglePlayerPage";
import { MultiplePlayersPage } from "./pages/MultiplePlayersPage/MultiplePlayersPage";

Modal.setAppElement("#modal-window");

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainPageWithConnectionRequired />,
    },
    {
        path: "single-player",
        element: <SinglePlayerPageWithConnectionRequired />,
    },
    {
        path: "multiple-players",
        element: <MultiplePlayersPage />,
    },
]);

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
);

root.render(
    <RouterProvider router={router} />,
);
