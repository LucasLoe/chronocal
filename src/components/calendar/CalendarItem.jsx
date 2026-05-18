import { Box, Typography } from "@mui/material";

export function CalendarItem({ item, entry = item, sx, ...rest }) {
	const calendarItem = entry || item;
	delete rest.date;
	delete rest.view;
	delete rest.layout;
	delete rest.ownerState;

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-start",
				justifyContent: "flex-start",
				width: "100%",
				height: "100%",
				maxWidth: "100%",
				minWidth: 0,
				borderRadius: 1.25,
				px: 1,
				py: 0.5,
				overflow: "hidden",
				backgroundColor: calendarItem.color || "secondary.light",
				color: "secondary.contrastText",
				cursor: rest.onClick ? "pointer" : "default",
				transition: "box-shadow 140ms ease, transform 140ms ease",
				"&:hover": {
					boxShadow: 3,
					transform: "translateY(-1px)",
				},
				...sx,
			}}
			{...rest}
		>
			<Typography variant='caption' sx={{ fontWeight: 800, lineHeight: 1.15 }}>
				{calendarItem.start.format("HH:mm")}
			</Typography>
			<Typography
				variant='caption'
				sx={{
					width: "100%",
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
					lineHeight: 1.2,
				}}
			>
				{calendarItem.title}
			</Typography>
		</Box>
	);
}
