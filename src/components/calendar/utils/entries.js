import dayjs from "../../../lib/dayjs";

const DEFAULT_ENTRY_DURATION_MINUTES = 60;

export function normalizeCalendarEntry(entry) {
	return {
		...entry,
		start: dayjs(entry.start),
		end: entry.end == null ? undefined : dayjs(entry.end),
	};
}

export function normalizeCalendarEntries(entries = []) {
	return entries.map((entry) => normalizeCalendarEntry(entry));
}

export function getCalendarEntryEnd(entry) {
	return entry.end == null
		? dayjs(entry.start).add(DEFAULT_ENTRY_DURATION_MINUTES, "minute")
		: dayjs(entry.end);
}
