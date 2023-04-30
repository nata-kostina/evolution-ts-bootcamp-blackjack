import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { PlayerActionButton } from "../PlayerActionButton";
import { ActionBtn } from "../../../types/ui.types";
import { Action } from "../../../types/game.types";

interface UiMock {
    UI: {
        getPlayerActionBtnState: (() => ({
            isDisabled: boolean;
            isVisible: boolean;
        }) | null);
    };
}
const mock: UiMock = {
    UI: {
        getPlayerActionBtnState: () => null,
    },
};

jest.mock("../../../context/GameContext", () => ({
    useGame: () => mock,
}));

const mockActionButton: ActionBtn = {
    type: "playerAction",
    action: Action.Bet,
    svgPath: "",
};

const MockHandleClick = jest.fn();
jest.mock("../../../hooks/useAction", () => ({
    useAction: () => ({
        handleClick: MockHandleClick,
    }),
}));

describe("Player's actions panel tests", () => {
    afterEach(() => jest.resetAllMocks());
    it("should render PlayerActions component", () => {
        mock.UI.getPlayerActionBtnState = () => ({
            isDisabled: true,
            isVisible: true,
        });
        const { getByRole, getByText, getByTestId } = render(<PlayerActionButton item={mockActionButton} />);

        const actionBtnElement = getByRole("button");
        expect(actionBtnElement).toBeInTheDocument();

        const actionIconElement = getByTestId("actionIcon");
        expect(actionIconElement).toBeInTheDocument();

        const actionBtnText = getByText(Action.Bet);
        expect(actionBtnText).toBeInTheDocument();
    });

    it("should not render invisible button", () => {
        mock.UI.getPlayerActionBtnState = () => ({
            isDisabled: true,
            isVisible: false,
        });
        const { queryByRole } = render(<PlayerActionButton item={mockActionButton} />);

        const actionBtnElement = queryByRole("button");
        expect(actionBtnElement).not.toBeInTheDocument();
    });

    it("should render enabled button", () => {
        mock.UI.getPlayerActionBtnState = () => ({
            isDisabled: false,
            isVisible: true,
        });
        const { getByRole } = render(<PlayerActionButton item={mockActionButton} />);

        const actionBtnElement = getByRole("button");
        expect(actionBtnElement).not.toBeDisabled();
    });

    it("should render disabled button", () => {
        mock.UI.getPlayerActionBtnState = () => ({
            isDisabled: true,
            isVisible: true,
        });
        const { getByRole } = render(<PlayerActionButton item={mockActionButton} />);

        const actionBtnElement = getByRole("button");
        expect(actionBtnElement).toBeDisabled();
    });

    it("should call handleClick after button has been clicked", () => {
        mock.UI.getPlayerActionBtnState = () => ({
            isDisabled: false,
            isVisible: true,
        });
        const { getByRole } = render(<PlayerActionButton item={mockActionButton} />);
        const actionBtnElement = getByRole("button");

        fireEvent.click(actionBtnElement);
        expect(MockHandleClick).toBeCalled();
        expect(MockHandleClick).toBeCalledTimes(1);
    });
});
