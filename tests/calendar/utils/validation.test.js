import { afterEach, describe, expect, it, vi } from "vitest";
import {
	getValidCalendarDate,
	getValidCalendarOption,
	normalizeAndValidateCalendarEntries,
} from "../../../src/components/calendar/utils/validation";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("calendar option validation", () => {
	it("returns supported values", () => {
		expect(getValidCalendarOption("week", "view", ["month", "week"])).toBe("week");
	});

	it("logs and throws for unsupported values", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => getValidCalendarOption("agenda", "view", ["month", "week"])).toThrow(
			'[Chronocal] Invalid view "agenda". Expected one of: month, week.',
		);
		expect(error).toHaveBeenCalledWith(
			'[Chronocal] Invalid view "agenda". Expected one of: month, week.',
		);
	});
});

describe("calendar date validation", () => {
	it("rejects missing required dates instead of treating them as now", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => getValidCalendarDate(undefined, "anchorDate")).toThrow(
			"[Chronocal] Invalid anchorDate.",
		);
		expect(() => getValidCalendarDate(null, "anchorDate")).toThrow(
			"[Chronocal] Invalid anchorDate.",
		);
	});
});

describe("calendar entry validation", () => {
	it("rejects entries without a start", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() =>
			normalizeAndValidateCalendarEntries([{ id: "1", title: "Planning" }]),
		).toThrow("[Chronocal] Invalid entries[0].start.");
	});

	it("rejects duplicate ids and invalid ranges", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const entry = { id: "1", title: "Planning", start: "2026-05-18T09:00:00" };

		expect(() => normalizeAndValidateCalendarEntries([entry, entry])).toThrow(
			'[Chronocal] entries contains duplicate id "1".',
		);
		expect(() =>
			normalizeAndValidateCalendarEntries([
				{ ...entry, end: "2026-05-18T08:00:00" },
			]),
		).toThrow("[Chronocal] entries[0].end must be after entries[0].start.");
		expect(() => normalizeAndValidateCalendarEntries([{ ...entry, end: null }])).toThrow(
			"[Chronocal] Invalid entries[0].end.",
		);
	});
});
