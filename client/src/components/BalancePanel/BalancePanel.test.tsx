import React from "react";
import { render } from "@testing-library/react";
import { BalancePanel } from "./BalancePanel";

interface UiMock {
    UI: {
        player: null | {
            balance: number;
            bet: number;
            insurance: number;
        };
    };
}
const mock: UiMock = {
    UI: {
        player: {
            balance: 1000,
            bet: 0,
            insurance: 0,
        },
    },
};

jest.mock("../../context/GameContext", () => ({
    useGame: () => mock,
}));

describe("Balance panel tests", () => {
    afterEach(() => jest.resetAllMocks());

    it("should render BalancePanel component", () => {
        const { getByText } = render(<BalancePanel />);

        const balanceText = getByText(/balance:/i);
        expect(balanceText).toBeInTheDocument();

        const betText = getByText(/bet amount:/i);
        expect(betText).toBeInTheDocument();

        const insuranceText = getByText(/insurance/i);
        expect(insuranceText).toBeInTheDocument();
    });

    it("should render values from the store", () => {
        const { getByTestId } = render(<BalancePanel />);

        const balanceText = getByTestId("balance-value");
        expect(balanceText.textContent).toBe("1000$");

        const betText = getByTestId("bet-value");
        expect(betText.textContent).toBe("0$");

        const insuranceText = getByTestId("insurance-value");
        expect(insuranceText.textContent).toBe("0$");
    });

    it("should not render values if player is null", () => {
        mock.UI.player = null;

        const { queryByTestId } = render(<BalancePanel />);

        const balanceText = queryByTestId("balance-value");
        expect(balanceText).not.toBeInTheDocument();

        const betText = queryByTestId("bet-value");
        expect(betText).not.toBeInTheDocument();

        const insuranceText = queryByTestId("insurance-value");
        expect(insuranceText).not.toBeInTheDocument();
    });
});
