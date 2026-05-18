import { Box } from "@mui/material";

export function CalendarTimeSlotIndicator({ timeSlot, sx, ...rest }) {
	delete rest.date;
	delete rest.view;
	delete rest.ownerState;

	return (
		<Box
			aria-hidden='true'
			sx={{
				position: "absolute",
				top: timeSlot.top,
				left: 0,
				right: 0,
				height: timeSlot.height,
				pointerEvents: "none",
				zIndex: 1,
				backgroundColor: "primary.main",
				opacity: 0.12,
				borderTop: "1px solid",
				borderBottom: "1px solid",
				borderColor: "primary.main",
				boxSizing: "border-box",
				...sx,
			}}
			{...rest}
		/>
	);
}
