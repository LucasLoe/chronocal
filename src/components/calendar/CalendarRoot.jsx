import { Box } from "@mui/material";
import { CalendarContext } from "./calendarContext";
import { CalendarGrid } from "./CalendarGrid";
import { useCalendarState } from "./useCalendarState";
import { resolveCalendarSlots } from "./utils/slots";
import { CALENDAR_VIEWS } from "./utils/views";
import { WORK_HOUR_PRESETS } from "./utils/dateRange";

export function CalendarRoot({
	entries = [],
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
	onTimeSlotClick,
	onItemClick,
	onEntryTimeChange,
	onExternalItemDrop,
	defaultView = CALENDAR_VIEWS.MONTH,
	defaultDate,
	defaultShowWeekend = true,
	defaultWorkHourPreset = WORK_HOUR_PRESETS.WORK_EXTENDED.id,
	defaultTimeSlotMinutes,
	showRowHeaders,
	slots = {},
	slotProps = {},
	children,
	gridSx,
	sx,
	...rest
}) {
	const calendarState = useCalendarState({
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
		defaultView,
		defaultDate,
		defaultShowWeekend,
		defaultWorkHourPreset,
		defaultTimeSlotMinutes,
	});
	const resolvedSlots = resolveCalendarSlots(slots);
	const calendar = {
		...calendarState,
		slots: resolvedSlots,
		slotProps,
		onTimeSlotClick,
		onItemClick,
		onEntryTimeChange,
	};

	return (
		<CalendarContext.Provider value={calendar}>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					flex: 1,
					height: "100%",
					minHeight: 0,
					overflow: "hidden",
					...sx,
				}}
			>
				{children}
				<CalendarGrid
					view={calendarState.view}
					dates={calendarState.visibleDates}
					anchorDate={calendarState.date}
					entries={entries}
					showWeekend={calendarState.showWeekend}
					workHours={calendarState.workHours}
					timeSlotMinutes={calendarState.timeSlotMinutes}
					onTimeSlotClick={onTimeSlotClick}
					onItemClick={onItemClick}
					onEntryTimeChange={onEntryTimeChange}
					onExternalItemDrop={onExternalItemDrop}
					showRowHeaders={showRowHeaders}
					slots={resolvedSlots}
					slotProps={slotProps}
					sx={gridSx}
					{...rest}
				/>
			</Box>
		</CalendarContext.Provider>
	);
}
