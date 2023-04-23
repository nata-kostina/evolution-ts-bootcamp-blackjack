import React from "react";
import { render } from "@testing-library/react";
import { ControlPanel } from "./ControlPanel";

jest.mock("../BalancePanel/BalancePanel", () => ({
    BalancePanel: () => {
        return <div data-testid="balancePanel" />;
    },
}));

jest.mock("../PlayerActionsPanel/PlayerActionsPanel", () => ({
    PlayerActionsPanel: () => {
        return <div data-testid="playerActionsPanel" />;
    },
}));

describe("Control panel tests", () => {
    it("should render ControlPanel component", () => {
        const { getByTestId } = render(<ControlPanel />);

        const controlPanelElement = getByTestId("controlPanel");
        expect(controlPanelElement).toBeInTheDocument();

        const balancePanelElement = getByTestId("balancePanel");
        expect(balancePanelElement).toBeInTheDocument();

        const playerActionsPanelElement = getByTestId("playerActionsPanel");
        expect(playerActionsPanelElement).toBeInTheDocument();
    });
});
