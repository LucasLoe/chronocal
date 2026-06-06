import { Box, Typography } from "@mui/material";
import { styled, useThemeProps } from "@mui/material/styles";
import dayjs from "../../lib/dayjs";
import { CalendarCell } from "./CalendarCell";
import { getEntriesForDate, getWeekdayLabels, isSameDay } from "./utils/dateRange";
import { normalizeCalendarEntries } from "./utils/entries";
import { chunkDates } from "./utils/layout";
import { shouldRenderRowHeaders } from "./utils/rowHeaders";
import { CALENDAR_VIEWS } from "./utils/views";
import { ROW_HEADER_GUTTER_WIDTH } from "./utils/weekGeometry";

const MONTH_CELL_MIN_WIDTH = 132;
const MONTH_CELL_MIN_HEIGHT = 116;
const MONTH_WEEKDAY_HEADER_HEIGHT = 40;
const STICKY_ROW_HEADER_Z_INDEX = 4;
const STICKY_COLUMN_HEADER_Z_INDEX = 5;
const STICKY_CORNER_Z_INDEX = 6;

const CalendarMonthViewRoot = styled(Box, {
	name: "CALENDAR_CalendarMonthView",
	slot: "Root",
})(({ theme, ownerState }) => ({
	width: "100%",
	height: "100%",
	minWidth: ownerState.monthGridMinWidth,
	minHeight: ownerState.monthGridMinHeight,
	display: "grid",
	gridTemplateColumns: ownerState.showMonthRowHeaders
		? `${ROW_HEADER_GUTTER_WIDTH}px repeat(${ownerState.columnCount}, minmax(0, 1fr))`
		: `repeat(${ownerState.columnCount}, minmax(0, 1fr))`,
	gridTemplateRows: `${MONTH_WEEKDAY_HEADER_HEIGHT}px repeat(${ownerState.monthRowCount}, minmax(0, 1fr))`,
	borderTop: "1px solid",
	borderLeft: "1px solid",
	borderColor: theme.palette.divider,
}));

const CalendarMonthCorner = styled(Box, {
	name: "CALENDAR_CalendarMonthView",
	slot: "Corner",
	overridesResolver: (props, styles) => styles.corner,
})(({ theme }) => ({
	position: "sticky",
	top: 0,
	left: 0,
	zIndex: STICKY_CORNER_Z_INDEX,
	borderRight: "1px solid",
	borderBottom: "1px solid",
	borderColor: theme.palette.divider,
	backgroundColor: theme.palette.background.default,
	boxSizing: "border-box",
}));

const CalendarMonthWeekdayHeader = styled(Box, {
	name: "CALENDAR_CalendarMonthView",
	slot: "WeekdayHeader",
	overridesResolver: (props, styles) => styles.weekdayHeader,
})(({ theme }) => ({
	position: "sticky",
	top: 0,
	zIndex: STICKY_COLUMN_HEADER_Z_INDEX,
	paddingLeft: theme.spacing(1.25),
	paddingRight: theme.spacing(1.25),
	height: MONTH_WEEKDAY_HEADER_HEIGHT,
	borderRight: "1px solid",
	borderBottom: "1px solid",
	borderColor: theme.palette.divider,
	boxSizing: "border-box",
	display: "flex",
	alignItems: "center",
	backgroundColor: theme.palette.background.default,
}));

const CalendarMonthWeekdayLabel = styled(Typography, {
	name: "CALENDAR_CalendarMonthView",
	slot: "WeekdayLabel",
	overridesResolver: (props, styles) => styles.weekdayLabel,
})(({ theme }) => ({
	fontWeight: 700,
	color: theme.palette.text.secondary,
}));

const CalendarMonthRowHeaderGutter = styled(Box, {
	name: "CALENDAR_CalendarMonthView",
	slot: "RowHeaderGutter",
	overridesResolver: (props, styles) => styles.rowHeaderGutter,
})(({ theme }) => ({
	position: "sticky",
	left: 0,
	zIndex: STICKY_ROW_HEADER_Z_INDEX,
	borderRight: "1px solid",
	borderBottom: "1px solid",
	borderColor: theme.palette.divider,
	boxSizing: "border-box",
	minHeight: 0,
	overflow: "hidden",
	backgroundColor: theme.palette.background.paper,
}));

export function CalendarMonthView(inProps) {
	const props = useThemeProps({ props: inProps, name: "CALENDAR_CalendarMonthView" });
	const {
	anchorDate,
	cellSx,
	dates,
	entries,
	onItemClick,
	showRowHeaders,
	showWeekend,
	slots,
	slotProps = {},
	view = CALENDAR_VIEWS.MONTH,
	} = props;
	const weekdayLabels = getWeekdayLabels({ showWeekend });
	const columnCount = showWeekend ? 7 : 5;
	const RowHeader = slots.rowHeader;
	const rowHeaderSlotProps = slotProps.rowHeader || {};
	const normalizedEntries = normalizeCalendarEntries(entries);
	const filteredMonthDates = dates.filter((date) => (showWeekend ? true : date.isoWeekday() <= 5));
	const monthRows = chunkDates(filteredMonthDates, columnCount);
	const firstMonthRow = monthRows[0] || [];
	const firstMonthRowStart = firstMonthRow[0];
	const firstMonthRowEnd = firstMonthRow.at(-1)?.add(1, "day");
	const showMonthRowHeaders = shouldRenderRowHeaders(showRowHeaders, {
		view: CALENDAR_VIEWS.MONTH,
		rowIndex: 0,
		rowStart: firstMonthRowStart,
		rowEnd: firstMonthRowEnd,
		dates: firstMonthRow,
	});
	const monthGridMinWidth =
		columnCount * MONTH_CELL_MIN_WIDTH + (showMonthRowHeaders ? ROW_HEADER_GUTTER_WIDTH : 0);
	const monthGridMinHeight = MONTH_WEEKDAY_HEADER_HEIGHT + monthRows.length * MONTH_CELL_MIN_HEIGHT;
	const monthViewOwnerState = {
		columnCount,
		monthGridMinHeight,
		monthGridMinWidth,
		monthRowCount: monthRows.length,
		showMonthRowHeaders,
		view,
	};
	const { sx: monthRootSx, ...monthRootSlotRest } = slotProps.monthRoot || {};
	const { sx: monthCornerSx, ...monthCornerSlotRest } = slotProps.monthCorner || {};
	const { sx: monthWeekdayHeaderSx, ...monthWeekdayHeaderSlotRest } =
		slotProps.monthWeekdayHeader || {};
	const { sx: monthWeekdayLabelSx, ...monthWeekdayLabelSlotRest } =
		slotProps.monthWeekdayLabel || {};
	const { sx: monthRowHeaderGutterSx, ...monthRowHeaderGutterSlotRest } =
		slotProps.monthRowHeaderGutter || {};

	return (
		<CalendarMonthViewRoot
			data-calendar-month-grid='true'
			ownerState={monthViewOwnerState}
			sx={monthRootSx}
			{...monthRootSlotRest}
		>
			{showMonthRowHeaders && (
				<CalendarMonthCorner
					data-calendar-month-corner='true'
					ownerState={monthViewOwnerState}
					sx={monthCornerSx}
					{...monthCornerSlotRest}
				/>
			)}
			{weekdayLabels.map((label) => (
				<CalendarMonthWeekdayHeader
					key={label}
					data-calendar-month-weekday-header={label}
					ownerState={{ ...monthViewOwnerState, label }}
					sx={monthWeekdayHeaderSx}
					{...monthWeekdayHeaderSlotRest}
				>
					<CalendarMonthWeekdayLabel
						variant='caption'
						ownerState={{ ...monthViewOwnerState, label }}
						sx={monthWeekdayLabelSx}
						{...monthWeekdayLabelSlotRest}
					>
						{label}
					</CalendarMonthWeekdayLabel>
				</CalendarMonthWeekdayHeader>
			))}

			{monthRows.map((rowDates, rowIndex) => {
				const rowStart = rowDates[0];
				const rowEnd = rowDates.at(-1).add(1, "day");
				const ownerState = {
					view: CALENDAR_VIEWS.MONTH,
					rowIndex,
					rowStart,
					rowEnd,
					dates: rowDates,
				};

				return [
					showMonthRowHeaders && (
						<CalendarMonthRowHeaderGutter
							key={`row-header-${rowStart.format("YYYY-MM-DD")}`}
							data-calendar-month-row-header={rowStart.format("YYYY-MM-DD")}
							ownerState={ownerState}
							sx={monthRowHeaderGutterSx}
							{...monthRowHeaderGutterSlotRest}
						>
							<RowHeader
								view={CALENDAR_VIEWS.MONTH}
								rowIndex={rowIndex}
								rowStart={rowStart}
								rowEnd={rowEnd}
								dates={rowDates}
								ownerState={ownerState}
								{...rowHeaderSlotProps}
							/>
						</CalendarMonthRowHeaderGutter>
					),
					...rowDates.map((date) => (
						<CalendarCell
							key={date.format("YYYY-MM-DD")}
							date={date}
							isToday={isSameDay(date, dayjs())}
							isCurrentMonth={date.month() === dayjs(anchorDate).month()}
							entries={getEntriesForDate(normalizedEntries, date)}
							view={view}
							slots={slots}
							slotProps={slotProps}
							onItemClick={onItemClick}
							sx={cellSx}
						/>
					)),
				];
			})}
		</CalendarMonthViewRoot>
	);
}
