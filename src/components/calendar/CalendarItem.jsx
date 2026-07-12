import { Box, Typography } from "@mui/material";
import { styled, useThemeProps } from "@mui/material/styles";
import { formatTime, useCalendarLocalization } from "./CalendarLocalizationContext";

const CalendarItemRoot = styled(Box, {
	name: "CALENDAR_CalendarItem",
	slot: "Root",
})(({ theme, ownerState }) => ({
	display: "flex",
	flexDirection: "column",
	alignItems: "flex-start",
	justifyContent: "flex-start",
	width: "100%",
	height: "100%",
	maxWidth: "100%",
	minWidth: 0,
	borderRadius: theme.shape.borderRadius * 1.25,
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
	paddingTop: theme.spacing(0.5),
	paddingBottom: theme.spacing(0.5),
	overflow: "hidden",
	backgroundColor: ownerState.calendarItem.color || theme.palette.secondary.light,
	color: theme.palette.secondary.contrastText,
	border: 0,
	font: "inherit",
	textAlign: "left",
	cursor: ownerState.clickable ? "pointer" : "default",
	transition: "box-shadow 140ms ease, transform 140ms ease",
	"&:hover": {
		boxShadow: theme.shadows[3],
		transform: "translateY(-1px)",
	},
}));

const CalendarItemTime = styled(Typography, {
	name: "CALENDAR_CalendarItem",
	slot: "Time",
	overridesResolver: (props, styles) => styles.time,
})({
	fontWeight: 800,
	lineHeight: 1.15,
});

const CalendarItemTitle = styled(Typography, {
	name: "CALENDAR_CalendarItem",
	slot: "Title",
	overridesResolver: (props, styles) => styles.title,
})({
	width: "100%",
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	lineHeight: 1.2,
});

export function CalendarItem(inProps) {
	const { item, entry = item, sx, ...rest } = useThemeProps({
		props: inProps,
		name: "CALENDAR_CalendarItem",
	});
	const { locale } = useCalendarLocalization();
	const calendarItem = entry || item;
	const ownerState = { ...rest.ownerState, calendarItem, clickable: Boolean(rest.onClick) };
	const slotOnKeyDown = rest.onKeyDown;

	delete rest.date;
	delete rest.view;
	delete rest.layout;
	delete rest.ownerState;
	delete rest.onKeyDown;

	const handleKeyDown = ownerState.clickable
		? (event) => {
				slotOnKeyDown?.(event);
				if (!event.defaultPrevented && event.key === "Enter") {
					event.preventDefault();
					rest.onClick(event);
				}
			}
		: slotOnKeyDown;

	return (
		<CalendarItemRoot
			role={ownerState.clickable ? "button" : undefined}
			tabIndex={ownerState.clickable ? 0 : undefined}
			onKeyDown={handleKeyDown}
			ownerState={ownerState}
			sx={sx}
			{...rest}
		>
			<CalendarItemTime variant='caption'>
				{formatTime(calendarItem.start, locale)}
			</CalendarItemTime>
			<CalendarItemTitle variant='caption'>
				{calendarItem.title}
			</CalendarItemTitle>
		</CalendarItemRoot>
	);
}
