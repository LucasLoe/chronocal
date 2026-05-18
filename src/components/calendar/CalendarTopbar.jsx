import { Stack } from "@mui/material";

export function CalendarTopbar({ children, sx, ...rest }) {
	return (
		<Stack
			direction='row'
			spacing={1}
			sx={{ alignItems: "center", minWidth: "max-content", flexWrap: "nowrap", py: 1, ...sx }}
			{...rest}
		>
			{children}
		</Stack>
	);
}
