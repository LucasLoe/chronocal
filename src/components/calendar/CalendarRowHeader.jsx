import { Box, Typography } from "@mui/material";
import { CALENDAR_VIEWS } from "./utils/views";

function getDefaultRowHeaderText(ownerState) {
	if (ownerState.view === CALENDAR_VIEWS.WEEK) {
		return ownerState.rowStart.format("HH:mm");
	}

	if (ownerState.view === CALENDAR_VIEWS.MONTH) {
		return `KW ${ownerState.rowStart.isoWeek()}`;
	}

	return null;
}

export function CalendarRowHeader({ ownerState, sx, ...rest }) {
	const text = getDefaultRowHeaderText(ownerState);
	delete rest.view;
	delete rest.rowIndex;
	delete rest.rowStart;
	delete rest.rowEnd;
	delete rest.dates;

	return (
		<Box
			sx={{
				px: 1,
				height: "100%",
				display: "flex",
				alignItems: "flex-start",
				justifyContent: "flex-end",
				boxSizing: "border-box",
				...sx,
			}}
			{...rest}
		>
			{text && (
				<Typography variant='caption' sx={{ color: "text.secondary" }}>
					{text}
				</Typography>
			)}
		</Box>
	);
}
