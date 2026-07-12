import dayjs from "../../../lib/dayjs";

function failCalendarValidation(message) {
	const fullMessage = `[Chronocal] ${message}`;
	console.error(fullMessage);
	throw new Error(fullMessage);
}

export function getValidCalendarDate(value, name) {
	if (value == null) {
		failCalendarValidation(
			`Invalid ${name}. Expected a valid Day.js value, Date, or ISO date string.`,
		);
	}

	const date = dayjs(value);

	if (!date.isValid()) {
		failCalendarValidation(
			`Invalid ${name}. Expected a valid Day.js value, Date, or ISO date string.`,
		);
	}

	return date;
}

export function getValidCalendarOption(value, name, options) {
	if (!options.includes(value)) {
		failCalendarValidation(
			`Invalid ${name} "${String(value)}". Expected one of: ${options.join(", ")}.`,
		);
	}

	return value;
}

export function normalizeAndValidateCalendarEntry(entry, index) {
	const name = `entries[${index}]`;

	if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
		failCalendarValidation(`${name} must be an entry object.`);
	}
	if (typeof entry.id !== "string" || entry.id.trim() === "") {
		failCalendarValidation(`${name}.id must be a non-empty string.`);
	}
	if (typeof entry.title !== "string" || entry.title.trim() === "") {
		failCalendarValidation(`${name}.title must be a non-empty string.`);
	}

	const start = getValidCalendarDate(entry.start, `${name}.start`);
	const end =
		entry.end === undefined ? undefined : getValidCalendarDate(entry.end, `${name}.end`);

	if (end && !end.isAfter(start)) {
		failCalendarValidation(`${name}.end must be after ${name}.start.`);
	}

	return end === undefined ? { ...entry, start } : { ...entry, start, end };
}

export function normalizeAndValidateCalendarEntries(entries) {
	if (!Array.isArray(entries)) {
		failCalendarValidation("entries must be an array.");
	}

	const ids = new Set();
	return entries.map((entry, index) => {
		const normalizedEntry = normalizeAndValidateCalendarEntry(entry, index);

		if (ids.has(normalizedEntry.id)) {
			failCalendarValidation(`entries contains duplicate id "${normalizedEntry.id}".`);
		}
		ids.add(normalizedEntry.id);

		return normalizedEntry;
	});
}
