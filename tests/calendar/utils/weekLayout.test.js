import { describe, expect, it } from "vitest";
import dayjs from "../../../src/lib/dayjs";
import { normalizeCalendarEntries } from "../../../src/components/calendar/utils/entries";
import { getWeekEntryLayouts } from "../../../src/components/calendar/utils/weekLayout";

const workHours = { startHour: 9, endHour: 17 };
const date = dayjs("2026-05-18T00:00:00");

function layoutEntries(entries) {
	return getWeekEntryLayouts({
		entries: normalizeCalendarEntries(entries),
		date,
		workHours,
		hourHeight: 60,
	});
}

describe("week entry layout", () => {
	it("places overlapping entries in separate lanes", () => {
		const entries = layoutEntries([
			{ id: "a", title: "A", start: "2026-05-18T10:00:00", end: "2026-05-18T11:00:00" },
			{ id: "b", title: "B", start: "2026-05-18T10:30:00", end: "2026-05-18T11:30:00" },
		]);

		expect(entries).toHaveLength(2);
		expect(entries.map((entry) => entry.layout.laneIndex)).toEqual([0, 1]);
		expect(entries.map((entry) => entry.layout.laneCount)).toEqual([2, 2]);
	});

	it("reuses lanes for non-overlapping entries", () => {
		const entries = layoutEntries([
			{ id: "a", title: "A", start: "2026-05-18T10:00:00", end: "2026-05-18T11:00:00" },
			{ id: "b", title: "B", start: "2026-05-18T11:00:00", end: "2026-05-18T12:00:00" },
		]);

		expect(entries.map((entry) => entry.layout.laneIndex)).toEqual([0, 0]);
		expect(entries.map((entry) => entry.layout.laneCount)).toEqual([1, 1]);
	});

	it("clips entries to visible work hours", () => {
		const [entry] = layoutEntries([
			{ id: "a", title: "A", start: "2026-05-18T08:30:00", end: "2026-05-18T09:30:00" },
		]);

		expect(entry.startMin).toBe(0);
		expect(entry.endMin).toBe(30);
		expect(entry.layout.top).toBe(0);
		expect(entry.layout.height).toBe(30);
	});

	it("excludes entries outside visible work hours", () => {
		const entries = layoutEntries([
			{ id: "a", title: "A", start: "2026-05-18T07:00:00", end: "2026-05-18T08:00:00" },
			{ id: "b", title: "B", start: "2026-05-18T17:00:00", end: "2026-05-18T18:00:00" },
		]);

		expect(entries).toEqual([]);
	});

	it("uses one hour for missing end values", () => {
		const [entry] = layoutEntries([
			{ id: "a", title: "A", start: "2026-05-18T10:00:00" },
		]);

		expect(entry.startMin).toBe(60);
		expect(entry.endMin).toBe(120);
		expect(entry.layout.height).toBe(60);
	});
});
