import dayjs from "../../../lib/dayjs";
import { getWeekColumnHeight, getWeekTotalMinutes, WEEK_HOUR_HEIGHT } from "./weekGeometry";

export const TIME_SLOT_MINUTE_OPTIONS = [5, 15, 30, 60];
export const DEFAULT_TIME_SLOT_MINUTES = 15;

export function normalizeTimeSlotMinutes(value) {
	const minutes = Number(value);

	if (TIME_SLOT_MINUTE_OPTIONS.includes(minutes)) {
		return minutes;
	}

	if (!Number.isFinite(minutes)) {
		return DEFAULT_TIME_SLOT_MINUTES;
	}

	return TIME_SLOT_MINUTE_OPTIONS.reduce((nearest, option) =>
		Math.abs(option - minutes) < Math.abs(nearest - minutes) ? option : nearest,
	);
}

export function getWeekTimeSlot({
	date,
	pointerY,
	workHours,
	hourHeight = WEEK_HOUR_HEIGHT,
	timeSlotMinutes,
}) {
	const minutes = normalizeTimeSlotMinutes(timeSlotMinutes);
	const totalMinutes = getWeekTotalMinutes(workHours);
	const slotCount = totalMinutes / minutes;
	const slotHeight = (minutes / 60) * hourHeight;
	const totalHeight = getWeekColumnHeight(workHours, hourHeight);
	const y = Math.min(Math.max(pointerY, 0), Math.max(totalHeight - 1, 0));
	const index = Math.min(Math.floor(y / slotHeight), slotCount - 1);
	const startOffsetMinutes = index * minutes;
	const start = dayjs(date)
		.hour(workHours.startHour)
		.minute(0)
		.second(0)
		.millisecond(0)
		.add(startOffsetMinutes, "minute");

	return {
		start,
		end: start.add(minutes, "minute"),
		index,
		top: index * slotHeight,
		height: slotHeight,
		minutes,
	};
}

export function getWeekTimeSlotByIndex({
	date,
	index,
	workHours,
	hourHeight = WEEK_HOUR_HEIGHT,
	timeSlotMinutes,
}) {
	const minutes = normalizeTimeSlotMinutes(timeSlotMinutes);
	const slotCount = getWeekTotalMinutes(workHours) / minutes;
	const normalizedIndex = Math.min(Math.max(index, 0), slotCount - 1);

	return getWeekTimeSlot({
		date,
		pointerY: normalizedIndex * (minutes / 60) * hourHeight,
		workHours,
		hourHeight,
		timeSlotMinutes: minutes,
	});
}
