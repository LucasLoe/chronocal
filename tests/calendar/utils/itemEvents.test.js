import { describe, expect, it, vi } from "vitest";
import { createCalendarItemClickHandler } from "../../../src/components/calendar/utils/itemEvents";

describe("item events", () => {
	it("stops propagation before running slot and root item click callbacks", () => {
		const item = { id: "a" };
		const event = { stopPropagation: vi.fn() };
		const slotOnClick = vi.fn();
		const onItemClick = vi.fn();

		createCalendarItemClickHandler({ item, slotOnClick, onItemClick })(event);

		expect(event.stopPropagation).toHaveBeenCalledOnce();
		expect(slotOnClick).toHaveBeenCalledWith(event);
		expect(onItemClick).toHaveBeenCalledWith(item);
	});
});
