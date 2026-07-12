import { describe, expect, it } from "vitest";
import dayjs from "../../../src/lib/dayjs";
import { getCalendarEntryEnd, normalizeCalendarEntry } from "../../../src/components/calendar/utils/entries";

describe("calendar entry normalization", () => {
	it("normalizes string date fields to Day.js values", () => {
		const entry = normalizeCalendarEntry({
			id: "1",
			title: "Planning",
			start: "2026-05-18T09:00:00",
			end: "2026-05-18T10:30:00",
			category: "Meetings",
		});

		expect(dayjs.isDayjs(entry.start)).toBe(true);
		expect(dayjs.isDayjs(entry.end)).toBe(true);
		expect(entry.start.format("HH:mm")).toBe("09:00");
		expect(entry.end.format("HH:mm")).toBe("10:30");
		expect(entry.category).toBe("Meetings");
	});

	it("normalizes native Date values to Day.js values", () => {
		const entry = normalizeCalendarEntry({
			id: "1",
			title: "Planning",
			start: new Date(2026, 4, 18, 9, 0),
		});

		expect(dayjs.isDayjs(entry.start)).toBe(true);
		expect(entry.start.format("YYYY-MM-DD HH:mm")).toBe("2026-05-18 09:00");
	});

	it("defaults missing end values to one hour after start", () => {
		const entry = normalizeCalendarEntry({
			id: "1",
			title: "Planning",
			start: "2026-05-18T09:00:00",
		});

		expect(entry).not.toHaveProperty("end");
		expect(getCalendarEntryEnd(entry).format("HH:mm")).toBe("10:00");
	});

	it("allows an explicitly undefined end value", () => {
		const entry = normalizeCalendarEntry({
			id: "1",
			title: "Planning",
			start: "2026-05-18T09:00:00",
			end: undefined,
		});

		expect(entry.end).toBeUndefined();
		expect(getCalendarEntryEnd(entry).format("HH:mm")).toBe("10:00");
	});
});
