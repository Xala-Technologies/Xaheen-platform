import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ContactForm } from "./ContactForm.js";

describe("ContactForm", () => {
	it("renders without crashing", () => {
		render(<ContactForm />);
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("handles user interactions", () => {
		const handleClick = jest.fn();
		render(<ContactForm onClick={handleClick} />);

		const element = screen.getByRole("button");
		fireEvent.click(element);

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("applies correct accessibility attributes", () => {
		render(<ContactForm />);
		const element = screen.getByRole("button");

		expect(element).toHaveAttribute("aria-label");
		expect(element).toBeVisible();
	});

	it("supports keyboard navigation", () => {
		render(<ContactForm />);
		const element = screen.getByRole("button");

		fireEvent.keyDown(element, { key: "Enter" });
		fireEvent.keyDown(element, { key: " " });

		expect(element).toHaveFocus();
	});
});
