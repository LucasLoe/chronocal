import dayjs from "../../../lib/dayjs";
import { getCalendarEntryEnd } from "./entries";

export const WORK_HOUR_PRESETS = {
	FULL_DAY: { id: "full-day", label: "Ganztag", startHour: 0, endHour: 24 },
	WORK_EXTENDED: { id: "6-22", label: "6-22 Uhr", startHour: 6, endHour: 22 },
};

export const WORK_HOUR_PRESET_OPTIONS = Object.values(WORK_HOUR_PRESETS);

export function getWeekdayLabels({ showWeekend, locale }) {
	const weekStart = dayjs("2026-05-18").startOf("isoWeek");
	const labels = Array.from({ length: 7 }, (_, index) => {
		const date = weekStart.add(index, "day");
		return (locale ? date.locale(locale) : date).format("dd");
	});
	return showWeekend ? labels : labels.slice(0, 5);
}

export function getMonthViewDates(anchorDate) {
	const monthStart = dayjs(anchorDate).startOf("month");
	const monthEnd = dayjs(anchorDate).endOf("month");
	const gridStart = monthStart.startOf("isoWeek");
	const gridEnd = monthEnd.endOf("isoWeek");
	const dayCount = gridEnd.diff(gridStart, "day") + 1;

	return Array.from({ length: dayCount }, (_, index) => gridStart.add(index, "day"));
}

export function getWeekViewDates(anchorDate, showWeekend) {
	const weekStart = dayjs(anchorDate).startOf("isoWeek");
	const days = showWeekend ? 7 : 5;

	return Array.from({ length: days }, (_, index) => weekStart.add(index, "day"));
}

export function isSameDay(a, b) {
	return dayjs(a).isSame(dayjs(b), "day");
}

export function sortEntriesByStart(entries) {
	return [...entries].sort(
		(left, right) => dayjs(left.start).valueOf() - dayjs(right.start).valueOf(),
	);
}

export function getEntriesForDate(entries, date) {
	return sortEntriesByStart(entries).filter((entry) =>
		dayjs(entry.start).isSame(dayjs(date), "day"),
	);
}

export function getEntriesForDateRange(entries, startDate, endDate) {
	const start = dayjs(startDate);
	const end = dayjs(endDate);
	return sortEntriesByStart(entries).filter((entry) => {
		const entryStart = dayjs(entry.start);
		const entryEnd = getCalendarEntryEnd(entry);
		return entryEnd.isAfter(start) && entryStart.isBefore(end);
	});
}
