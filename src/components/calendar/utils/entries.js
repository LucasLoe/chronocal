import dayjs from "../../../lib/dayjs";
import {
	normalizeAndValidateCalendarEntries,
	normalizeAndValidateCalendarEntry,
} from "./validation";

const DEFAULT_ENTRY_DURATION_MINUTES = 60;

export function normalizeCalendarEntry(entry) {
	return normalizeAndValidateCalendarEntry(entry, 0);
}

export function normalizeCalendarEntries(entries = []) {
	return normalizeAndValidateCalendarEntries(entries);
}

export function getCalendarEntryEnd(entry) {
	return entry.end == null
		? dayjs(entry.start).add(DEFAULT_ENTRY_DURATION_MINUTES, "minute")
		: dayjs(entry.end);
}
