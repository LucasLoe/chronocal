import dayjs from "../../../lib/dayjs";

export const WEEK_HOUR_HEIGHT = 52;
export const WEEK_HEADER_HEIGHT = 42;
export const ROW_HEADER_GUTTER_WIDTH = 58;

function getPositiveNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

export function resolveWeekLayout(weekLayout = {}) {
	const hourMinHeight = getPositiveNumber(weekLayout.hourMinHeight, WEEK_HOUR_HEIGHT);
	const hourHeight = getPositiveNumber(weekLayout.hourHeight, undefined);

	return { hourHeight, hourMinHeight };
}

export function getResponsiveWeekHourHeight({ viewportHeight, workHours, weekLayout }) {
	const { hourHeight, hourMinHeight } = resolveWeekLayout(weekLayout);
	if (hourHeight !== undefined) {
		return hourHeight;
	}

	const visibleHourCount = workHours.endHour - workHours.startHour;
	const availableBodyHeight = Number(viewportHeight) - WEEK_HEADER_HEIGHT;
	const fillingHourHeight = availableBodyHeight / visibleHourCount;

	return Number.isFinite(fillingHourHeight)
		? Math.max(hourMinHeight, fillingHourHeight)
		: hourMinHeight;
}

export function getWeekTotalMinutes(workHours) {
	return (workHours.endHour - workHours.startHour) * 60;
}

export function getWeekColumnHeight(workHours, hourHeight = WEEK_HOUR_HEIGHT) {
	return getWeekTotalMinutes(workHours) * (hourHeight / 60);
}

export function getWeekPxPerMinute(hourHeight = WEEK_HOUR_HEIGHT) {
	return hourHeight / 60;
}

export function getWeekVisibleRange(date, workHours) {
	const visibleStart = dayjs(date).hour(workHours.startHour).minute(0).second(0).millisecond(0);
	const visibleEnd = dayjs(date).hour(workHours.endHour).minute(0).second(0).millisecond(0);

	return { visibleStart, visibleEnd };
}

export function getPointerYWithinElement(event) {
	const rect = event.currentTarget.getBoundingClientRect();
	return event.clientY - rect.top;
}

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

export function getWeekDateAtPoint({ point, gridElement, dates }) {
	const rect = gridElement.getBoundingClientRect();
	const columnWidth = rect.width / dates.length;
	const columnIndex = clamp(Math.floor((point.clientX - rect.left) / columnWidth), 0, dates.length - 1);

	return dates[columnIndex];
}

export function getWeekBodyPointerY({ event, gridElement }) {
	return getWeekBodyPointerYFromPoint({ point: event, gridElement });
}

export function getWeekBodyPointerYFromPoint({ point, gridElement }) {
	const rect = gridElement.getBoundingClientRect();
	return point.clientY - rect.top - WEEK_HEADER_HEIGHT;
}
