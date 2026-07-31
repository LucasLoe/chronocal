import { Box } from "@mui/material";
import { styled, useThemeProps } from "@mui/material/styles";

const CalendarTimeRangePreviewRoot = styled(Box, {
	name: "CALENDAR_CalendarTimeRangePreview",
	slot: "Root",
})({
	position: "absolute",
	inset: 0,
	pointerEvents: "none",
});

const CalendarTimeRangePreviewLabel = styled(Box, {
	name: "CALENDAR_CalendarTimeRangePreview",
	slot: "Label",
})(({ theme }) => ({
	position: "absolute",
	top: -24,
	left: 4,
	paddingLeft: theme.spacing(0.75),
	paddingRight: theme.spacing(0.75),
	paddingTop: theme.spacing(0.25),
	paddingBottom: theme.spacing(0.25),
	borderRadius: theme.shape.borderRadius,
	fontSize: 11,
	fontWeight: 800,
	lineHeight: 1.4,
	color: theme.palette.primary.contrastText,
	backgroundColor: theme.palette.primary.main,
	boxShadow: theme.shadows[2],
	whiteSpace: "nowrap",
}));

export function CalendarTimeRangePreview(inProps) {
	const props = useThemeProps({
		props: inProps,
		name: "CALENDAR_CalendarTimeRangePreview",
	});
	const { children, label, labelProps = {}, sx, ...rest } = props;
	const { children: labelChildren, sx: labelSx, ...labelRest } = labelProps;
	const ownerState = rest.ownerState;

	delete rest.date;
	delete rest.end;
	delete rest.label;
	delete rest.layout;
	delete rest.ownerState;
	delete rest.start;
	delete rest.timeSlotMinutes;
	delete rest.view;

	return (
		<CalendarTimeRangePreviewRoot ownerState={ownerState} sx={sx} {...rest}>
			<CalendarTimeRangePreviewLabel ownerState={ownerState} sx={labelSx} {...labelRest}>
				{labelChildren ?? children ?? label}
			</CalendarTimeRangePreviewLabel>
		</CalendarTimeRangePreviewRoot>
	);
}
