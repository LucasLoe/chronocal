import { Box, Typography } from "@mui/material";
import { styled, useThemeProps } from "@mui/material/styles";
import { CALENDAR_VIEWS } from "./utils/views";

const CalendarRowHeaderRoot = styled(Box, {
	name: "CALENDAR_CalendarRowHeader",
	slot: "Root",
})(({ theme }) => ({
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
	height: "100%",
	display: "flex",
	alignItems: "flex-start",
	justifyContent: "flex-end",
	boxSizing: "border-box",
}));

const CalendarRowHeaderLabel = styled(Typography, {
	name: "CALENDAR_CalendarRowHeader",
	slot: "Label",
	overridesResolver: (props, styles) => styles.label,
})(({ theme }) => ({
	color: theme.palette.text.secondary,
}));

function getDefaultRowHeaderText(ownerState) {
	if (ownerState.view === CALENDAR_VIEWS.WEEK) {
		return ownerState.rowStart.format("HH:mm");
	}

	if (ownerState.view === CALENDAR_VIEWS.MONTH) {
		return `KW ${ownerState.rowStart.isoWeek()}`;
	}

	return null;
}

export function CalendarRowHeader(inProps) {
	const { ownerState, sx, ...rest } = useThemeProps({
		props: inProps,
		name: "CALENDAR_CalendarRowHeader",
	});
	const text = getDefaultRowHeaderText(ownerState);

	delete rest.view;
	delete rest.rowIndex;
	delete rest.rowStart;
	delete rest.rowEnd;
	delete rest.dates;

	return (
		<CalendarRowHeaderRoot ownerState={ownerState} sx={sx} {...rest}>
			{text && (
				<CalendarRowHeaderLabel variant='caption'>
					{text}
				</CalendarRowHeaderLabel>
			)}
		</CalendarRowHeaderRoot>
	);
}
