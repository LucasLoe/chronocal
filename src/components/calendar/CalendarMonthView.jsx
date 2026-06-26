import { Box } from "@mui/material";
import { styled, useThemeProps } from "@mui/material/styles";
import dayjs from "../../lib/dayjs";
import { useCalendarLocalization } from "./CalendarLocalizationContext";
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
		? `${ownerState.monthRowHeaderWidth}px repeat(${ownerState.columnCount}, minmax(0, 1fr))`
		: `repeat(${ownerState.columnCount}, minmax(0, 1fr))`,
	gridTemplateRows: `${ownerState.monthWeekdayHeaderHeight}px repeat(${ownerState.monthRowCount}, minmax(0, 1fr))`,
	borderTop: "1px solid",
	borderLeft: "1px solid",
	borderColor: theme.palette.divider,
}));

const CalendarMonthCorner = styled(Box, {
	name: "CALENDAR_CalendarMonthView",
	slot: "Corner",
	overridesResolver: (props, styles) => styles.corner,
})(({ theme, ownerState }) => ({
	position: "sticky",
	top: 0,
	left: 0,
	width: ownerState.monthRowHeaderWidth,
	zIndex: STICKY_CORNER_Z_INDEX,
	borderRight: "1px solid",
	borderBottom: "1px solid",
	borderColor: theme.palette.divider,
	backgroundColor: theme.palette.background.default,
	boxSizing: "border-box",
}));

const CalendarMonthRowHeaderGutter = styled(Box, {
	name: "CALENDAR_CalendarMonthView",
	slot: "RowHeaderGutter",
	overridesResolver: (props, styles) => styles.rowHeaderGutter,
})(({ theme, ownerState }) => ({
	position: "sticky",
	left: 0,
	width: ownerState.monthRowHeaderWidth,
	zIndex: STICKY_ROW_HEADER_Z_INDEX,
	borderRight: "1px solid",
	borderBottom: "1px solid",
	borderColor: theme.palette.divider,
	boxSizing: "border-box",
	minHeight: 0,
	overflow: "hidden",
	backgroundColor: theme.palette.background.paper,
}));

function resolveMonthLayoutValue(value, fallback) {
	const nextValue = Number(value);
	return Number.isFinite(nextValue) && nextValue > 0 ? nextValue : fallback;
}

function resolveMonthLayout(monthLayout = {}) {
	const layout = monthLayout || {};

	return {
		cellMinHeight: resolveMonthLayoutValue(layout.cellMinHeight, MONTH_CELL_MIN_HEIGHT),
		cellMinWidth: resolveMonthLayoutValue(layout.cellMinWidth, MONTH_CELL_MIN_WIDTH),
		rowHeaderWidth: resolveMonthLayoutValue(layout.rowHeaderWidth, ROW_HEADER_GUTTER_WIDTH),
		weekdayHeaderHeight: resolveMonthLayoutValue(
			layout.weekdayHeaderHeight,
			MONTH_WEEKDAY_HEADER_HEIGHT,
		),
	};
}

export function CalendarMonthView(inProps) {
	const props = useThemeProps({ props: inProps, name: "CALENDAR_CalendarMonthView" });
	const {
		anchorDate,
		cellSx,
		dates,
		entries,
		monthLayout,
		onItemClick,
		showRowHeaders,
		showWeekend,
		slots,
		slotProps = {},
		view = CALENDAR_VIEWS.MONTH,
	} = props;
	const { locale } = useCalendarLocalization();
	const weekdayLabels = getWeekdayLabels({ showWeekend, locale });
	const columnCount = showWeekend ? 7 : 5;
	const Cell = slots.cell;
	const MonthWeekdayHeader = slots.monthWeekdayHeader;
	const RowHeader = slots.rowHeader;
	const { sx: cellSlotSx, ...cellSlotRest } = slotProps.cell || {};
	const rowHeaderSlotProps = slotProps.rowHeader || {};
	const normalizedEntries = normalizeCalendarEntries(entries);
	const resolvedMonthLayout = resolveMonthLayout(monthLayout);
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
		columnCount * resolvedMonthLayout.cellMinWidth +
		(showMonthRowHeaders ? resolvedMonthLayout.rowHeaderWidth : 0);
	const monthGridMinHeight =
		resolvedMonthLayout.weekdayHeaderHeight + monthRows.length * resolvedMonthLayout.cellMinHeight;
	const monthViewOwnerState = {
		columnCount,
		monthCellMinHeight: resolvedMonthLayout.cellMinHeight,
		monthCellMinWidth: resolvedMonthLayout.cellMinWidth,
		monthGridMinHeight,
		monthGridMinWidth,
		monthRowHeaderWidth: resolvedMonthLayout.rowHeaderWidth,
		monthRowCount: monthRows.length,
		monthWeekdayHeaderHeight: resolvedMonthLayout.weekdayHeaderHeight,
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
			{weekdayLabels.map((label, index) => (
				<MonthWeekdayHeader
					key={`${index}-${label}`}
					data-calendar-month-weekday-header={label}
					index={index}
					label={label}
					view={view}
					ownerState={{ ...monthViewOwnerState, label, index }}
					labelProps={{ sx: monthWeekdayLabelSx, ...monthWeekdayLabelSlotRest }}
					sx={monthWeekdayHeaderSx}
					{...monthWeekdayHeaderSlotRest}
				/>
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
				const rowHeaderGutterOwnerState = { ...monthViewOwnerState, ...ownerState };

				return [
					showMonthRowHeaders && (
						<CalendarMonthRowHeaderGutter
							key={`row-header-${rowStart.format("YYYY-MM-DD")}`}
							data-calendar-month-row-header={rowStart.format("YYYY-MM-DD")}
							ownerState={rowHeaderGutterOwnerState}
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
						<Cell
							key={date.format("YYYY-MM-DD")}
							data-calendar-month-cell={date.format("YYYY-MM-DD")}
							date={date}
							isToday={isSameDay(date, dayjs())}
							isCurrentMonth={date.month() === dayjs(anchorDate).month()}
							entries={getEntriesForDate(normalizedEntries, date)}
							view={view}
							slots={slots}
							slotProps={slotProps}
							onItemClick={onItemClick}
							sx={[cellSx, cellSlotSx]}
							{...cellSlotRest}
						/>
					)),
				];
			})}
		</CalendarMonthViewRoot>
	);
}
