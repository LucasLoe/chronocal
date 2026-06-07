import { Box } from "@mui/material";
import { styled, useThemeProps } from "@mui/material/styles";
import { CalendarContext } from "./calendarContext";
import { CalendarCell } from "./CalendarCell";
import { CalendarCellHeader } from "./CalendarCellHeader";
import { CalendarEntry } from "./CalendarEntry";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarItem } from "./CalendarItem";
import { CalendarMonthWeekdayHeader } from "./CalendarMonthWeekdayHeader";
import { CalendarRowHeader } from "./CalendarRowHeader";
import { CalendarTimeSlotIndicator } from "./CalendarTimeSlotIndicator";
import { CalendarWeekHeader } from "./CalendarWeekHeader";
import { useCalendarState } from "./useCalendarState";
import { CALENDAR_VIEWS } from "./utils/views";
import { WORK_HOUR_PRESETS } from "./utils/dateRange";

const CalendarRootRoot = styled(Box, {
	name: "CALENDAR_CalendarRoot",
	slot: "Root",
})({
	display: "flex",
	flexDirection: "column",
	flex: 1,
	height: "100%",
	minHeight: 0,
	overflow: "hidden",
});

export function CalendarRoot(inProps) {
	const props = useThemeProps({ props: inProps, name: "CALENDAR_CalendarRoot" });
	const {
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
	} = props;
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
	const resolvedSlots = {
		cell: CalendarCell,
		cellHeader: CalendarCellHeader,
		entry: CalendarEntry,
		item: CalendarItem,
		monthWeekdayHeader: CalendarMonthWeekdayHeader,
		rowHeader: CalendarRowHeader,
		timeSlotIndicator: CalendarTimeSlotIndicator,
		weekHeader: CalendarWeekHeader,
		...slots,
	};
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
			<CalendarRootRoot sx={sx}>
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
			</CalendarRootRoot>
		</CalendarContext.Provider>
	);
}
