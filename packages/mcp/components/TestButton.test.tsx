import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { TestButton } from "./TestButton.js";

describe("TestButton", () => {
	it("renders without crashing", () => {
		render(<TestButton />);
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("handles user interactions", () => {
		const handleClick = jest.fn();
		render(<TestButton onClick={handleClick} />);

		const element = screen.getByRole("button");
		fireEvent.click(element);

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("applies correct accessibility attributes", () => {
		render(<TestButton />);
		const element = screen.getByRole("button");

		expect(element).toHaveAttribute("aria-label");
		expect(element).toBeVisible();
	});

	it("supports keyboard navigation", () => {
		render(<TestButton />);
		const element = screen.getByRole("button");

		fireEvent.keyDown(element, { key: "Enter" });
		fireEvent.keyDown(element, { key: " " });

		expect(element).toHaveFocus();
	});
});
