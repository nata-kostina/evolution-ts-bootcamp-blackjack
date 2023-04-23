import React from "react";
import { render } from "@testing-library/react";
import { PlayerActionsPanel } from "../PlayerActionsPanel";

jest.mock("../../../constants/ui.constants", () => ({
    actionButtons: [],
}));

describe("Player's actions panel tests", () => {
    it("should render PlayerActions component", () => {
        const { getByTestId } = render(<PlayerActionsPanel />);

        const actionsPanelElement = getByTestId("actionsPanel");
        expect(actionsPanelElement).toBeInTheDocument();
    });
});
