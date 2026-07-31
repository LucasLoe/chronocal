import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "dayjs/locale/de";
import { describe, expect, it } from "vitest";
import App from "../../src/App";
import dayjs from "../../src/lib/dayjs";

function createRect({ left = 0, top = 0, width = 0, height = 0 }) {
	return {
		x: left,
		y: top,
		left,
		top,
		right: left + width,
		bottom: top + height,
		width,
		height,
		toJSON: () => {},
	};
}

function setupWeekGeometry(container) {
	const grid = container.querySelector('[data-calendar-week-grid="true"]');
	grid.getBoundingClientRect = () => createRect({ width: 500, height: 874 });

	for (const [index, column] of Array.from(
		container.querySelectorAll("[data-calendar-week-column]"),
	).entries()) {
		column.getBoundingClientRect = () =>
			createRect({ left: index * 100, top: 42, width: 100, height: 832 });
	}
}

function dragPointer(element, { from, to }) {
	fireEvent.pointerDown(element, {
		button: 0,
		clientX: from.x,
		clientY: from.y,
		pointerId: 1,
	});
	fireEvent.pointerMove(document, {
		button: 0,
		clientX: from.x + 4,
		clientY: from.y + 4,
		pointerId: 1,
	});
	fireEvent.pointerMove(document, {
		button: 0,
		clientX: to.x,
		clientY: to.y,
		pointerId: 1,
	});
	fireEvent.pointerUp(document, {
		button: 0,
		clientX: to.x,
		clientY: to.y,
		pointerId: 1,
	});
}

describe("demo application", () => {
	it("creates a worklog from an empty dragged time range", async () => {
		const { container } = render(<App />);
		setupWeekGeometry(container);
		const mondayKey = dayjs().startOf("isoWeek").format("YYYY-MM-DD");
		const monday = container.querySelector(`[data-calendar-week-column="${mondayKey}"]`);

		dragPointer(monday, {
			from: { x: 50, y: 94 },
			to: { x: 50, y: 133 },
		});

		expect(screen.getByRole("dialog", { name: "Create worklog" })).toBeInTheDocument();
		expect(screen.getByText("07:00 - 08:00")).toBeInTheDocument();
		expect(screen.getByLabelText("Ticket")).toHaveTextContent("Research spike");

		fireEvent.click(screen.getByRole("button", { name: "Create worklog" }));

		await waitFor(() =>
			expect(
				container.querySelector('[data-calendar-week-entry="dropped-1"]'),
			).toBeInTheDocument(),
		);
		await waitFor(() =>
			expect(screen.queryByRole("dialog", { name: "Create worklog" })).not.toBeInTheDocument(),
		);
	});
});
