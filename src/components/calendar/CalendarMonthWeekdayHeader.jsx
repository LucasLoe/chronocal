import { Box, Typography } from "@mui/material";
import { styled, useThemeProps } from "@mui/material/styles";

const CalendarMonthWeekdayHeaderRoot = styled(Box, {
	name: "CALENDAR_CalendarMonthWeekdayHeader",
	slot: "Root",
})(({ theme }) => ({
	position: "sticky",
	top: 0,
	zIndex: 5,
	paddingLeft: theme.spacing(1.25),
	paddingRight: theme.spacing(1.25),
	height: 40,
	borderRight: "1px solid",
	borderBottom: "1px solid",
	borderColor: theme.palette.divider,
	boxSizing: "border-box",
	display: "flex",
	alignItems: "center",
	backgroundColor: theme.palette.background.default,
}));

const CalendarMonthWeekdayHeaderLabel = styled(Typography, {
	name: "CALENDAR_CalendarMonthWeekdayHeader",
	slot: "Label",
	overridesResolver: (props, styles) => styles.label,
})(({ theme }) => ({
	fontWeight: 700,
	color: theme.palette.text.secondary,
}));

export function CalendarMonthWeekdayHeader(inProps) {
	const props = useThemeProps({
		props: inProps,
		name: "CALENDAR_CalendarMonthWeekdayHeader",
	});
	const { children, label, labelProps = {}, sx, ...rest } = props;
	const ownerState = rest.ownerState || {
		label,
		index: rest.index,
		view: rest.view,
	};

	delete rest.index;
	delete rest.view;
	delete rest.ownerState;

	return (
		<CalendarMonthWeekdayHeaderRoot ownerState={ownerState} sx={sx} {...rest}>
			{children || (
				<CalendarMonthWeekdayHeaderLabel
					variant='caption'
					ownerState={ownerState}
					{...labelProps}
				>
					{label}
				</CalendarMonthWeekdayHeaderLabel>
			)}
		</CalendarMonthWeekdayHeaderRoot>
	);
}
