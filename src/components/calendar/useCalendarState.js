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
import { getValidCalendarDate, getValidCalendarOption } from "./utils/validation";

const CALENDAR_VIEW_OPTIONS = Object.values(CALENDAR_VIEWS);
const WORK_HOUR_PRESET_IDS = Object.values(WORK_HOUR_PRESETS).map((preset) => preset.id);

function getWorkHours(workHoursPreset) {
	return Object.values(WORK_HOUR_PRESETS).find((preset) => preset.id === workHoursPreset);
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
	const [internalView, setInternalView] = useState(() =>
		getValidCalendarOption(defaultView, "defaultView", CALENDAR_VIEW_OPTIONS),
	);
	const [internalDate, setInternalDate] = useState(() =>
		getValidCalendarDate(defaultDate ?? dayjs(), "defaultDate"),
	);
	const [internalShowWeekend, setInternalShowWeekend] = useState(defaultShowWeekend);
	const [internalWorkHoursPreset, setInternalWorkHoursPreset] = useState(() =>
		getValidCalendarOption(
			defaultWorkHourPreset,
			"defaultWorkHourPreset",
			WORK_HOUR_PRESET_IDS,
		),
	);
	const [internalTimeSlotMinutes, setInternalTimeSlotMinutes] = useState(
		normalizeTimeSlotMinutes(defaultTimeSlotMinutes),
	);

	const view = getValidCalendarOption(viewProp ?? internalView, "view", CALENDAR_VIEW_OPTIONS);
	const anchorDate = getValidCalendarDate(dateProp ?? internalDate, "date");
	const showWeekend = showWeekendProp ?? internalShowWeekend;
	const workHoursPreset = getValidCalendarOption(
		workHoursPresetProp ?? internalWorkHoursPreset,
		"workHoursPreset",
		WORK_HOUR_PRESET_IDS,
	);
	const timeSlotMinutes = normalizeTimeSlotMinutes(timeSlotMinutesProp ?? internalTimeSlotMinutes);

	const setView = (next) => {
		const nextView = getValidCalendarOption(next, "view passed to setView", CALENDAR_VIEW_OPTIONS);
		if (viewProp === undefined) {
			setInternalView(nextView);
		}
		onViewChange?.(nextView);
	};

	const setDate = (next) => {
		const nextDate = getValidCalendarDate(next, "date passed to setDate");
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
		const nextPreset = getValidCalendarOption(
			next,
			"preset passed to setWorkHoursPreset",
			WORK_HOUR_PRESET_IDS,
		);
		if (workHoursPresetProp === undefined) {
			setInternalWorkHoursPreset(nextPreset);
		}
		onWorkHoursPresetChange?.(nextPreset);
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
