import { Box } from "@mui/material";
import { styled, useThemeProps } from "@mui/material/styles";

const CalendarEntryRoot = styled(Box, {
	name: "CALENDAR_CalendarEntry",
	slot: "Root",
})({
	display: "flex",
	flexDirection: "column",
	width: "100%",
	minWidth: 0,
});

export function CalendarEntry(inProps) {
	const { children, sx, ...rest } = useThemeProps({
		props: inProps,
		name: "CALENDAR_CalendarEntry",
	});
	const ownerState = rest.ownerState;

	delete rest.date;
	delete rest.entries;
	delete rest.view;
	delete rest.ownerState;

	return (
		<CalendarEntryRoot ownerState={ownerState} sx={sx} {...rest}>
			{children}
		</CalendarEntryRoot>
	);
}
