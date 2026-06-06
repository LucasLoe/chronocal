import { Box, Typography } from "@mui/material";
import dayjs from "../../lib/dayjs";
import { CalendarCell } from "./CalendarCell";
import { getEntriesForDate, getWeekdayLabels, isSameDay } from "./utils/dateRange";
import { normalizeCalendarEntries } from "./utils/entries";
import { chunkDates } from "./utils/layout";
import { shouldRenderRowHeaders } from "./utils/rowHeaders";
import { createRowHeaderOwnerState } from "./utils/slots";
import { CALENDAR_VIEWS } from "./utils/views";
import { ROW_HEADER_GUTTER_WIDTH } from "./utils/weekGeometry";

const MONTH_CELL_MIN_WIDTH = 132;
const MONTH_CELL_MIN_HEIGHT = 116;
const MONTH_WEEKDAY_HEADER_HEIGHT = 40;
const STICKY_ROW_HEADER_Z_INDEX = 4;
const STICKY_COLUMN_HEADER_Z_INDEX = 5;
const STICKY_CORNER_Z_INDEX = 6;

export function CalendarMonthView({
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
}) {
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
	const showMonthRowHeaders = shouldRenderRowHeaders(
		showRowHeaders,
		createRowHeaderOwnerState({
			view: CALENDAR_VIEWS.MONTH,
			rowIndex: 0,
			rowStart: firstMonthRowStart,
			rowEnd: firstMonthRowEnd,
			dates: firstMonthRow,
		}),
	);
	const monthGridMinWidth =
		columnCount * MONTH_CELL_MIN_WIDTH + (showMonthRowHeaders ? ROW_HEADER_GUTTER_WIDTH : 0);
	const monthGridMinHeight = MONTH_WEEKDAY_HEADER_HEIGHT + monthRows.length * MONTH_CELL_MIN_HEIGHT;

	return (
		<Box
			data-calendar-month-grid='true'
			sx={{
				width: "100%",
				height: "100%",
				minWidth: monthGridMinWidth,
				minHeight: monthGridMinHeight,
				display: "grid",
				gridTemplateColumns: showMonthRowHeaders
					? `${ROW_HEADER_GUTTER_WIDTH}px repeat(${columnCount}, minmax(0, 1fr))`
					: `repeat(${columnCount}, minmax(0, 1fr))`,
				gridTemplateRows: `${MONTH_WEEKDAY_HEADER_HEIGHT}px repeat(${monthRows.length}, minmax(0, 1fr))`,
				borderTop: "1px solid",
				borderLeft: "1px solid",
				borderColor: "divider",
			}}
		>
			{showMonthRowHeaders && (
				<Box
					data-calendar-month-corner='true'
					sx={{
						position: "sticky",
						top: 0,
						left: 0,
						zIndex: STICKY_CORNER_Z_INDEX,
						borderRight: "1px solid",
						borderBottom: "1px solid",
						borderColor: "divider",
						backgroundColor: "background.default",
						boxSizing: "border-box",
					}}
				/>
			)}
			{weekdayLabels.map((label) => (
				<Box
					key={label}
					data-calendar-month-weekday-header={label}
					sx={{
						position: "sticky",
						top: 0,
						zIndex: STICKY_COLUMN_HEADER_Z_INDEX,
						px: 1.25,
						height: MONTH_WEEKDAY_HEADER_HEIGHT,
						borderRight: "1px solid",
						borderBottom: "1px solid",
						borderColor: "divider",
						boxSizing: "border-box",
						display: "flex",
						alignItems: "center",
						backgroundColor: "background.default",
					}}
				>
					<Typography variant='caption' sx={{ fontWeight: 700, color: "text.secondary" }}>
						{label}
					</Typography>
				</Box>
			))}

			{monthRows.map((rowDates, rowIndex) => {
				const rowStart = rowDates[0];
				const rowEnd = rowDates.at(-1).add(1, "day");
				const ownerState = createRowHeaderOwnerState({
					view: CALENDAR_VIEWS.MONTH,
					rowIndex,
					rowStart,
					rowEnd,
					dates: rowDates,
				});

				return [
					showMonthRowHeaders && (
						<Box
							key={`row-header-${rowStart.format("YYYY-MM-DD")}`}
							data-calendar-month-row-header={rowStart.format("YYYY-MM-DD")}
							sx={{
								position: "sticky",
								left: 0,
								zIndex: STICKY_ROW_HEADER_Z_INDEX,
								borderRight: "1px solid",
								borderBottom: "1px solid",
								borderColor: "divider",
								boxSizing: "border-box",
								minHeight: 0,
								overflow: "hidden",
								backgroundColor: "background.paper",
							}}
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
						</Box>
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
		</Box>
	);
}
