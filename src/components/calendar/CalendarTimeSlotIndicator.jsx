import { Box } from "@mui/material";
import { styled, useThemeProps } from "@mui/material/styles";

const CalendarTimeSlotIndicatorRoot = styled(Box, {
	name: "CALENDAR_CalendarTimeSlotIndicator",
	slot: "Root",
})(({ theme, ownerState }) => ({
	position: "absolute",
	top: ownerState.timeSlot.top,
	left: 0,
	right: 0,
	height: ownerState.timeSlot.height,
	pointerEvents: "none",
	zIndex: 1,
	backgroundColor: theme.palette.primary.main,
	opacity: 0.12,
	borderTop: "1px solid",
	borderBottom: "1px solid",
	borderColor: theme.palette.primary.main,
	boxSizing: "border-box",
}));

export function CalendarTimeSlotIndicator(inProps) {
	const { timeSlot, sx, ...rest } = useThemeProps({
		props: inProps,
		name: "CALENDAR_CalendarTimeSlotIndicator",
	});
	const ownerState = { ...rest.ownerState, timeSlot };

	delete rest.date;
	delete rest.view;
	delete rest.ownerState;

	return (
		<CalendarTimeSlotIndicatorRoot
			aria-hidden='true'
			ownerState={ownerState}
			sx={sx}
			{...rest}
		/>
	);
}
