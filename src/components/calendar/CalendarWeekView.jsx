import { Box, Stack } from "@mui/material";
import { styled, useThemeProps } from "@mui/material/styles";
import { useRef } from "react";
import dayjs from "../../lib/dayjs";
import { isSameDay } from "./utils/dateRange";
import { normalizeCalendarEntries } from "./utils/entries";
import { createCalendarItemClickHandler } from "./utils/itemEvents";
import { shouldRenderRowHeaders } from "./utils/rowHeaders";
import { CALENDAR_VIEWS } from "./utils/views";
import { useWeekDndInteractions } from "./utils/weekDndInteractions";
import {
	getWeekColumnHeight,
	ROW_HEADER_GUTTER_WIDTH,
	WEEK_HEADER_HEIGHT,
	WEEK_HOUR_HEIGHT,
} from "./utils/weekGeometry";
import { trapWeekEntryPointerEvent, WEEK_ENTRY_TIME_ACTIONS } from "./utils/weekInteractions";
import { getWeekEntryLayouts } from "./utils/weekLayout";

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
	height: getWeekColumnHeight(ownerState.workHours),
	borderRight: "1px solid",
	borderBottom: "1px solid",
	borderColor: theme.palette.divider,
	boxSizing: "border-box",
	backgroundColor: ownerState.isToday ? theme.palette.action.hover : theme.palette.background.paper,
	backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${WEEK_HOUR_HEIGHT - 1}px, ${theme.palette.divider} ${WEEK_HOUR_HEIGHT - 1}px, ${theme.palette.divider} ${WEEK_HOUR_HEIGHT}px)`,
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
})(({ theme }) => ({
	height: WEEK_HOUR_HEIGHT,
	borderBottom: "1px solid",
	borderColor: theme.palette.divider,
	boxSizing: "border-box",
}));

function WeekRowHeaderGutter({ slotProps, workHours, RowHeader, rowHeaderSlotProps }) {
	const rowCount = workHours.endHour - workHours.startHour;
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
			{Array.from({ length: rowCount }, (_, rowIndex) => {
				const rowStart = dayjs()
					.hour(workHours.startHour + rowIndex)
					.minute(0)
					.second(0)
					.millisecond(0);
				const rowEnd = rowStart.add(1, "hour");
				const ownerState = {
					view: CALENDAR_VIEWS.WEEK,
					rowIndex,
					rowStart,
					rowEnd,
				};

				return (
					<CalendarWeekRowHeaderCell
						key={rowStart.format("HH:mm")}
						ownerState={ownerState}
						sx={weekRowHeaderCellSx}
						{...weekRowHeaderCellSlotRest}
					>
						<RowHeader
							view={CALENDAR_VIEWS.WEEK}
							rowIndex={rowIndex}
							rowStart={rowStart}
							rowEnd={rowEnd}
							ownerState={ownerState}
							{...rowHeaderSlotProps}
						/>
					</CalendarWeekRowHeaderCell>
				);
			})}
		</CalendarWeekRowHeaderGutterRoot>
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
	slots,
	slotProps = {},
	timeSlotMinutes,
	view = CALENDAR_VIEWS.WEEK,
	workHours,
	} = props;
	const columnCount = showWeekend ? 7 : 5;
	const Entry = slots.entry;
	const Header = slots.weekHeader;
	const Item = slots.item;
	const RowHeader = slots.rowHeader;
	const TimeSlotIndicator = slots.timeSlotIndicator;
	const rowHeaderSlotProps = slotProps.rowHeader || {};
	const { sx: weekEntrySx, ...weekEntrySlotRest } = slotProps.entry || {};
	const { onClick: itemSlotOnClick, ...itemSlotRest } = slotProps.item || {};
	const { sx: timeSlotIndicatorSx, ...timeSlotIndicatorSlotRest } =
		slotProps.timeSlotIndicator || {};
	const { sx: weekRootSx, ...weekRootSlotRest } = slotProps.weekRoot || {};
	const { sx: weekContentSx, ...weekContentSlotRest } = slotProps.weekContent || {};
	const { sx: weekGridSx, ...weekGridSlotRest } = slotProps.weekGrid || {};
	const { sx: weekHeaderSx, ...weekHeaderSlotRest } = slotProps.weekHeader || {};
	const { sx: weekHeaderLabelSx, ...weekHeaderLabelSlotRest } =
		slotProps.weekHeaderLabel || {};
	const { sx: weekColumnSx, ...weekColumnSlotRest } = slotProps.weekColumn || {};
	const { sx: weekEntryTimePreviewSx, ...weekEntryTimePreviewSlotRest } =
		slotProps.weekEntryTimePreview || {};
	const { sx: weekEntryTimePreviewLabelSx, ...weekEntryTimePreviewLabelSlotRest } =
		slotProps.weekEntryTimePreviewLabel || {};
	const { sx: weekTimeSlotLayerSx, ...weekTimeSlotLayerSlotRest } =
		slotProps.weekTimeSlotLayer || {};
	const { sx: weekDraggableEntrySx, ...weekDraggableEntrySlotRest } =
		slotProps.weekDraggableEntry || {};
	const { sx: weekResizeHandleSx, ...weekResizeHandleSlotRest } =
		slotProps.weekResizeHandle || {};
	const normalizedEntries = normalizeCalendarEntries(entries);
	const weekGridRef = useRef(null);
	const firstWeekRowStart = dayjs().hour(workHours.startHour).minute(0).second(0).millisecond(0);
	const showWeekRowHeaders = shouldRenderRowHeaders(showRowHeaders, {
		view: CALENDAR_VIEWS.WEEK,
		rowIndex: 0,
		rowStart: firstWeekRowStart,
		rowEnd: firstWeekRowStart.add(1, "hour"),
	});
	const weekGridMinWidth =
		columnCount * WEEK_DAY_MIN_WIDTH + (showWeekRowHeaders ? ROW_HEADER_GUTTER_WIDTH : 0);
	const weekViewOwnerState = {
		columnCount,
		showWeekRowHeaders,
		view,
		weekGridMinWidth,
		workHours,
	};
	const {
		activeEntryTimeId,
		activeEntryTimePreview,
		getWeekEntryTimePointerProps,
		handleWeekColumnClick,
		handleWeekColumnDragOver,
		handleWeekColumnDrop,
		handleWeekColumnPointerLeave,
		handleWeekColumnPointerMove,
		handleWeekItemClick,
		handleWeekItemPointerEnter,
		hoveredTimeSlot,
	} = useWeekDndInteractions({
		dates,
		gridRef: weekGridRef,
		onEntryTimeChange,
		onExternalItemDrop,
		onTimeSlotClick,
		timeSlotMinutes,
		view,
		workHours,
	});

	return (
		<CalendarWeekViewRoot
			data-calendar-week-view-grid='true'
			ownerState={weekViewOwnerState}
			sx={weekRootSx}
			{...weekRootSlotRest}
		>
			{showWeekRowHeaders && (
				<WeekRowHeaderGutter
					slotProps={slotProps}
					workHours={workHours}
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
							label={date.format("dd D.")}
							view={view}
							ownerState={{ ...weekViewOwnerState, date }}
							labelProps={{ sx: weekHeaderLabelSx, ...weekHeaderLabelSlotRest }}
							sx={weekHeaderSx}
							{...weekHeaderSlotRest}
						/>
					))}

					{dates.map((date) => {
						const dateKey = date.format("YYYY-MM-DD");
						const columnEntryTimePreview =
							activeEntryTimePreview?.dateKey === dateKey ? activeEntryTimePreview : null;
						const positionedEntries = getWeekEntryLayouts({
							entries: normalizedEntries,
							date,
							workHours,
							hourHeight: WEEK_HOUR_HEIGHT,
						});
						const entryOwnerState = {
							date,
							entries: positionedEntries,
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
								key={dateKey}
								data-calendar-week-column={dateKey}
								onDragOver={handleWeekColumnDragOver(date)}
								onDrop={handleWeekColumnDrop(date)}
								onPointerMove={handleWeekColumnPointerMove(date)}
								onPointerLeave={handleWeekColumnPointerLeave}
								onClick={handleWeekColumnClick(date)}
								ownerState={columnOwnerState}
								sx={weekColumnSx}
								{...weekColumnSlotRest}
							>
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
								{hoveredTimeSlot?.dateKey === dateKey && (
									<CalendarWeekTimeSlotLayer
										ownerState={{ ...columnOwnerState, timeSlot: hoveredTimeSlot.timeSlot }}
										sx={weekTimeSlotLayerSx}
										{...weekTimeSlotLayerSlotRest}
									>
										<TimeSlotIndicator
											date={date}
											view={view}
											timeSlot={hoveredTimeSlot.timeSlot}
											ownerState={{
												date,
												view,
												timeSlot: hoveredTimeSlot.timeSlot,
											}}
											sx={{ ...timeSlotIndicatorSx, pointerEvents: "none" }}
											{...timeSlotIndicatorSlotRest}
										/>
									</CalendarWeekTimeSlotLayer>
								)}
								<Entry
									date={date}
									entries={positionedEntries}
									view={view}
									ownerState={entryOwnerState}
									sx={{ position: "absolute", inset: 0, ...weekEntrySx }}
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

										return (
											<CalendarWeekDraggableEntry
												key={entry.id}
												data-calendar-week-entry={entry.id}
												ownerState={{
													date,
													entry,
													isActiveEntryTimeEntry,
													layout,
													onEntryTimeChange,
													view,
												}}
												{...getWeekEntryTimePointerProps({
													action: WEEK_ENTRY_TIME_ACTIONS.MOVE,
													date,
													disabled: !onEntryTimeChange,
													entry,
												})}
												onPointerEnter={handleWeekItemPointerEnter}
												onPointerMove={trapWeekEntryPointerEvent}
												onClick={handleWeekItemClick(itemClickHandler)}
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
													ownerState={{ date, item: entry, entry, view, layout }}
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
															{...getWeekEntryTimePointerProps({
																action: WEEK_ENTRY_TIME_ACTIONS.RESIZE_START,
																date,
																entry,
															})}
															onClick={trapWeekEntryPointerEvent}
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
															{...getWeekEntryTimePointerProps({
																action: WEEK_ENTRY_TIME_ACTIONS.RESIZE_END,
																date,
																entry,
															})}
															onClick={trapWeekEntryPointerEvent}
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
					})}
				</CalendarWeekViewGrid>
			</CalendarWeekViewContent>
		</CalendarWeekViewRoot>
	);
}
