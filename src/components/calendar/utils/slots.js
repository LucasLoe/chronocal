import { CalendarCellHeader } from "../CalendarCellHeader";
import { CalendarEntry } from "../CalendarEntry";
import { CalendarItem } from "../CalendarItem";
import { CalendarRowHeader } from "../CalendarRowHeader";
import { CalendarTimeSlotIndicator } from "../CalendarTimeSlotIndicator";

export function resolveCalendarSlots(slots = {}) {
	return {
		cellHeader: CalendarCellHeader,
		entry: CalendarEntry,
		item: CalendarItem,
		rowHeader: CalendarRowHeader,
		timeSlotIndicator: CalendarTimeSlotIndicator,
		...slots,
	};
}

export function getSlotProps(slotProps = {}, slotName) {
	return slotProps[slotName] || {};
}

export function splitSlotSx(slotProps = {}) {
	const { sx, ...rest } = slotProps;
	return { sx, rest };
}

export function createMonthCellOwnerState({ date, entries, view, isToday, isCurrentMonth }) {
	return { date, entries, view, isToday, isCurrentMonth };
}

export function createMonthItemOwnerState({ cellOwnerState, entry }) {
	return { ...cellOwnerState, item: entry, entry };
}

export function createWeekEntryOwnerState({ date, entries, view }) {
	return { date, entries, view };
}

export function createWeekItemOwnerState({ date, entry, view, layout }) {
	return { date, item: entry, entry, view, layout };
}

export function createWeekTimeSlotOwnerState({ date, view, timeSlot }) {
	return { date, view, timeSlot };
}

export function createRowHeaderOwnerState({ view, rowIndex, rowStart, rowEnd, dates }) {
	return { view, rowIndex, rowStart, rowEnd, dates };
}
