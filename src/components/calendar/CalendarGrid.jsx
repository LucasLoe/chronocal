import { Box } from "@mui/material";
import { CalendarMonthView } from "./CalendarMonthView";
import { CalendarWeekView } from "./CalendarWeekView";
import { CALENDAR_VIEWS } from "./utils/views";

export function CalendarGrid({
	view,
	dates,
	anchorDate,
	entries,
	showWeekend,
	workHours,
	timeSlotMinutes,
	onTimeSlotClick,
	onItemClick,
	onEntryTimeChange,
	onExternalItemDrop,
	showRowHeaders,
	slots,
	slotProps = {},
	cellSx,
	sx,
	...rest
}) {
	return (
		<Box
			sx={{ overflow: "auto", flex: 1, minHeight: 0, height: 0, width: "100%", ...sx }}
			{...rest}
		>
			{view === CALENDAR_VIEWS.MONTH ? (
				<CalendarMonthView
					anchorDate={anchorDate}
					cellSx={cellSx}
					dates={dates}
					entries={entries}
					onItemClick={onItemClick}
					showRowHeaders={showRowHeaders}
					showWeekend={showWeekend}
					slots={slots}
					slotProps={slotProps}
					view={view}
				/>
			) : (
				<CalendarWeekView
					dates={dates}
					entries={entries}
					onEntryTimeChange={onEntryTimeChange}
					onExternalItemDrop={onExternalItemDrop}
					onItemClick={onItemClick}
					onTimeSlotClick={onTimeSlotClick}
					showRowHeaders={showRowHeaders}
					showWeekend={showWeekend}
					slots={slots}
					slotProps={slotProps}
					timeSlotMinutes={timeSlotMinutes}
					view={view}
					workHours={workHours}
				/>
			)}
		</Box>
	);
}
