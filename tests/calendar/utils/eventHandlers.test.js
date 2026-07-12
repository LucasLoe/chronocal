import { describe, expect, it, vi } from "vitest";
import { composeCalendarEventHandlers } from "../../../src/components/calendar/utils/eventHandlers";

describe("calendar event handler composition", () => {
	it("runs package behavior before consumer behavior", () => {
		const calls = [];
		const packageHandler = vi.fn(() => calls.push("package"));
		const consumerHandler = vi.fn(() => calls.push("consumer"));
		const event = {};

		composeCalendarEventHandlers(packageHandler, consumerHandler)(event);

		expect(calls).toEqual(["package", "consumer"]);
		expect(packageHandler).toHaveBeenCalledWith(event);
		expect(consumerHandler).toHaveBeenCalledWith(event);
	});

	it("returns either handler when only one exists", () => {
		const handler = vi.fn();

		expect(composeCalendarEventHandlers(handler, undefined)).toBe(handler);
		expect(composeCalendarEventHandlers(undefined, handler)).toBe(handler);
	});
});
