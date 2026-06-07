import type { ComponentType, MouseEventHandler, ReactElement, ReactNode } from "react";
import type { Dayjs } from "dayjs";
import type { SxProps, Theme } from "@mui/material/styles";

export type CalendarView = "month" | "week";
export type CalendarDateInput = Dayjs | Date | string;
export type CalendarEntryTimeChangeAction = "move" | "resize-start" | "resize-end";

export interface CalendarEntryItem {
	id: string;
	title: string;
	start: CalendarDateInput;
	end?: CalendarDateInput;
	color?: string;
	category?: string;
	[key: string]: unknown;
}

export type NormalizedCalendarEntry<TEntry extends CalendarEntryItem = CalendarEntryItem> = Omit<
	TEntry,
	"start" | "end"
> & {
	start: Dayjs;
	end?: Dayjs;
};

export interface WorkHourPreset {
	id: string;
	label: string;
	startHour: number;
	endHour: number;
}

export interface WeekEntryLayout {
	top: number;
	height: number;
	width: string;
	left: string;
	laneIndex: number;
	laneCount: number;
}

export interface CalendarTimeSlot {
	start: Dayjs;
	end: Dayjs;
	index: number;
	top: number;
	height: number;
	minutes: number;
}

export interface RowHeaderOwnerState {
	view: CalendarView;
	rowIndex: number;
	rowStart: Dayjs;
	rowEnd: Dayjs;
	dates?: Dayjs[];
}

export interface MonthCellOwnerState<TEntry extends CalendarEntryItem = CalendarEntryItem> {
	date: Dayjs;
	entries: NormalizedCalendarEntry<TEntry>[];
	view: CalendarView;
	isToday: boolean;
	isCurrentMonth: boolean;
}

export interface MonthItemOwnerState<
	TEntry extends CalendarEntryItem = CalendarEntryItem,
> extends MonthCellOwnerState<TEntry> {
	item: NormalizedCalendarEntry<TEntry>;
	entry: NormalizedCalendarEntry<TEntry>;
}

export interface MonthWeekdayHeaderOwnerState {
	label: string;
	index: number;
	view: CalendarView;
	[key: string]: unknown;
}

export interface WeekHeaderOwnerState {
	date: Dayjs;
	view: CalendarView;
	[key: string]: unknown;
}

export interface WeekEntryOwnerState<TEntry extends CalendarEntryItem = CalendarEntryItem> {
	date: Dayjs;
	entries: Array<NormalizedCalendarEntry<TEntry> & { layout: WeekEntryLayout }>;
	view: CalendarView;
}

export interface WeekItemOwnerState<TEntry extends CalendarEntryItem = CalendarEntryItem> {
	date: Dayjs;
	item: NormalizedCalendarEntry<TEntry> & { layout: WeekEntryLayout };
	entry: NormalizedCalendarEntry<TEntry> & { layout: WeekEntryLayout };
	view: CalendarView;
	layout: WeekEntryLayout;
}

export interface TimeSlotIndicatorOwnerState {
	date: Dayjs;
	view: "week";
	timeSlot: CalendarTimeSlot;
}

export interface CalendarCellHeaderProps {
	date: Dayjs;
	isToday: boolean;
	isCurrentMonth: boolean;
	view: CalendarView;
	ownerState: MonthCellOwnerState;
	sx?: SxProps<Theme>;
	[key: string]: unknown;
}

export interface CalendarCellProps<TEntry extends CalendarEntryItem = CalendarEntryItem> {
	date: Dayjs;
	entries: NormalizedCalendarEntry<TEntry>[];
	view: CalendarView;
	isToday: boolean;
	isCurrentMonth: boolean;
	slots: Required<CalendarSlots>;
	slotProps?: CalendarSlotProps;
	onItemClick?: (item: NormalizedCalendarEntry<TEntry>) => void;
	ownerState?: MonthCellOwnerState<TEntry>;
	sx?: SxProps<Theme>;
	[key: string]: unknown;
}

export interface CalendarHeaderLabelProps {
	sx?: SxProps<Theme>;
	[key: string]: unknown;
}

export interface CalendarMonthWeekdayHeaderProps {
	label: string;
	index: number;
	view: CalendarView;
	ownerState: MonthWeekdayHeaderOwnerState;
	labelProps?: CalendarHeaderLabelProps;
	sx?: SxProps<Theme>;
	children?: ReactNode;
	[key: string]: unknown;
}

export interface CalendarWeekHeaderProps {
	date: Dayjs;
	label?: string;
	view: CalendarView;
	ownerState: WeekHeaderOwnerState;
	labelProps?: CalendarHeaderLabelProps;
	sx?: SxProps<Theme>;
	children?: ReactNode;
	[key: string]: unknown;
}

export interface CalendarEntryProps<TEntry extends CalendarEntryItem = CalendarEntryItem> {
	children?: ReactNode;
	date: Dayjs;
	entries: NormalizedCalendarEntry<TEntry>[];
	view: CalendarView;
	ownerState: MonthCellOwnerState<TEntry> | WeekEntryOwnerState<TEntry>;
	sx?: SxProps<Theme>;
	[key: string]: unknown;
}

export interface CalendarItemProps<TEntry extends CalendarEntryItem = CalendarEntryItem> {
	item: NormalizedCalendarEntry<TEntry>;
	entry?: NormalizedCalendarEntry<TEntry>;
	date?: Dayjs;
	view?: CalendarView;
	layout?: WeekEntryLayout;
	ownerState?: MonthItemOwnerState<TEntry> | WeekItemOwnerState<TEntry>;
	onClick?: MouseEventHandler;
	sx?: SxProps<Theme>;
	[key: string]: unknown;
}

export interface CalendarRowHeaderProps {
	view: CalendarView;
	rowIndex: number;
	rowStart: Dayjs;
	rowEnd: Dayjs;
	dates?: Dayjs[];
	ownerState: RowHeaderOwnerState;
	sx?: SxProps<Theme>;
	[key: string]: unknown;
}

export interface CalendarTimeSlotIndicatorProps {
	date: Dayjs;
	view: "week";
	timeSlot: CalendarTimeSlot;
	ownerState: TimeSlotIndicatorOwnerState;
	sx?: SxProps<Theme>;
	[key: string]: unknown;
}

export interface CalendarSlots {
	cell?: ComponentType<CalendarCellProps>;
	cellHeader?: ComponentType<CalendarCellHeaderProps>;
	entry?: ComponentType<CalendarEntryProps>;
	item?: ComponentType<CalendarItemProps>;
	monthWeekdayHeader?: ComponentType<CalendarMonthWeekdayHeaderProps>;
	rowHeader?: ComponentType<CalendarRowHeaderProps>;
	timeSlotIndicator?: ComponentType<CalendarTimeSlotIndicatorProps>;
	weekHeader?: ComponentType<CalendarWeekHeaderProps>;
}

export interface CalendarNativeSlotProps {
	sx?: SxProps<Theme>;
	[key: string]: unknown;
}

export interface CalendarSlotProps {
	cell?: Partial<CalendarCellProps>;
	cellHeader?: Partial<CalendarCellHeaderProps>;
	entry?: Partial<CalendarEntryProps>;
	item?: Partial<CalendarItemProps>;
	monthCorner?: CalendarNativeSlotProps;
	monthItemWrapper?: CalendarNativeSlotProps;
	monthRoot?: CalendarNativeSlotProps;
	monthRowHeaderGutter?: CalendarNativeSlotProps;
	monthWeekdayHeader?: Partial<CalendarMonthWeekdayHeaderProps>;
	monthWeekdayLabel?: CalendarNativeSlotProps;
	rowHeader?: Partial<CalendarRowHeaderProps>;
	timeSlotIndicator?: Partial<CalendarTimeSlotIndicatorProps>;
	weekColumn?: CalendarNativeSlotProps;
	weekContent?: CalendarNativeSlotProps;
	weekDraggableEntry?: CalendarNativeSlotProps;
	weekEntryTimePreview?: CalendarNativeSlotProps;
	weekEntryTimePreviewLabel?: CalendarNativeSlotProps;
	weekGrid?: CalendarNativeSlotProps;
	weekHeader?: Partial<CalendarWeekHeaderProps>;
	weekHeaderLabel?: CalendarNativeSlotProps;
	weekResizeHandle?: CalendarNativeSlotProps;
	weekRoot?: CalendarNativeSlotProps;
	weekRowHeaderCell?: CalendarNativeSlotProps;
	weekRowHeaderCorner?: CalendarNativeSlotProps;
	weekRowHeaderGutter?: CalendarNativeSlotProps;
	weekTimeSlotLayer?: CalendarNativeSlotProps;
}

export type CalendarThemeComponentName =
	| "CALENDAR_CalendarCell"
	| "CALENDAR_CalendarCellHeader"
	| "CALENDAR_CalendarEntry"
	| "CALENDAR_CalendarGrid"
	| "CALENDAR_CalendarItem"
	| "CALENDAR_CalendarMonthWeekdayHeader"
	| "CALENDAR_CalendarMonthView"
	| "CALENDAR_CalendarRoot"
	| "CALENDAR_CalendarRowHeader"
	| "CALENDAR_CalendarTimeSlotIndicator"
	| "CALENDAR_CalendarTopbar"
	| "CALENDAR_CalendarWeekHeader"
	| "CALENDAR_CalendarWeekView";

export interface TimeSlotClickPayload {
	start: Dayjs;
	end: Dayjs;
	date: Dayjs;
	view: "week";
	timeSlotMinutes: number;
}

export interface EntryTimeChangePayload<TEntry extends CalendarEntryItem = CalendarEntryItem> {
	id: string;
	start: Dayjs;
	end: Dayjs;
	entry: NormalizedCalendarEntry<TEntry>;
	action: CalendarEntryTimeChangeAction;
}

export interface ExternalItemDropPayload<TSource = unknown> {
	source: TSource;
	start: Dayjs;
	end: Dayjs;
	date: Dayjs;
	view: "week";
	timeSlotMinutes: number;
	timeSlot: CalendarTimeSlot;
}

export interface CalendarExternalDragSourceOptions<TSource = unknown> {
	id: string;
	source: TSource;
}

export interface CalendarExternalDragSourceResult {
	attributes: Record<string, unknown>;
	listeners?: Record<string, unknown>;
	setNodeRef: (element: HTMLElement | null) => void;
	transform: { x: number; y: number; scaleX?: number; scaleY?: number } | null;
	isDragging: boolean;
}

export function useCalendarExternalDragSource<TSource = unknown>(
	options: CalendarExternalDragSourceOptions<TSource>,
): CalendarExternalDragSourceResult;

export interface ShowRowHeadersContext extends RowHeaderOwnerState {}

export interface CalendarRootProps<TEntry extends CalendarEntryItem = CalendarEntryItem> {
	entries?: TEntry[];
	view?: CalendarView;
	defaultView?: CalendarView;
	onViewChange?: (nextView: CalendarView) => void;
	date?: CalendarDateInput;
	defaultDate?: CalendarDateInput;
	onDateChange?: (nextDate: Dayjs) => void;
	showWeekend?: boolean;
	defaultShowWeekend?: boolean;
	onShowWeekendChange?: (nextValue: boolean) => void;
	workHoursPreset?: string;
	defaultWorkHourPreset?: string;
	onWorkHoursPresetChange?: (nextPresetId: string) => void;
	timeSlotMinutes?: number | string;
	defaultTimeSlotMinutes?: number | string;
	onTimeSlotMinutesChange?: (nextMinutes: number) => void;
	onTimeSlotClick?: (payload: TimeSlotClickPayload) => void;
	onItemClick?: (item: NormalizedCalendarEntry<TEntry>) => void;
	onEntryTimeChange?: (payload: EntryTimeChangePayload<TEntry>) => void;
	onExternalItemDrop?: (payload: ExternalItemDropPayload) => void;
	showRowHeaders?: boolean | ((context: ShowRowHeadersContext) => boolean);
	slots?: CalendarSlots;
	slotProps?: CalendarSlotProps;
	children?: ReactNode;
	gridSx?: SxProps<Theme>;
	sx?: SxProps<Theme>;
	cellSx?: SxProps<Theme>;
	[key: string]: unknown;
}

export interface CalendarContextValue {
	view: CalendarView;
	date: Dayjs;
	title: string;
	showWeekend: boolean;
	workHoursPreset: string;
	workHours: WorkHourPreset;
	timeSlotMinutes: number;
	visibleDates: Dayjs[];
	slots: Required<CalendarSlots>;
	slotProps: CalendarSlotProps;
	setView: (nextView: CalendarView) => void;
	setDate: (nextDate: CalendarDateInput) => void;
	setShowWeekend: (nextValue: boolean) => void;
	setWorkHoursPreset: (nextPresetId: string) => void;
	setTimeSlotMinutes: (nextMinutes: number | string) => void;
	navigate: (direction: number) => void;
	today: () => void;
}

export const CALENDAR_VIEWS: {
	WEEK: "week";
	MONTH: "month";
};

export const TIME_SLOT_MINUTE_OPTIONS: number[];
export const WORK_HOUR_PRESETS: Record<string, WorkHourPreset>;
export const WORK_HOUR_PRESET_OPTIONS: WorkHourPreset[];

export function CalendarRoot<TEntry extends CalendarEntryItem = CalendarEntryItem>(
	props: CalendarRootProps<TEntry>,
): ReactElement;
export function CalendarGrid(props: Record<string, unknown>): ReactElement;
export function CalendarCell(props: CalendarCellProps): ReactElement;
export function CalendarCellHeader(props: CalendarCellHeaderProps): ReactElement;
export function CalendarEntry(props: CalendarEntryProps): ReactElement;
export function CalendarItem(props: CalendarItemProps): ReactElement;
export function CalendarMonthWeekdayHeader(props: CalendarMonthWeekdayHeaderProps): ReactElement;
export function CalendarRowHeader(props: CalendarRowHeaderProps): ReactElement;
export function CalendarTimeSlotIndicator(props: CalendarTimeSlotIndicatorProps): ReactElement;
export function CalendarWeekHeader(props: CalendarWeekHeaderProps): ReactElement;
export function CalendarTopbar(props: {
	children?: ReactNode;
	sx?: SxProps<Theme>;
	[key: string]: unknown;
}): ReactElement;
export function useCalendar(): CalendarContextValue;
