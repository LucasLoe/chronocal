import { Box, Typography } from "@mui/material";

export function CalendarCellHeader({ date, sx, ...rest }) {
	delete rest.isToday;
	delete rest.isCurrentMonth;
	delete rest.view;
	delete rest.ownerState;

	return (
		<Box
			sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...sx }}
			{...rest}
		>
			<Typography variant='caption' sx={{ fontWeight: 600 }}>
				{date.format("dd")}
			</Typography>
			<Box
				sx={{
					borderRadius: "999px",
					px: 1,
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: 12,
					fontWeight: 600,
				}}
			>
				{date.format("D")}
			</Box>
		</Box>
	);
}
