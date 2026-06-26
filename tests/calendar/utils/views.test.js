import { describe, expect, it } from "vitest";
import "dayjs/locale/de";
import dayjs from "../../../src/lib/dayjs";
import { formatCalendarTitle } from "../../../src/components/calendar/CalendarLocalizationContext";
import {
	CALENDAR_VIEWS,
	getCalendarViewRange,
	getNextAnchorDate,
	getVisibleDates,
} from "../../../src/components/calendar/utils/views";

describe("calendar view behaviour", () => {
	it("returns only weeks that intersect the month view", () => {
		const dates = getVisibleDates({
			view: CALENDAR_VIEWS.MONTH,
			anchorDate: dayjs("2026-05-18"),
			showWeekend: true,
		});

		expect(dates).toHaveLength(35);
		expect(dates[0].format("YYYY-MM-DD")).toBe("2026-04-27");
		expect(dates.at(-1).format("YYYY-MM-DD")).toBe("2026-05-31");
	});

	it("keeps six month rows when the month intersects six weeks", () => {
		const dates = getVisibleDates({
			view: CALENDAR_VIEWS.MONTH,
			anchorDate: dayjs("2026-08-18"),
			showWeekend: true,
		});

		expect(dates).toHaveLength(42);
		expect(dates[0].format("YYYY-MM-DD")).toBe("2026-07-27");
		expect(dates.at(-1).format("YYYY-MM-DD")).toBe("2026-09-06");
	});

	it("allows four month rows for months that exactly fit four ISO weeks", () => {
		const dates = getVisibleDates({
			view: CALENDAR_VIEWS.MONTH,
			anchorDate: dayjs("2021-02-18"),
			showWeekend: true,
		});

		expect(dates).toHaveLength(28);
		expect(dates[0].format("YYYY-MM-DD")).toBe("2021-02-01");
		expect(dates.at(-1).format("YYYY-MM-DD")).toBe("2021-02-28");
	});

	it("returns five or seven dates for week view", () => {
		const weekdays = getVisibleDates({
			view: CALENDAR_VIEWS.WEEK,
			anchorDate: dayjs("2026-05-20"),
			showWeekend: false,
		});
		const fullWeek = getVisibleDates({
			view: CALENDAR_VIEWS.WEEK,
			anchorDate: dayjs("2026-05-20"),
			showWeekend: true,
		});

		expect(weekdays).toHaveLength(5);
		expect(fullWeek).toHaveLength(7);
		expect(weekdays[0].format("YYYY-MM-DD")).toBe("2026-05-18");
	});

	it("moves by the active view interval", () => {
		const anchorDate = dayjs("2026-05-18");

		expect(
			getNextAnchorDate({ view: CALENDAR_VIEWS.MONTH, anchorDate, direction: 1 }).format(
				"YYYY-MM-DD",
			),
		).toBe("2026-06-18");
		expect(
			getNextAnchorDate({ view: CALENDAR_VIEWS.WEEK, anchorDate, direction: 1 }).format(
				"YYYY-MM-DD",
			),
		).toBe("2026-05-25");
	});

	it("returns the active view data range", () => {
		const monthRange = getCalendarViewRange({
			view: CALENDAR_VIEWS.MONTH,
			anchorDate: dayjs("2026-05-18"),
		});
		const weekRange = getCalendarViewRange({
			view: CALENDAR_VIEWS.WEEK,
			anchorDate: dayjs("2026-05-20"),
		});

		expect(monthRange.start.format("YYYY-MM-DDTHH:mm:ss")).toBe("2026-05-01T00:00:00");
		expect(monthRange.end.format("YYYY-MM-DDTHH:mm:ss")).toBe("2026-05-31T23:59:59");
		expect(weekRange.start.format("YYYY-MM-DDTHH:mm:ss")).toBe("2026-05-18T00:00:00");
		expect(weekRange.end.format("YYYY-MM-DDTHH:mm:ss")).toBe("2026-05-24T23:59:59");
	});

	it("formats month and week titles", () => {
		expect(
			formatCalendarTitle({ view: CALENDAR_VIEWS.MONTH, date: dayjs("2026-05-18"), locale: "de" }),
		).toBe("Mai 2026");
		expect(
			formatCalendarTitle({ view: CALENDAR_VIEWS.WEEK, date: dayjs("2026-05-18"), locale: "de" }),
		).toBe("18.-24. Mai 2026");
	});
});
