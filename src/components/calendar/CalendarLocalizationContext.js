import { createContext, useContext } from "react";
import dayjs from "../../lib/dayjs";
import { CALENDAR_VIEWS } from "./utils/views";

export const CalendarLocalizationContext = createContext({ locale: undefined });

function withLocale(date, locale) {
	const value = dayjs(date);
	return locale ? value.locale(locale) : value;
}

export function useCalendarLocalization() {
	return useContext(CalendarLocalizationContext);
}

export function formatCalendarTitle({ view, date, locale }) {
	if (view === CALENDAR_VIEWS.WEEK) {
		const start = withLocale(date, locale).startOf("isoWeek");
		const end = start.add(6, "day");

		if (start.month() === end.month()) {
			return `${start.format("D.")}-${end.format("D. MMMM YYYY")}`;
		}

		return `${start.format("D. MMM")} - ${end.format("D. MMM YYYY")}`;
	}

	return withLocale(date, locale).format("MMMM YYYY");
}

export function formatCellWeekday(date, locale) {
	return withLocale(date, locale).format("dd");
}

export function formatDayOfMonth(date, locale) {
	return withLocale(date, locale).format("D");
}

export function formatWeekHeader(date, locale) {
	return withLocale(date, locale).format("dd D.");
}

export function formatTime(date, locale) {
	return withLocale(date, locale).format("HH:mm");
}

export function formatTimeRange(start, end, locale) {
	return `${formatTime(start, locale)}-${formatTime(end, locale)}`;
}

export function formatRowHeader(ownerState, locale) {
	if (ownerState.view === CALENDAR_VIEWS.WEEK) {
		return formatTime(ownerState.rowStart, locale);
	}

	if (ownerState.view === CALENDAR_VIEWS.MONTH) {
		return `W ${ownerState.rowStart.isoWeek()}`;
	}

	return null;
}
