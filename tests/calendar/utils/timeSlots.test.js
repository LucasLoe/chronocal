import { describe, expect, it } from "vitest";
import dayjs from "../../../src/lib/dayjs";
import {
	DEFAULT_TIME_SLOT_MINUTES,
	getWeekTimeSlot,
	normalizeTimeSlotMinutes,
} from "../../../src/components/calendar/utils/timeSlots";

describe("time slots", () => {
	it("normalizes unsupported time slot minute values", () => {
		expect(normalizeTimeSlotMinutes(5)).toBe(5);
		expect(normalizeTimeSlotMinutes("30")).toBe(30);
		expect(normalizeTimeSlotMinutes(14)).toBe(15);
		expect(normalizeTimeSlotMinutes(undefined)).toBe(DEFAULT_TIME_SLOT_MINUTES);
	});

	it("computes a snapped week time slot from pointer position", () => {
		const slot = getWeekTimeSlot({
			date: dayjs("2026-05-18"),
			pointerY: 78,
			workHours: { startHour: 9, endHour: 17 },
			hourHeight: 60,
			timeSlotMinutes: 15,
		});

		expect(slot.start.format("YYYY-MM-DDTHH:mm")).toBe("2026-05-18T10:15");
		expect(slot.end.format("YYYY-MM-DDTHH:mm")).toBe("2026-05-18T10:30");
		expect(slot.index).toBe(5);
		expect(slot.top).toBe(75);
		expect(slot.height).toBe(15);
	});

	it("clamps pointer positions to the visible work-hour range", () => {
		const beforeStart = getWeekTimeSlot({
			date: dayjs("2026-05-18"),
			pointerY: -20,
			workHours: { startHour: 9, endHour: 10 },
			hourHeight: 60,
			timeSlotMinutes: 30,
		});
		const afterEnd = getWeekTimeSlot({
			date: dayjs("2026-05-18"),
			pointerY: 200,
			workHours: { startHour: 9, endHour: 10 },
			hourHeight: 60,
			timeSlotMinutes: 30,
		});

		expect(beforeStart.start.format("HH:mm")).toBe("09:00");
		expect(afterEnd.start.format("HH:mm")).toBe("09:30");
	});
});
