import dayjs from "../../../lib/dayjs";
import { getCalendarEntryEnd } from "./entries";
import { formatTime, formatTimeRange } from "../CalendarLocalizationContext";
import {
	getPointerYWithinElement,
	getWeekVisibleRange,
	WEEK_HOUR_HEIGHT,
} from "./weekGeometry";
import { getWeekTimeSlot } from "./timeSlots";
import { getWeekEntryRangeLayout } from "./weekLayout";

export function createWeekTimeSlotFromPointerEvent({
	date,
	event,
	workHours,
	timeSlotMinutes,
	hourHeight = WEEK_HOUR_HEIGHT,
}) {
	return getWeekTimeSlot({
		date,
		pointerY: getPointerYWithinElement(event),
		workHours,
		hourHeight,
		timeSlotMinutes,
	});
}

export function createHoveredWeekTimeSlot({ date, timeSlot }) {
	return {
		dateKey: date.format("YYYY-MM-DD"),
		date,
		timeSlot,
	};
}

export function isSameHoveredWeekTimeSlot(left, right) {
	return left?.dateKey === right?.dateKey && left?.timeSlot.index === right?.timeSlot.index;
}

export function createWeekTimeSlotClickPayload({ date, view, timeSlot }) {
	return {
		start: timeSlot.start,
		end: timeSlot.end,
		date,
		view,
		timeSlotMinutes: timeSlot.minutes,
	};
}

export function trapWeekEntryPointerEvent(event) {
	event.stopPropagation();
}

export const WEEK_ENTRY_TIME_ACTIONS = {
	MOVE: "move",
	RESIZE_START: "resize-start",
	RESIZE_END: "resize-end",
};

function clampRangeToVisibleHours({ start, end, visibleStart, visibleEnd }) {
	const durationMinutes = end.diff(start, "minute");

	if (start.isBefore(visibleStart)) {
		return { start: visibleStart, end: visibleStart.add(durationMinutes, "minute") };
	}

	if (end.isAfter(visibleEnd)) {
		return { start: visibleEnd.subtract(durationMinutes, "minute"), end: visibleEnd };
	}

	return { start, end };
}

export function createWeekEntryTimeInteraction({
	action,
	entry,
	date,
	pointerY,
	pointerStartX,
	pointerStartY,
	timeSlotMinutes,
}) {
	const start = dayjs(entry.start);
	const end = getCalendarEntryEnd(entry);
	const durationMinutes = Math.max(timeSlotMinutes, end.diff(start, "minute"));

	return {
		action,
		entry,
		id: entry.id,
		date,
		start,
		end,
		durationMinutes,
		pointerOffsetY: action === WEEK_ENTRY_TIME_ACTIONS.MOVE ? pointerY - (entry.layout?.top ?? 0) : 0,
		pointerStartX,
		pointerStartY,
		hasMoved: false,
		timeSlotMinutes,
	};
}

export function createWeekEntryTimeChange({
	interaction,
	date,
	pointerY,
	workHours,
	timeSlotMinutes,
	hourHeight = WEEK_HOUR_HEIGHT,
}) {
	const slot = getWeekTimeSlot({ date, pointerY, workHours, hourHeight, timeSlotMinutes });
	const { visibleStart, visibleEnd } = getWeekVisibleRange(date, workHours);
	const minimumMinutes = slot.minutes;
	let start = interaction.start;
	let end = interaction.end;

	if (interaction.action === WEEK_ENTRY_TIME_ACTIONS.MOVE) {
		const moveSlot = getWeekTimeSlot({
			date,
			pointerY: pointerY - interaction.pointerOffsetY,
			workHours,
			hourHeight,
			timeSlotMinutes,
		});

		start = moveSlot.start;
		end = start.add(interaction.durationMinutes, "minute");
		({ start, end } = clampRangeToVisibleHours({ start, end, visibleStart, visibleEnd }));
	}

	if (interaction.action === WEEK_ENTRY_TIME_ACTIONS.RESIZE_START) {
		start = slot.start;
		end = interaction.end;

		if (start.isBefore(visibleStart)) {
			start = visibleStart;
		}

		const latestStart = end.subtract(minimumMinutes, "minute");
		if (start.isAfter(latestStart)) {
			start = latestStart;
		}
	}

	if (interaction.action === WEEK_ENTRY_TIME_ACTIONS.RESIZE_END) {
		start = interaction.start;
		end = slot.end;

		const earliestEnd = start.add(minimumMinutes, "minute");
		if (end.isBefore(earliestEnd)) {
			end = earliestEnd;
		}

		if (end.isAfter(visibleEnd)) {
			end = visibleEnd;
		}
	}

	return {
		id: interaction.id,
		start,
		end,
		entry: interaction.entry,
		action: interaction.action,
	};
}

export function createWeekEntryTimePreview({
	change,
	date,
	locale,
	workHours,
	hourHeight = WEEK_HOUR_HEIGHT,
}) {
	return {
		...change,
		date,
		dateKey: date.format("YYYY-MM-DD"),
		layout: getWeekEntryRangeLayout({
			start: change.start,
			end: change.end,
			date,
			workHours,
			hourHeight,
		}),
		label: createWeekEntryTimePreviewLabel({ change, locale }),
	};
}

export function createWeekEntryTimePreviewLabel({ change, locale }) {
	if (change.action === WEEK_ENTRY_TIME_ACTIONS.RESIZE_START) {
		return formatTime(change.start, locale);
	}

	if (change.action === WEEK_ENTRY_TIME_ACTIONS.RESIZE_END) {
		return formatTime(change.end, locale);
	}

	return formatTimeRange(change.start, change.end, locale);
}
