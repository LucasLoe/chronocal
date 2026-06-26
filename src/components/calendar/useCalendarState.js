import { useMemo, useState } from "react";
import dayjs from "../../lib/dayjs";
import {
	CALENDAR_VIEWS,
	getCalendarViewRange,
	getNextAnchorDate,
	getVisibleDates,
} from "./utils/views";
import { WORK_HOUR_PRESETS } from "./utils/dateRange";
import { DEFAULT_TIME_SLOT_MINUTES, normalizeTimeSlotMinutes } from "./utils/timeSlots";
import { formatCalendarTitle } from "./CalendarLocalizationContext";

function getWorkHours(workHoursPreset) {
	return (
		Object.values(WORK_HOUR_PRESETS).find((preset) => preset.id === workHoursPreset) ||
		WORK_HOUR_PRESETS.WORK_EXTENDED
	);
}

export function useCalendarState({
	view: viewProp,
	date: dateProp,
	showWeekend: showWeekendProp,
	workHoursPreset: workHoursPresetProp,
	timeSlotMinutes: timeSlotMinutesProp,
	onViewChange,
	onDateChange,
	onShowWeekendChange,
	onWorkHoursPresetChange,
	onTimeSlotMinutesChange,
	locale,
	defaultView = CALENDAR_VIEWS.MONTH,
	defaultDate,
	defaultShowWeekend = true,
	defaultWorkHourPreset = WORK_HOUR_PRESETS.WORK_EXTENDED.id,
	defaultTimeSlotMinutes = DEFAULT_TIME_SLOT_MINUTES,
}) {
	const [internalView, setInternalView] = useState(defaultView);
	const [internalDate, setInternalDate] = useState(defaultDate ? dayjs(defaultDate) : dayjs());
	const [internalShowWeekend, setInternalShowWeekend] = useState(defaultShowWeekend);
	const [internalWorkHoursPreset, setInternalWorkHoursPreset] = useState(defaultWorkHourPreset);
	const [internalTimeSlotMinutes, setInternalTimeSlotMinutes] = useState(
		normalizeTimeSlotMinutes(defaultTimeSlotMinutes),
	);

	const view = viewProp ?? internalView;
	const anchorDate = dayjs(dateProp ?? internalDate);
	const showWeekend = showWeekendProp ?? internalShowWeekend;
	const workHoursPreset = workHoursPresetProp ?? internalWorkHoursPreset;
	const timeSlotMinutes = normalizeTimeSlotMinutes(timeSlotMinutesProp ?? internalTimeSlotMinutes);

	const setView = (next) => {
		if (viewProp === undefined) {
			setInternalView(next);
		}
		onViewChange?.(next);
	};

	const setDate = (next) => {
		const nextDate = dayjs(next);
		if (dateProp === undefined) {
			setInternalDate(nextDate);
		}
		onDateChange?.(nextDate);
	};

	const setShowWeekend = (next) => {
		const nextValue = Boolean(next);

		if (showWeekendProp === undefined) {
			setInternalShowWeekend(nextValue);
		}
		onShowWeekendChange?.(nextValue);
	};

	const setWorkHoursPreset = (next) => {
		if (workHoursPresetProp === undefined) {
			setInternalWorkHoursPreset(next);
		}
		onWorkHoursPresetChange?.(next);
	};

	const setTimeSlotMinutes = (next) => {
		const nextValue = normalizeTimeSlotMinutes(next);

		if (timeSlotMinutesProp === undefined) {
			setInternalTimeSlotMinutes(nextValue);
		}
		onTimeSlotMinutesChange?.(nextValue);
	};

	const workHours = useMemo(() => getWorkHours(workHoursPreset), [workHoursPreset]);
	const visibleDates = useMemo(
		() => getVisibleDates({ view, anchorDate, showWeekend }),
		[view, anchorDate, showWeekend],
	);
	const range = useMemo(
		() => getCalendarViewRange({ view, anchorDate }),
		[view, anchorDate],
	);
	const title = formatCalendarTitle({ view, date: anchorDate, locale });

	return {
		view,
		date: anchorDate,
		title,
		showWeekend,
		workHoursPreset,
		workHours,
		timeSlotMinutes,
		visibleDates,
		range,
		locale,
		setView,
		setDate,
		setShowWeekend,
		setWorkHoursPreset,
		setTimeSlotMinutes,
		navigate: (direction) => setDate(getNextAnchorDate({ view, anchorDate, direction })),
		today: () => setDate(dayjs()),
	};
}
