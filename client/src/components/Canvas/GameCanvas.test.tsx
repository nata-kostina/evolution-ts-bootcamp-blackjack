import React from "react";
import { render } from "@testing-library/react";
import { GameCanvas } from "./GameCanvas";

jest.mock("../LoaderScreen/LoaderScreen", () => ({
    LoaderScreen: () => {
        return <div data-testid="loaderScreen" />;
    },
}));

jest.mock("../../context/GameContext", () => ({
    useGame: () => ({
        scene: null,
    }),
}));
jest.mock("../../context/ConnectionContext", () => ({
    useConnection: () => ({
        sendRequest: jest.fn(),
        isInitialized: false,
    }),
}));

jest.mock("../../canvas/CanvasBase", () => ({
    CanvasBase: class CanvasBase {
        public getGameMatrix() {
            return jest.fn();
        }
    },
}));
jest.mock("../../canvas/canvasElements/SceneManager", () => ({
    SceneManager: class SceneManager {
        public getGameMatrix() {
            return jest.fn();
        }

        public addContent() {
            return jest.fn();
        }
    },
}));
jest.mock("../../canvas/utils/assetsManager", () => ({
    AssetsLoader: class AssetsLoader {
        public async preload() {
            return new Promise<void>(resolve => { resolve(); });
        }
    },
}));

describe("Game Canvas tests", () => {
    jest.useFakeTimers();
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should render Game Canvas component", () => {
        const { getByTestId } = render(<GameCanvas />);

        const canvasElement = getByTestId("canvas");
        expect(canvasElement).toBeInTheDocument();
    });
});
