import { Box, Typography } from "@mui/material";
import { styled, useThemeProps } from "@mui/material/styles";

const CalendarCellHeaderRoot = styled(Box, {
	name: "CALENDAR_CalendarCellHeader",
	slot: "Root",
})({
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
});

const CalendarCellHeaderWeekday = styled(Typography, {
	name: "CALENDAR_CalendarCellHeader",
	slot: "Weekday",
	overridesResolver: (props, styles) => styles.weekday,
})({
	fontWeight: 600,
});

const CalendarCellHeaderDay = styled(Box, {
	name: "CALENDAR_CalendarCellHeader",
	slot: "Day",
	overridesResolver: (props, styles) => styles.day,
})({
	borderRadius: "999px",
	paddingLeft: 8,
	paddingRight: 8,
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	fontSize: 12,
	fontWeight: 600,
});

export function CalendarCellHeader(inProps) {
	const { date, sx, ...rest } = useThemeProps({
		props: inProps,
		name: "CALENDAR_CalendarCellHeader",
	});
	const ownerState = rest.ownerState || {
		date,
		isToday: rest.isToday,
		isCurrentMonth: rest.isCurrentMonth,
		view: rest.view,
	};

	delete rest.isToday;
	delete rest.isCurrentMonth;
	delete rest.view;
	delete rest.ownerState;

	return (
		<CalendarCellHeaderRoot ownerState={ownerState} sx={sx} {...rest}>
			<CalendarCellHeaderWeekday ownerState={ownerState} variant='caption'>
				{date.format("dd")}
			</CalendarCellHeaderWeekday>
			<CalendarCellHeaderDay ownerState={ownerState}>
				{date.format("D")}
			</CalendarCellHeaderDay>
		</CalendarCellHeaderRoot>
	);
}
