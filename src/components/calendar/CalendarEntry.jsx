import { Box } from "@mui/material";

export function CalendarEntry({ children, sx, ...rest }) {
	delete rest.date;
	delete rest.entries;
	delete rest.view;
	delete rest.ownerState;

	return (
		<Box
			sx={{ display: "flex", flexDirection: "column", width: "100%", minWidth: 0, ...sx }}
			{...rest}
		>
			{children}
		</Box>
	);
}
