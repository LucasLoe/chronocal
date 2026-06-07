import { Box, Typography } from "@mui/material";
import { styled, useThemeProps } from "@mui/material/styles";

const CalendarWeekHeaderRoot = styled(Box, {
	name: "CALENDAR_CalendarWeekHeader",
	slot: "Root",
})(({ theme }) => ({
	position: "sticky",
	top: 0,
	zIndex: 5,
	paddingLeft: theme.spacing(1.25),
	paddingRight: theme.spacing(1.25),
	height: 42,
	borderRight: "1px solid",
	borderBottom: "1px solid",
	borderColor: theme.palette.divider,
	boxSizing: "border-box",
	display: "flex",
	alignItems: "center",
	backgroundColor: theme.palette.background.default,
}));

const CalendarWeekHeaderLabel = styled(Typography, {
	name: "CALENDAR_CalendarWeekHeader",
	slot: "Label",
	overridesResolver: (props, styles) => styles.label,
})(({ theme }) => ({
	fontWeight: 700,
	color: theme.palette.text.secondary,
}));

export function CalendarWeekHeader(inProps) {
	const props = useThemeProps({ props: inProps, name: "CALENDAR_CalendarWeekHeader" });
	const { children, date, label = date.format("dd D."), labelProps = {}, sx, ...rest } = props;
	const ownerState = rest.ownerState || {
		date,
		view: rest.view,
	};

	delete rest.view;
	delete rest.ownerState;

	return (
		<CalendarWeekHeaderRoot ownerState={ownerState} sx={sx} {...rest}>
			{children || (
				<CalendarWeekHeaderLabel
					variant='caption'
					ownerState={ownerState}
					{...labelProps}
				>
					{label}
				</CalendarWeekHeaderLabel>
			)}
		</CalendarWeekHeaderRoot>
	);
}
