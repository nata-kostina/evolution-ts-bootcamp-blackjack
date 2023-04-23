import React from "react";
import { render } from "@testing-library/react";
import { SinglePlayerPage } from "./SinglePlayerPage";

jest.mock("../components/Canvas/GameCanvas", () => ({
    GameCanvas: () => {
        return <div data-testid="canvas" />;
    },
}));

jest.mock("../components/ControlPanel/ControlPanel", () => ({
    ControlPanel: () => {
        return <div data-testid="controlPanel" />;
    },
}));

interface NotificationModalProps {
    isOpen: boolean;
    closeModal: () => void;
}
jest.mock("../components/Modal/NotificationModal", () => ({
    NotificationModal: ({ isOpen, closeModal }: NotificationModalProps) => {
        return (
            <>
                {isOpen && (
                    <div data-testid="notificationModal">
                        <button onClick={closeModal}>Close</button>
                    </div>
                )}
            </>
        );
    },
}));

jest.mock("../hooks/useModal", () => ({
    useModal: () => ({
        isOpen: false,
        closeModal: () => jest.fn(),
        notification: null,
    }),
}));

describe("Single Player Page tests", () => {
    it("should render Single Player Page component", () => {
        const { getByTestId } = render(<SinglePlayerPage />);

        const canvasComponent = getByTestId("canvas");
        expect(canvasComponent).toBeInTheDocument();

        const controlPanel = getByTestId("controlPanel");
        expect(controlPanel).toBeInTheDocument();
    });
});
