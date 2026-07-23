import { Box, Stack } from "@mui/material";
import { styled, useThemeProps } from "@mui/material/styles";
import { useRef, useState } from "react";
import dayjs from "../../lib/dayjs";
import {
	formatTimeRange,
	formatWeekHeader,
	useCalendarLocalization,
} from "./CalendarLocalizationContext";
import { isSameDay } from "./utils/dateRange";
import { normalizeCalendarEntries } from "./utils/entries";
import { composeCalendarEventHandlers } from "./utils/eventHandlers";
import { createCalendarItemClickHandler } from "./utils/itemEvents";
import { shouldRenderRowHeaders } from "./utils/rowHeaders";
import { CALENDAR_VIEWS } from "./utils/views";
import { useWeekDndInteractions } from "./utils/weekDndInteractions";
import {
	getWeekColumnHeight,
	ROW_HEADER_GUTTER_WIDTH,
	WEEK_HEADER_HEIGHT,
} from "./utils/weekGeometry";
import { trapWeekEntryPointerEvent, WEEK_ENTRY_TIME_ACTIONS } from "./utils/weekInteractions";
import { getWeekEntryLayouts } from "./utils/weekLayout";
import { getWeekTimeSlotByIndex } from "./utils/timeSlots";
import { useWeekHourHeight } from "./useWeekHourHeight";

const WEEK_DAY_MIN_WIDTH = 132;
const STICKY_ROW_HEADER_Z_INDEX = 4;
const STICKY_CORNER_Z_INDEX = 6;

const CalendarWeekViewRoot = styled(Box, {
	name: "CALENDAR_CalendarWeekView",
	slot: "Root",
})(({ theme, ownerState }) => ({
	display: "flex",
	width: "100%",
	minWidth: ownerState.weekGridMinWidth,
	borderTop: "1px solid",
	borderLeft: "1px solid",
	borderColor: theme.palette.divider,
}));

const CalendarWeekViewContent = styled(Box, {
	name: "CALENDAR_CalendarWeekView",
	slot: "Content",
	overridesResolver: (props, styles) => styles.content,
})({
	flex: 1,
	minWidth: 0,
});

const CalendarWeekViewGrid = styled(Box, {
	name: "CALENDAR_CalendarWeekView",
	slot: "Grid",
	overridesResolver: (props, styles) => styles.grid,
})(({ ownerState }) => ({
	display: "grid",
	gridTemplateColumns: `repeat(${ownerState.columnCount}, minmax(0, 1fr))`,
}));

const CalendarWeekColumn = styled(Box, {
	name: "CALENDAR_CalendarWeekView",
	slot: "Column",
	overridesResolver: (props, styles) => styles.column,
})(({ theme, ownerState }) => ({
	position: "relative",
	cursor: ownerState.onTimeSlotClick ? "pointer" : "default",
	height: getWeekColumnHeight(ownerState.workHours, ownerState.hourHeight),
	borderRight: "1px solid",
	borderBottom: "1px solid",
	borderColor: theme.palette.divider,
	boxSizing: "border-box",
	backgroundColor: ownerState.isToday ? theme.palette.action.hover : theme.palette.background.paper,
	backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${ownerState.hourHeight - 1}px, ${theme.palette.divider} ${ownerState.hourHeight - 1}px, ${theme.palette.divider} ${ownerState.hourHeight}px)`,
}));

const CalendarWeekEntryTimePreview = styled(Box, {
	name: "CALENDAR_CalendarWeekView",
	slot: "EntryTimePreview",
	overridesResolver: (props, styles) => styles.entryTimePreview,
})(({ theme, ownerState }) => ({
	position: "absolute",
	top: ownerState.layout.top,
	left: 2,
	right: 2,
	height: ownerState.layout.height,
	zIndex: 4,
	pointerEvents: "none",
	border: "2px dashed",
	borderColor: theme.palette.primary.main,
	borderRadius: theme.shape.borderRadius * 0.5,
	backgroundColor: theme.palette.primary.main,
	opacity: 0.18,
	boxSizing: "border-box",
}));

const CalendarWeekEntryTimePreviewLabel = styled(Box, {
	name: "CALENDAR_CalendarWeekView",
	slot: "EntryTimePreviewLabel",
	overridesResolver: (props, styles) => styles.entryTimePreviewLabel,
})(({ theme, ownerState }) => ({
	position: "absolute",
	top: ownerState.action === WEEK_ENTRY_TIME_ACTIONS.RESIZE_END ? "auto" : -24,
	bottom: ownerState.action === WEEK_ENTRY_TIME_ACTIONS.RESIZE_END ? -24 : "auto",
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

const CalendarWeekTimeSlotLayer = styled(Box, {
	name: "CALENDAR_CalendarWeekView",
	slot: "TimeSlotLayer",
	overridesResolver: (props, styles) => styles.timeSlotLayer,
})({
	position: "absolute",
	inset: 0,
	zIndex: 1,
	pointerEvents: "none",
});

const CalendarWeekKeyboardTimeSlot = styled(Box, {
	name: "CALENDAR_CalendarWeekView",
	slot: "KeyboardTimeSlot",
	overridesResolver: (props, styles) => styles.keyboardTimeSlot,
})(({ theme, ownerState }) => ({
	position: "absolute",
	top: ownerState.timeSlot.top,
	left: 1,
	right: 1,
	height: ownerState.timeSlot.height,
	minHeight: 2,
	padding: 0,
	border: 0,
	background: "transparent",
	pointerEvents: "none",
	zIndex: 3,
	"&:focus-visible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: -2,
		backgroundColor: theme.palette.action.focus,
	},
}));

const CalendarWeekDraggableEntry = styled(Box, {
	name: "CALENDAR_CalendarWeekView",
	slot: "DraggableEntry",
	overridesResolver: (props, styles) => styles.draggableEntry,
})(({ ownerState }) => ({
	position: "absolute",
	top: ownerState.layout.top,
	left: ownerState.layout.left,
	width: ownerState.layout.width,
	height: ownerState.layout.height,
	padding: 2,
	zIndex: 2,
	cursor: ownerState.onEntryTimeChange ? "grab" : "default",
	opacity: ownerState.isActiveEntryTimeEntry ? 0.45 : 1,
	pointerEvents: ownerState.isActiveEntryTimeEntry ? "none" : "auto",
	touchAction: "none",
	"& > *": {
		width: "100%",
	},
}));

const CalendarWeekResizeHandle = styled(Box, {
	name: "CALENDAR_CalendarWeekView",
	slot: "ResizeHandle",
	overridesResolver: (props, styles) => styles.resizeHandle,
})(({ ownerState }) => ({
	position: "absolute",
	top: ownerState.action === WEEK_ENTRY_TIME_ACTIONS.RESIZE_START ? 2 : "auto",
	bottom: ownerState.action === WEEK_ENTRY_TIME_ACTIONS.RESIZE_END ? 2 : "auto",
	left: 8,
	right: 8,
	height: 6,
	cursor: "ns-resize",
	zIndex: 3,
	touchAction: "none",
}));

const CalendarWeekRowHeaderGutterRoot = styled(Stack, {
	name: "CALENDAR_CalendarWeekView",
	slot: "RowHeaderGutter",
	overridesResolver: (props, styles) => styles.rowHeaderGutter,
})(({ theme }) => ({
	flex: `0 0 ${ROW_HEADER_GUTTER_WIDTH}px`,
	width: ROW_HEADER_GUTTER_WIDTH,
	borderRight: "1px solid",
	borderColor: theme.palette.divider,
	boxSizing: "border-box",
	position: "sticky",
	left: 0,
	zIndex: STICKY_ROW_HEADER_Z_INDEX,
	backgroundColor: theme.palette.background.paper,
}));

const CalendarWeekRowHeaderCorner = styled(Box, {
	name: "CALENDAR_CalendarWeekView",
	slot: "RowHeaderCorner",
	overridesResolver: (props, styles) => styles.rowHeaderCorner,
})(({ theme }) => ({
	height: WEEK_HEADER_HEIGHT,
	position: "sticky",
	top: 0,
	zIndex: STICKY_CORNER_Z_INDEX,
	borderBottom: "1px solid",
	borderColor: theme.palette.divider,
	backgroundColor: theme.palette.background.default,
	boxSizing: "border-box",
}));

const CalendarWeekRowHeaderCell = styled(Box, {
	name: "CALENDAR_CalendarWeekView",
	slot: "RowHeaderCell",
	overridesResolver: (props, styles) => styles.rowHeaderCell,
})(({ theme, ownerState }) => ({
	height: ownerState.hourHeight,
	borderBottom: "1px solid",
	borderColor: theme.palette.divider,
	boxSizing: "border-box",
}));

function WeekRowHeaderGutter({ rowHeaders, slotProps, RowHeader, rowHeaderSlotProps }) {
	const { sx: weekRowHeaderGutterSx, ...weekRowHeaderGutterSlotRest } =
		slotProps.weekRowHeaderGutter || {};
	const { sx: weekRowHeaderCornerSx, ...weekRowHeaderCornerSlotRest } =
		slotProps.weekRowHeaderCorner || {};
	const { sx: weekRowHeaderCellSx, ...weekRowHeaderCellSlotRest } =
		slotProps.weekRowHeaderCell || {};

	return (
		<CalendarWeekRowHeaderGutterRoot
			data-calendar-week-row-header-gutter='true'
			sx={weekRowHeaderGutterSx}
			{...weekRowHeaderGutterSlotRest}
		>
			<CalendarWeekRowHeaderCorner
				sx={weekRowHeaderCornerSx}
				{...weekRowHeaderCornerSlotRest}
			/>
			{rowHeaders.map(({ ownerState, visible }) => {
				const { rowIndex, rowStart, rowEnd } = ownerState;
				return (
					<CalendarWeekRowHeaderCell
						key={rowStart.format("HH:mm")}
						ownerState={ownerState}
						sx={weekRowHeaderCellSx}
						{...weekRowHeaderCellSlotRest}
					>
						{visible && (
							<RowHeader
								view={CALENDAR_VIEWS.WEEK}
								rowIndex={rowIndex}
								rowStart={rowStart}
								rowEnd={rowEnd}
								ownerState={ownerState}
								{...rowHeaderSlotProps}
							/>
						)}
					</CalendarWeekRowHeaderCell>
				);
			})}
		</CalendarWeekRowHeaderGutterRoot>
	);
}

function WeekdayColumn({
	date,
	getKeyboardTimeSlot,
	handleKeyboardTimeSlotFocus,
	handleKeyboardTimeSlotKeyDown,
	hourHeight,
	keyboardTimeSlot,
	keyboardTimeSlotRefs,
	locale,
	normalizedEntries,
	onEntryTimeChange,
	onItemClick,
	onTimeSlotClick,
	slotProps,
	slots,
	view,
	weekViewOwnerState,
	weekInteractions: {
		activeEntryTimeId, activeEntryTimePreview, getWeekEntryTimePointerProps,
		handleWeekColumnClick, handleWeekColumnDragOver, handleWeekColumnDrop,
		handleWeekColumnPointerLeave, handleWeekColumnPointerMove,
		handleWeekItemClick, handleWeekItemPointerEnter, hoveredTimeSlot,
	},
	workHours,
}) {
	const Entry = slots.entry;
	const Item = slots.item;
	const TimeSlotIndicator = slots.timeSlotIndicator;
	const { sx: weekEntrySx, ...weekEntrySlotRest } = slotProps.entry || {};
	const { onClick: itemSlotOnClick, ...itemSlotRest } = slotProps.item || {};
	const { sx: timeSlotIndicatorSx, ...timeSlotIndicatorSlotRest } =
		slotProps.timeSlotIndicator || {};
	const {
		sx: weekColumnSx,
		onClick: weekColumnOnClick,
		onDragOver: weekColumnOnDragOver,
		onDrop: weekColumnOnDrop,
		onPointerLeave: weekColumnOnPointerLeave,
		onPointerMove: weekColumnOnPointerMove,
		...weekColumnSlotRest
	} = slotProps.weekColumn || {};
	const { sx: weekEntryTimePreviewSx, ...weekEntryTimePreviewSlotRest } =
		slotProps.weekEntryTimePreview || {};
	const { sx: weekEntryTimePreviewLabelSx, ...weekEntryTimePreviewLabelSlotRest } =
		slotProps.weekEntryTimePreviewLabel || {};
	const { sx: weekTimeSlotLayerSx, ...weekTimeSlotLayerSlotRest } =
		slotProps.weekTimeSlotLayer || {};
	const {
		sx: weekDraggableEntrySx,
		onClick: weekDraggableEntryOnClick,
		onPointerDown: weekDraggableEntryOnPointerDown,
		onPointerEnter: weekDraggableEntryOnPointerEnter,
		onPointerMove: weekDraggableEntryOnPointerMove,
		...weekDraggableEntrySlotRest
	} = slotProps.weekDraggableEntry || {};
	const {
		sx: weekResizeHandleSx,
		onClick: weekResizeHandleOnClick,
		onPointerDown: weekResizeHandleOnPointerDown,
		...weekResizeHandleSlotRest
	} = slotProps.weekResizeHandle || {};
	const dateKey = date.format("YYYY-MM-DD");
	const columnKeyboardTimeSlot =
		keyboardTimeSlot?.dateKey === dateKey
			? keyboardTimeSlot.timeSlot
			: getKeyboardTimeSlot(date, keyboardTimeSlot?.timeSlot.index ?? 0);
	const visibleTimeSlot =
		hoveredTimeSlot?.dateKey === dateKey
			? hoveredTimeSlot.timeSlot
			: keyboardTimeSlot?.dateKey === dateKey
				? keyboardTimeSlot.timeSlot
				: null;
	const columnEntryTimePreview =
		activeEntryTimePreview?.dateKey === dateKey ? activeEntryTimePreview : null;
	const positionedEntries = getWeekEntryLayouts({
		entries: normalizedEntries,
		date,
		workHours,
		hourHeight,
	});
	const entryOwnerState = {
		date,
		entries: positionedEntries,
		hourHeight,
		view,
	};
	const columnOwnerState = {
		...weekViewOwnerState,
		date,
		isToday: isSameDay(date, dayjs()),
		onTimeSlotClick,
	};

	return (
		<CalendarWeekColumn
			data-calendar-week-column={dateKey}
			onDragOver={composeCalendarEventHandlers(
				handleWeekColumnDragOver(date),
				weekColumnOnDragOver,
			)}
			onDrop={composeCalendarEventHandlers(handleWeekColumnDrop(date), weekColumnOnDrop)}
			onPointerMove={composeCalendarEventHandlers(
				handleWeekColumnPointerMove(date),
				weekColumnOnPointerMove,
			)}
			onPointerLeave={composeCalendarEventHandlers(
				handleWeekColumnPointerLeave,
				weekColumnOnPointerLeave,
			)}
			onClick={composeCalendarEventHandlers(
				handleWeekColumnClick(date),
				weekColumnOnClick,
			)}
			ownerState={columnOwnerState}
			sx={weekColumnSx}
			{...weekColumnSlotRest}
		>
			{onTimeSlotClick && (
				<CalendarWeekKeyboardTimeSlot
					component='button'
					type='button'
					ref={(element) => {
						if (element) {
							keyboardTimeSlotRefs.current.set(dateKey, element);
						} else {
							keyboardTimeSlotRefs.current.delete(dateKey);
						}
					}}
					aria-label={`${(locale ? date.locale(locale) : date).format("dddd, D MMMM YYYY")}, ${formatTimeRange(columnKeyboardTimeSlot.start, columnKeyboardTimeSlot.end, locale)}`}
					ownerState={{ date, timeSlot: columnKeyboardTimeSlot, view }}
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
					}}
					onFocus={handleKeyboardTimeSlotFocus(date, columnKeyboardTimeSlot)}
					onKeyDown={handleKeyboardTimeSlotKeyDown(date, columnKeyboardTimeSlot)}
				/>
			)}
			{columnEntryTimePreview && (
				<CalendarWeekEntryTimePreview
					data-calendar-week-entry-time-preview={columnEntryTimePreview.id}
					ownerState={columnEntryTimePreview}
					sx={weekEntryTimePreviewSx}
					{...weekEntryTimePreviewSlotRest}
				>
					<CalendarWeekEntryTimePreviewLabel
						data-calendar-week-entry-time-preview-label={columnEntryTimePreview.id}
						ownerState={columnEntryTimePreview}
						sx={weekEntryTimePreviewLabelSx}
						{...weekEntryTimePreviewLabelSlotRest}
					>
						{columnEntryTimePreview.label}
					</CalendarWeekEntryTimePreviewLabel>
				</CalendarWeekEntryTimePreview>
			)}
			{visibleTimeSlot && (
				<CalendarWeekTimeSlotLayer
					ownerState={{ ...columnOwnerState, timeSlot: visibleTimeSlot }}
					sx={weekTimeSlotLayerSx}
					{...weekTimeSlotLayerSlotRest}
				>
					<TimeSlotIndicator
						date={date}
						view={view}
						timeSlot={visibleTimeSlot}
						ownerState={{
							date,
							view,
							timeSlot: visibleTimeSlot,
						}}
						sx={[timeSlotIndicatorSx, { pointerEvents: "none" }]}
						{...timeSlotIndicatorSlotRest}
					/>
				</CalendarWeekTimeSlotLayer>
			)}
			<Entry
				date={date}
				entries={positionedEntries}
				view={view}
				ownerState={entryOwnerState}
				sx={[{ position: "absolute", inset: 0 }, weekEntrySx]}
				{...weekEntrySlotRest}
			>
				{positionedEntries.map((entry) => {
					const { layout } = entry;
					const isActiveEntryTimeEntry =
						activeEntryTimeId === entry.id || activeEntryTimePreview?.id === entry.id;
					const itemClickHandler = createCalendarItemClickHandler({
						item: entry,
						slotOnClick: itemSlotOnClick,
						onItemClick,
					});
					const movePointerDown = getWeekEntryTimePointerProps({
						action: WEEK_ENTRY_TIME_ACTIONS.MOVE,
						date,
						disabled: !onEntryTimeChange,
						entry,
					}).onPointerDown;
					const resizeStartPointerDown = getWeekEntryTimePointerProps({
						action: WEEK_ENTRY_TIME_ACTIONS.RESIZE_START,
						date,
						entry,
					}).onPointerDown;
					const resizeEndPointerDown = getWeekEntryTimePointerProps({
						action: WEEK_ENTRY_TIME_ACTIONS.RESIZE_END,
						date,
						entry,
					}).onPointerDown;

					return (
						<CalendarWeekDraggableEntry
							key={entry.id}
							data-calendar-week-entry={entry.id}
							ownerState={{
								date,
								entry,
								hourHeight,
								isActiveEntryTimeEntry,
								layout,
								onEntryTimeChange,
								view,
							}}
							onPointerDown={composeCalendarEventHandlers(
								movePointerDown,
								weekDraggableEntryOnPointerDown,
							)}
							onPointerEnter={composeCalendarEventHandlers(
								handleWeekItemPointerEnter,
								weekDraggableEntryOnPointerEnter,
							)}
							onPointerMove={composeCalendarEventHandlers(
								trapWeekEntryPointerEvent,
								weekDraggableEntryOnPointerMove,
							)}
							onClick={composeCalendarEventHandlers(
								handleWeekItemClick(itemClickHandler),
								weekDraggableEntryOnClick,
							)}
							sx={weekDraggableEntrySx}
							{...weekDraggableEntrySlotRest}
						>
							<Item
								item={entry}
								entry={entry}
								date={date}
								view={view}
								layout={layout}
								onClick={handleWeekItemClick(itemClickHandler)}
								ownerState={{ date, item: entry, entry, view, layout, hourHeight }}
								{...itemSlotRest}
							/>
							{onEntryTimeChange && (
								<>
									<CalendarWeekResizeHandle
										data-calendar-week-resize-handle={`${entry.id}-start`}
										ownerState={{
											action: WEEK_ENTRY_TIME_ACTIONS.RESIZE_START,
											date,
											entry,
											view,
										}}
										onPointerDown={composeCalendarEventHandlers(
											resizeStartPointerDown,
											weekResizeHandleOnPointerDown,
										)}
										onClick={composeCalendarEventHandlers(
											trapWeekEntryPointerEvent,
											weekResizeHandleOnClick,
										)}
										sx={weekResizeHandleSx}
										{...weekResizeHandleSlotRest}
									/>
									<CalendarWeekResizeHandle
										data-calendar-week-resize-handle={`${entry.id}-end`}
										ownerState={{
											action: WEEK_ENTRY_TIME_ACTIONS.RESIZE_END,
											date,
											entry,
											view,
										}}
										onPointerDown={composeCalendarEventHandlers(
											resizeEndPointerDown,
											weekResizeHandleOnPointerDown,
										)}
										onClick={composeCalendarEventHandlers(
											trapWeekEntryPointerEvent,
											weekResizeHandleOnClick,
										)}
										sx={weekResizeHandleSx}
										{...weekResizeHandleSlotRest}
									/>
								</>
							)}
						</CalendarWeekDraggableEntry>
					);
				})}
			</Entry>
		</CalendarWeekColumn>
	);
}

export function CalendarWeekView(inProps) {
	const props = useThemeProps({ props: inProps, name: "CALENDAR_CalendarWeekView" });
	const {
		dates,
		entries,
		onEntryTimeChange,
		onExternalItemDrop,
		onItemClick,
		onTimeSlotClick,
		showRowHeaders,
		showWeekend,
		weekLayout,
		slots,
		slotProps = {},
		timeSlotMinutes,
		view = CALENDAR_VIEWS.WEEK,
		workHours,
	} = props;
	const columnCount = showWeekend ? 7 : 5;
	const { locale } = useCalendarLocalization();
	const Header = slots.weekHeader;
	const RowHeader = slots.rowHeader;
	const rowHeaderSlotProps = slotProps.rowHeader || {};
	const { sx: weekRootSx, ...weekRootSlotRest } = slotProps.weekRoot || {};
	const { sx: weekContentSx, ...weekContentSlotRest } = slotProps.weekContent || {};
	const { sx: weekGridSx, ...weekGridSlotRest } = slotProps.weekGrid || {};
	const { sx: weekHeaderSx, ...weekHeaderSlotRest } = slotProps.weekHeader || {};
	const { sx: weekHeaderLabelSx, ...weekHeaderLabelSlotRest } =
		slotProps.weekHeaderLabel || {};
	const normalizedEntries = normalizeCalendarEntries(entries);
	const weekViewRef = useRef(null);
	const weekGridRef = useRef(null);
	const keyboardTimeSlotRefs = useRef(new Map());
	const [keyboardTimeSlot, setKeyboardTimeSlot] = useState(null);
	const hourHeight = useWeekHourHeight({ rootRef: weekViewRef, weekLayout, workHours });
	const weekRowHeaders = Array.from(
		{ length: workHours.endHour - workHours.startHour },
		(_, rowIndex) => {
			const rowStart = dayjs(dates[0] ?? dayjs())
				.hour(workHours.startHour + rowIndex)
				.minute(0)
				.second(0)
				.millisecond(0);
			const ownerState = {
				view: CALENDAR_VIEWS.WEEK,
				rowIndex,
				rowStart,
				rowEnd: rowStart.add(1, "hour"),
				hourHeight,
			};

			return {
				ownerState,
				visible: shouldRenderRowHeaders(showRowHeaders, ownerState),
			};
		},
	);
	const showWeekRowHeaders = weekRowHeaders.some((rowHeader) => rowHeader.visible);
	const weekGridMinWidth =
		columnCount * WEEK_DAY_MIN_WIDTH + (showWeekRowHeaders ? ROW_HEADER_GUTTER_WIDTH : 0);
	const weekViewOwnerState = {
		columnCount,
		hourHeight,
		showWeekRowHeaders,
		view,
		weekGridMinWidth,
		workHours,
	};
	const weekInteractions = useWeekDndInteractions({
		dates,
		gridRef: weekGridRef,
		locale,
		onEntryTimeChange,
		onExternalItemDrop,
		onTimeSlotClick,
		timeSlotMinutes,
		view,
		workHours,
		hourHeight,
	});
	const getKeyboardTimeSlot = (date, index = 0) =>
		getWeekTimeSlotByIndex({ date, index, workHours, timeSlotMinutes, hourHeight });
	const handleKeyboardTimeSlotFocus = (date, timeSlot) => () => {
		setKeyboardTimeSlot({ dateKey: date.format("YYYY-MM-DD"), date, timeSlot });
	};
	const handleKeyboardTimeSlotKeyDown = (date, timeSlot) => (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			event.stopPropagation();
			onTimeSlotClick?.({
				start: timeSlot.start,
				end: timeSlot.end,
				date,
				view,
				timeSlotMinutes: timeSlot.minutes,
			});
			return;
		}

		const dateIndex = dates.findIndex((visibleDate) => visibleDate.isSame(date, "day"));
		const indexChange = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
		const dateChange = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;

		if (!indexChange && !dateChange) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		const targetDate = dates[Math.min(Math.max(dateIndex + dateChange, 0), dates.length - 1)];
		const nextTimeSlot = getKeyboardTimeSlot(targetDate, timeSlot.index + indexChange);
		const targetDateKey = targetDate.format("YYYY-MM-DD");
		setKeyboardTimeSlot({ dateKey: targetDateKey, date: targetDate, timeSlot: nextTimeSlot });

		if (dateChange) {
			keyboardTimeSlotRefs.current.get(targetDateKey)?.focus();
		}
	};

	return (
		<CalendarWeekViewRoot
			data-calendar-week-view-grid='true'
			ownerState={weekViewOwnerState}
			sx={weekRootSx}
			{...weekRootSlotRest}
			ref={weekViewRef}
		>
			{showWeekRowHeaders && (
				<WeekRowHeaderGutter
					rowHeaders={weekRowHeaders}
					slotProps={slotProps}
					RowHeader={RowHeader}
					rowHeaderSlotProps={rowHeaderSlotProps}
				/>
			)}
			<CalendarWeekViewContent
				ownerState={weekViewOwnerState}
				sx={weekContentSx}
				{...weekContentSlotRest}
			>
				<CalendarWeekViewGrid
					ref={weekGridRef}
					data-calendar-week-grid='true'
					ownerState={weekViewOwnerState}
					sx={weekGridSx}
					{...weekGridSlotRest}
				>
					{dates.map((date) => (
						<Header
							key={`${date.format("YYYY-MM-DD")}-heading`}
							data-calendar-week-header={date.format("YYYY-MM-DD")}
							date={date}
							label={formatWeekHeader(date, locale)}
							view={view}
							ownerState={{ ...weekViewOwnerState, date }}
							labelProps={{ sx: weekHeaderLabelSx, ...weekHeaderLabelSlotRest }}
							sx={weekHeaderSx}
							{...weekHeaderSlotRest}
						/>
					))}

					{dates.map((date) => (
						<WeekdayColumn
							key={date.format("YYYY-MM-DD")}
							date={date}
							getKeyboardTimeSlot={getKeyboardTimeSlot}
							handleKeyboardTimeSlotFocus={handleKeyboardTimeSlotFocus}
							handleKeyboardTimeSlotKeyDown={handleKeyboardTimeSlotKeyDown}
							hourHeight={hourHeight}
							keyboardTimeSlot={keyboardTimeSlot}
							keyboardTimeSlotRefs={keyboardTimeSlotRefs}
							locale={locale}
							normalizedEntries={normalizedEntries}
							onEntryTimeChange={onEntryTimeChange}
							onItemClick={onItemClick}
							onTimeSlotClick={onTimeSlotClick}
							slotProps={slotProps}
							slots={slots}
							view={view}
							weekInteractions={weekInteractions}
							weekViewOwnerState={weekViewOwnerState}
							workHours={workHours}
						/>
					))}
				</CalendarWeekViewGrid>
			</CalendarWeekViewContent>
		</CalendarWeekViewRoot>
	);
}
