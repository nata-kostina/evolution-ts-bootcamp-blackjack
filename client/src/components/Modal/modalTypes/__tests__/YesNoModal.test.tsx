import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import Modal from "react-modal";
import { YesNoNotificationModal } from "../YesNoModal";

const mockProps = {
    text: "mock text",
    handleAnswer: jest.fn(),
    onClose: jest.fn(),
    isOpen: true,
};

const modalContainer = document.createElement("div");
modalContainer.id = "modal-window";
document.body.appendChild(modalContainer);
Modal.setAppElement("#modal-window");

describe("Yes&No Modal tests", () => {
    it("should render Yes&No Modal component", () => {
        const { getByRole, getByText } = render(<YesNoNotificationModal
            handleAnswer={mockProps.handleAnswer}
            isOpen={mockProps.isOpen}
            onClose={mockProps.onClose}
            text={mockProps.text}
        />);

        const modalText = getByText(mockProps.text);
        expect(modalText).toBeInTheDocument();

        const yesBtn = getByRole("button", { name: /yes/i });
        expect(yesBtn).toBeInTheDocument();

        const noBtn = getByRole("button", { name: /no/i });
        expect(noBtn).toBeInTheDocument();
    });

    it("should not render Yes&No Modal component if isOpen is false", () => {
        const { queryByTestId } = render(<YesNoNotificationModal
            handleAnswer={mockProps.handleAnswer}
            isOpen={false}
            onClose={mockProps.onClose}
            text={mockProps.text}
        />);

        const modal = queryByTestId("modal");
        expect(modal).not.toBeInTheDocument();
    });

    it("should call handleClick after Yes button is clicked", () => {
        const { getByRole } = render(<YesNoNotificationModal
            handleAnswer={mockProps.handleAnswer}
            isOpen={mockProps.isOpen}
            onClose={mockProps.onClose}
            text={mockProps.text}
        />);

        const yesBtn = getByRole("button", { name: /yes/i });
        fireEvent.click(yesBtn);
        expect(mockProps.handleAnswer).toBeCalled();
    });

    it("should call handleClick after No button is clicked", () => {
        const { getByRole } = render(<YesNoNotificationModal
            handleAnswer={mockProps.handleAnswer}
            isOpen={mockProps.isOpen}
            onClose={mockProps.onClose}
            text={mockProps.text}
        />);

        const noBtn = getByRole("button", { name: /no/i });
        fireEvent.click(noBtn);
        expect(mockProps.handleAnswer).toBeCalled();
    });

    it("should call handleClick after Yes button is clicked", async () => {
        const mockHandleYesClick = jest.fn().mockImplementation(
            () => {
                mockProps.isOpen = false;
            },
        );
        mockProps.onClose = mockHandleYesClick;
        const { getByRole, queryByTestId } = render(<YesNoNotificationModal
            handleAnswer={mockProps.handleAnswer}
            isOpen={mockProps.isOpen}
            onClose={mockProps.onClose}
            text={mockProps.text}
        />);

        const yesBtn = getByRole("button", { name: /yes/i });
        fireEvent.click(yesBtn);
        expect(mockProps.handleAnswer).toBeCalled();

        await waitFor(() => {
            const modal = queryByTestId("modal");
            expect(modal).not.toBeInTheDocument();
        });
    });
});
