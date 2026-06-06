import { describe, expect, it } from "vitest";
import dayjs from "../../../src/lib/dayjs";
import {
	createWeekEntryTimeChange,
	createWeekEntryTimeInteraction,
	createWeekEntryTimePreview,
	createHoveredWeekTimeSlot,
	createWeekTimeSlotClickPayload,
	isSameHoveredWeekTimeSlot,
	WEEK_ENTRY_TIME_ACTIONS,
} from "../../../src/components/calendar/utils/weekInteractions";

const workHours = { startHour: 6, endHour: 22 };
const date = dayjs("2026-05-18");

function createInteraction(action) {
	return createWeekEntryTimeInteraction({
		action,
		entry: {
			id: "a",
			title: "A",
			start: dayjs("2026-05-18T10:00:00"),
			end: dayjs("2026-05-18T11:00:00"),
			layout: { top: 208 },
		},
		date,
		pointerY: 218,
		pointerStartX: 10,
		pointerStartY: 260,
		timeSlotMinutes: 30,
	});
}

describe("week interactions", () => {
	it("creates the documented time slot click payload", () => {
		const date = dayjs("2026-05-18");
		const timeSlot = {
			start: dayjs("2026-05-18T10:15:00"),
			end: dayjs("2026-05-18T10:30:00"),
			minutes: 15,
		};

		expect(createWeekTimeSlotClickPayload({ date, view: "week", timeSlot })).toEqual({
			start: timeSlot.start,
			end: timeSlot.end,
			date,
			view: "week",
			timeSlotMinutes: 15,
		});
	});

	it("compares hovered time slots by date and slot index", () => {
		const hovered = createHoveredWeekTimeSlot({ date, timeSlot: { index: 3 } });

		expect(isSameHoveredWeekTimeSlot(hovered, hovered)).toBe(true);
		expect(
			isSameHoveredWeekTimeSlot(hovered, createHoveredWeekTimeSlot({ date, timeSlot: { index: 4 } })),
		).toBe(false);
		expect(
			isSameHoveredWeekTimeSlot(
				hovered,
				createHoveredWeekTimeSlot({ date: dayjs("2026-05-19"), timeSlot: { index: 3 } }),
			),
		).toBe(false);
	});

	it("creates move entry time changes while preserving duration", () => {
		const change = createWeekEntryTimeChange({
			interaction: createInteraction(WEEK_ENTRY_TIME_ACTIONS.MOVE),
			date: dayjs("2026-05-19"),
			pointerY: 322,
			workHours,
			timeSlotMinutes: 30,
		});

		expect(change).toEqual(expect.objectContaining({ id: "a", action: "move" }));
		expect(change.start.format("YYYY-MM-DDTHH:mm")).toBe("2026-05-19T12:00");
		expect(change.end.format("YYYY-MM-DDTHH:mm")).toBe("2026-05-19T13:00");

		const preview = createWeekEntryTimePreview({ change, date: dayjs("2026-05-19"), workHours });

		expect(preview.dateKey).toBe("2026-05-19");
		expect(preview.label).toBe("12:00-13:00");
		expect(preview.layout).toEqual(expect.objectContaining({ top: 312, height: 52 }));
	});

	it("creates top and bottom resize entry time changes", () => {
		const topResize = createWeekEntryTimeChange({
			interaction: createInteraction(WEEK_ENTRY_TIME_ACTIONS.RESIZE_START),
			date,
			pointerY: 182,
			workHours,
			timeSlotMinutes: 30,
		});
		const bottomResize = createWeekEntryTimeChange({
			interaction: createInteraction(WEEK_ENTRY_TIME_ACTIONS.RESIZE_END),
			date,
			pointerY: 313,
			workHours,
			timeSlotMinutes: 30,
		});

		expect(topResize.start.format("HH:mm")).toBe("09:30");
		expect(topResize.end.format("HH:mm")).toBe("11:00");
		expect(topResize.action).toBe("resize-start");
		expect(bottomResize.start.format("HH:mm")).toBe("10:00");
		expect(bottomResize.end.format("HH:mm")).toBe("12:30");
		expect(bottomResize.action).toBe("resize-end");
	});

	it("keeps resized ranges valid and clamped to visible hours", () => {
		const latestStartResize = createWeekEntryTimeChange({
			interaction: createInteraction(WEEK_ENTRY_TIME_ACTIONS.RESIZE_START),
			date,
			pointerY: 420,
			workHours,
			timeSlotMinutes: 30,
		});
		const earliestEndResize = createWeekEntryTimeChange({
			interaction: createInteraction(WEEK_ENTRY_TIME_ACTIONS.RESIZE_END),
			date,
			pointerY: 100,
			workHours,
			timeSlotMinutes: 30,
		});
		const visibleEndResize = createWeekEntryTimeChange({
			interaction: createInteraction(WEEK_ENTRY_TIME_ACTIONS.RESIZE_END),
			date,
			pointerY: 1200,
			workHours,
			timeSlotMinutes: 30,
		});

		expect(latestStartResize.start.format("HH:mm")).toBe("10:30");
		expect(latestStartResize.end.format("HH:mm")).toBe("11:00");
		expect(earliestEndResize.start.format("HH:mm")).toBe("10:00");
		expect(earliestEndResize.end.format("HH:mm")).toBe("10:30");
		expect(visibleEndResize.end.format("HH:mm")).toBe("22:00");
	});

	it("clamps moved entries that would exceed visible hours", () => {
		const change = createWeekEntryTimeChange({
			interaction: createInteraction(WEEK_ENTRY_TIME_ACTIONS.MOVE),
			date,
			pointerY: 1200,
			workHours,
			timeSlotMinutes: 30,
		});

		expect(change.start.format("HH:mm")).toBe("21:00");
		expect(change.end.format("HH:mm")).toBe("22:00");
	});
});
