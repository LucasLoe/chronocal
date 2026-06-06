import { Stack } from "@mui/material";
import { styled, useThemeProps } from "@mui/material/styles";

const CalendarTopbarRoot = styled(Stack, {
	name: "CALENDAR_CalendarTopbar",
	slot: "Root",
})({
	alignItems: "center",
	minWidth: "max-content",
	flexWrap: "nowrap",
	paddingTop: 8,
	paddingBottom: 8,
});

export function CalendarTopbar(inProps) {
	const { children, sx, ...rest } = useThemeProps({
		props: inProps,
		name: "CALENDAR_CalendarTopbar",
	});

	return (
		<CalendarTopbarRoot
			direction='row'
			spacing={1}
			sx={sx}
			{...rest}
		>
			{children}
		</CalendarTopbarRoot>
	);
}
