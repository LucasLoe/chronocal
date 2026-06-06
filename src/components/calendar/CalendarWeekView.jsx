import { Box, Stack, Typography } from "@mui/material";
import { useRef } from "react";
import dayjs from "../../lib/dayjs";
import { isSameDay } from "./utils/dateRange";
import { normalizeCalendarEntries } from "./utils/entries";
import { createCalendarItemClickHandler } from "./utils/itemEvents";
import { shouldRenderRowHeaders } from "./utils/rowHeaders";
import {
	createRowHeaderOwnerState,
	createWeekEntryOwnerState,
	createWeekItemOwnerState,
	createWeekTimeSlotOwnerState,
	getSlotProps,
	splitSlotSx,
} from "./utils/slots";
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
const STICKY_COLUMN_HEADER_Z_INDEX = 5;
const STICKY_CORNER_Z_INDEX = 6;

function RowHeaderGutter({ children, sx, ...rest }) {
	return (
		<Stack
			sx={{
				flex: `0 0 ${ROW_HEADER_GUTTER_WIDTH}px`,
				width: ROW_HEADER_GUTTER_WIDTH,
				borderRight: "1px solid",
				borderColor: "divider",
				boxSizing: "border-box",
				...sx,
			}}
			{...rest}
		>
			{children}
		</Stack>
	);
}

function WeekRowHeaderGutter({ workHours, RowHeader, rowHeaderSlotProps }) {
	const rowCount = workHours.endHour - workHours.startHour;

	return (
		<RowHeaderGutter
			data-calendar-week-row-header-gutter='true'
			sx={{
				position: "sticky",
				left: 0,
				zIndex: STICKY_ROW_HEADER_Z_INDEX,
				backgroundColor: "background.paper",
			}}
		>
			<Box
				sx={{
					height: WEEK_HEADER_HEIGHT,
					position: "sticky",
					top: 0,
					zIndex: STICKY_CORNER_Z_INDEX,
					borderBottom: "1px solid",
					borderColor: "divider",
					backgroundColor: "background.default",
					boxSizing: "border-box",
				}}
			/>
			{Array.from({ length: rowCount }, (_, rowIndex) => {
				const rowStart = dayjs()
					.hour(workHours.startHour + rowIndex)
					.minute(0)
					.second(0)
					.millisecond(0);
				const rowEnd = rowStart.add(1, "hour");
				const ownerState = createRowHeaderOwnerState({
					view: CALENDAR_VIEWS.WEEK,
					rowIndex,
					rowStart,
					rowEnd,
				});

				return (
					<Box
						key={rowStart.format("HH:mm")}
						sx={{
							height: WEEK_HOUR_HEIGHT,
							borderBottom: "1px solid",
							borderColor: "divider",
							boxSizing: "border-box",
						}}
					>
						<RowHeader
							view={CALENDAR_VIEWS.WEEK}
							rowIndex={rowIndex}
							rowStart={rowStart}
							rowEnd={rowEnd}
							ownerState={ownerState}
							{...rowHeaderSlotProps}
						/>
					</Box>
				);
			})}
		</RowHeaderGutter>
	);
}

function WeekDroppableColumn({ children, sx, ...rest }) {
	return (
		<Box sx={sx} {...rest}>
			{children}
		</Box>
	);
}

function WeekDraggableEntry({ children, sx, ...rest }) {
	return (
		<Box sx={sx} {...rest}>
			{children}
		</Box>
	);
}

function WeekResizeHandle({ sx, ...rest }) {
	return <Box sx={{ touchAction: "none", ...sx }} onClick={trapWeekEntryPointerEvent} {...rest} />;
}

export function CalendarWeekView({
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
}) {
	const columnCount = showWeekend ? 7 : 5;
	const Entry = slots.entry;
	const Item = slots.item;
	const RowHeader = slots.rowHeader;
	const TimeSlotIndicator = slots.timeSlotIndicator;
	const rowHeaderSlotProps = getSlotProps(slotProps, "rowHeader");
	const { sx: weekEntrySx, rest: weekEntrySlotRest } = splitSlotSx(getSlotProps(slotProps, "entry"));
	const { onClick: itemSlotOnClick, ...itemSlotRest } = getSlotProps(slotProps, "item");
	const { sx: timeSlotIndicatorSx, rest: timeSlotIndicatorSlotRest } = splitSlotSx(
		getSlotProps(slotProps, "timeSlotIndicator"),
	);
	const normalizedEntries = normalizeCalendarEntries(entries);
	const weekGridRef = useRef(null);
	const firstWeekRowStart = dayjs().hour(workHours.startHour).minute(0).second(0).millisecond(0);
	const showWeekRowHeaders = shouldRenderRowHeaders(
		showRowHeaders,
		createRowHeaderOwnerState({
			view: CALENDAR_VIEWS.WEEK,
			rowIndex: 0,
			rowStart: firstWeekRowStart,
			rowEnd: firstWeekRowStart.add(1, "hour"),
		}),
	);
	const weekGridMinWidth =
		columnCount * WEEK_DAY_MIN_WIDTH + (showWeekRowHeaders ? ROW_HEADER_GUTTER_WIDTH : 0);
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
		<Box
			data-calendar-week-view-grid='true'
			sx={{
				display: "flex",
				width: "100%",
				minWidth: weekGridMinWidth,
				borderTop: "1px solid",
				borderLeft: "1px solid",
				borderColor: "divider",
			}}
		>
			{showWeekRowHeaders && (
				<WeekRowHeaderGutter
					workHours={workHours}
					RowHeader={RowHeader}
					rowHeaderSlotProps={rowHeaderSlotProps}
				/>
			)}
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Box
					ref={weekGridRef}
					data-calendar-week-grid='true'
					sx={{ display: "grid", gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
				>
					{dates.map((date) => (
						<Box
							key={`${date.format("YYYY-MM-DD")}-heading`}
							data-calendar-week-header={date.format("YYYY-MM-DD")}
							sx={{
								position: "sticky",
								top: 0,
								zIndex: STICKY_COLUMN_HEADER_Z_INDEX,
								px: 1.25,
								height: WEEK_HEADER_HEIGHT,
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
								{date.format("dd D.")}
							</Typography>
						</Box>
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
						const entryOwnerState = createWeekEntryOwnerState({
							date,
							entries: positionedEntries,
							view,
						});

						return (
							<WeekDroppableColumn
								key={dateKey}
								data-calendar-week-column={dateKey}
								onDragOver={handleWeekColumnDragOver(date)}
								onDrop={handleWeekColumnDrop(date)}
								onPointerMove={handleWeekColumnPointerMove(date)}
								onPointerLeave={handleWeekColumnPointerLeave}
								onClick={handleWeekColumnClick(date)}
								sx={{
									position: "relative",
									cursor: onTimeSlotClick ? "pointer" : "default",
									height: getWeekColumnHeight(workHours),
									borderRight: "1px solid",
									borderBottom: "1px solid",
									borderColor: "divider",
									boxSizing: "border-box",
									backgroundColor: isSameDay(date, dayjs()) ? "action.hover" : "background.paper",
									backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${WEEK_HOUR_HEIGHT - 1}px, rgba(0,0,0,0.08) ${WEEK_HOUR_HEIGHT - 1}px, rgba(0,0,0,0.08) ${WEEK_HOUR_HEIGHT}px)`,
								}}
							>
								{columnEntryTimePreview && (
									<Box
										data-calendar-week-entry-time-preview={columnEntryTimePreview.id}
										sx={{
											position: "absolute",
											top: columnEntryTimePreview.layout.top,
											left: 2,
											right: 2,
											height: columnEntryTimePreview.layout.height,
											zIndex: 4,
											pointerEvents: "none",
											border: "2px dashed",
											borderColor: "primary.main",
											borderRadius: 0.5,
											backgroundColor: "primary.main",
											opacity: 0.18,
											boxSizing: "border-box",
										}}
									>
										<Box
											data-calendar-week-entry-time-preview-label={columnEntryTimePreview.id}
											sx={{
												position: "absolute",
												top:
													columnEntryTimePreview.action === WEEK_ENTRY_TIME_ACTIONS.RESIZE_END
														? "auto"
														: -24,
												bottom:
													columnEntryTimePreview.action === WEEK_ENTRY_TIME_ACTIONS.RESIZE_END
														? -24
														: "auto",
												left: 4,
												px: 0.75,
												py: 0.25,
												borderRadius: 1,
												fontSize: 11,
												fontWeight: 800,
												lineHeight: 1.4,
												color: "primary.contrastText",
												backgroundColor: "primary.main",
												boxShadow: 2,
												whiteSpace: "nowrap",
											}}
										>
											{columnEntryTimePreview.label}
										</Box>
									</Box>
								)}
								{hoveredTimeSlot?.dateKey === dateKey && (
									<Box sx={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
										<TimeSlotIndicator
											date={date}
											view={view}
											timeSlot={hoveredTimeSlot.timeSlot}
											ownerState={createWeekTimeSlotOwnerState({
												date,
												view,
												timeSlot: hoveredTimeSlot.timeSlot,
											})}
											sx={{ ...timeSlotIndicatorSx, pointerEvents: "none" }}
											{...timeSlotIndicatorSlotRest}
										/>
									</Box>
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
											<WeekDraggableEntry
												key={entry.id}
												data-calendar-week-entry={entry.id}
												{...getWeekEntryTimePointerProps({
													action: WEEK_ENTRY_TIME_ACTIONS.MOVE,
													date,
													disabled: !onEntryTimeChange,
													entry,
												})}
												onPointerEnter={handleWeekItemPointerEnter}
												onPointerMove={trapWeekEntryPointerEvent}
												onClick={handleWeekItemClick(itemClickHandler)}
												sx={{
													position: "absolute",
													top: layout.top,
													left: layout.left,
													width: layout.width,
													height: layout.height,
													p: 0.25,
													zIndex: 2,
													cursor: onEntryTimeChange ? "grab" : "default",
													opacity: isActiveEntryTimeEntry ? 0.45 : 1,
													pointerEvents: isActiveEntryTimeEntry ? "none" : "auto",
													touchAction: "none",
													"& > *": {
														width: "100%",
													},
												}}
											>
												<Item
													item={entry}
													entry={entry}
													date={date}
													view={view}
													layout={layout}
													onClick={handleWeekItemClick(itemClickHandler)}
													ownerState={createWeekItemOwnerState({ date, entry, view, layout })}
													{...itemSlotRest}
												/>
											{onEntryTimeChange && (
												<>
													<WeekResizeHandle
														data-calendar-week-resize-handle={`${entry.id}-start`}
														{...getWeekEntryTimePointerProps({
															action: WEEK_ENTRY_TIME_ACTIONS.RESIZE_START,
															date,
															entry,
														})}
														sx={{
															position: "absolute",
															top: 2,
															left: 8,
															right: 8,
															height: 6,
															cursor: "ns-resize",
															zIndex: 3,
														}}
													/>
													<WeekResizeHandle
														data-calendar-week-resize-handle={`${entry.id}-end`}
														{...getWeekEntryTimePointerProps({
															action: WEEK_ENTRY_TIME_ACTIONS.RESIZE_END,
															date,
															entry,
														})}
														sx={{
															position: "absolute",
															bottom: 2,
															left: 8,
															right: 8,
															height: 6,
															cursor: "ns-resize",
															zIndex: 3,
														}}
													/>
												</>
											)}
											</WeekDraggableEntry>
										);
									})}
								</Entry>
							</WeekDroppableColumn>
						);
					})}
				</Box>
			</Box>
		</Box>
	);
}
