import React from "react";
import { render } from "@testing-library/react";
import { LoaderScreen } from "./LoaderScreen";

describe("Loader screen tests", () => {
    it("should render Loader Screen component", () => {
        const { getByRole, getByTestId } = render(<LoaderScreen />);

        const gameTitle = getByRole("heading", { level: 1 });
        expect(gameTitle.textContent).toMatch(/blackjack/i);

        const loaderContainerElement = getByTestId("loaderContainer");
        expect(loaderContainerElement).toBeInTheDocument();
    });
});
