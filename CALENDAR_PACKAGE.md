# Chronocal Calendar Package Guide

AI-oriented implementation reference for the reusable calendar component package in this repository.

## Quick Facts

- Package area: `src/components/calendar/`
- Demo area: `src/demo/` and `src/App.jsx`
- Date adapter: `src/lib/dayjs.js`
- UI framework: React with MUI components and `sx` styling
- Supported views: `month`, `week`
- Locale defaults: German locale, `Europe/Berlin` timezone, ISO week support
- Customization model: MUI-style `slots` and `slotProps`
- Package vocabulary: `CALENDAR_LANGUAGE.md`
- Week interaction model: time slots with 5, 15, 30, or 60 minute snapping
- Test runner: Vitest with jsdom and Testing Library

## Public Exports

Import package primitives from `src/components/calendar`.

```js
export { CalendarCell } from "./CalendarCell";
export { CalendarCellHeader } from "./CalendarCellHeader";
export { useCalendar } from "./useCalendar";
export { CalendarEntry } from "./CalendarEntry";
export { CalendarGrid } from "./CalendarGrid";
export { CalendarItem } from "./CalendarItem";
export { CalendarRoot } from "./CalendarRoot";
export { CalendarRowHeader } from "./CalendarRowHeader";
export { CalendarTopbar } from "./CalendarTopbar";
export { CalendarTimeSlotIndicator } from "./CalendarTimeSlotIndicator";
export { useCalendarExternalDragSource } from "./utils/calendarDnd";
export { TIME_SLOT_MINUTE_OPTIONS } from "./utils/timeSlots";
export { WORK_HOUR_PRESETS, WORK_HOUR_PRESET_OPTIONS } from "./utils/dateRange";
export { CALENDAR_VIEWS } from "./utils/views";
```

## Component Tree

```txt
CalendarRoot
├─ CalendarContext.Provider
├─ children
│  └─ usually CalendarTopbar with controls using useCalendar()
└─ CalendarGrid
   ├─ CalendarMonthView
   │  ├─ optional Row Header Gutter
   │  └─ CalendarCell
   │     ├─ CalendarCellHeader
   │     └─ CalendarEntry
   │        └─ CalendarItem
   └─ CalendarWeekView
      ├─ Row Header Gutter
      └─ day columns
         └─ CalendarEntry
            └─ positioned CalendarItem components
```

## Module Map

Core behaviour is intentionally concentrated behind a few package-internal Modules:

- `utils/entries.js`: normalizes entry dates and resolves missing end times
- `utils/weekLayout.js`: filters, clips, lanes, and positions week entries
- `utils/weekGeometry.js`: owns week pixel/minute constants, column height, visible ranges, and pointer geometry
- `utils/timeSlots.js`: validates week time-slot granularity and maps pointer positions to snapped time ranges
- `utils/weekInteractions.js`: owns week time-slot hover/click payload behaviour and entry pointer trapping
- `utils/weekDndInteractions.js`: owns Week View pointer drag lifecycle, Entry Time Preview state, native external drop payloads, and post-drag click suppression
- `utils/calendarDnd.js`: owns native browser drag adapters, source registry, drag source data, and external drag source hook
- `utils/itemEvents.js`: owns item click callback ordering and propagation handling
- `utils/views.js`: owns view constants, visible dates, titles, and navigation intervals
- `useCalendarState.js`: owns controlled/uncontrolled state and derived calendar state
- `utils/rowHeaders.js`: owns Row Header visibility resolution for view renderers

`CalendarGrid` remains the render switch between month and week views. View data behaviour belongs in `utils/views.js`; view-specific rendering lives in `CalendarMonthView.jsx` and `CalendarWeekView.jsx` so inactive view work is not constructed.

## Data Model

Calendar entries are plain objects. The active view renderer normalizes incoming entries before rendering so internal calendar Modules receive Day.js values for date work.

```js
{
  id: "entry-1",
  title: "Deep Work: Calendar Refactor",
  start: "2026-05-18T08:57:00",
  end: "2026-05-18T12:46:00",
  category: "Fokus"
}
```

Required fields:

- `id`: stable unique key used for React rendering
- `title`: display label used by the default `CalendarItem`
- `start`: Day.js value, ISO string, or `Date`

Optional fields:

- `end`: Day.js value, ISO string, or `Date`; week view defaults missing end values to one hour after `start`
- `color`: optional consumer-provided value used by the default `CalendarItem` background
- `category`: not used by package primitives, used by the demo time-tracking filter
- Any extra consumer-specific fields are preserved and passed to slots

Default-renderer behavior:

- Consumers may pass Day.js values, ISO strings, or native `Date` objects for `start` and `end`.
- The default `CalendarItem` receives normalized entries and calls `calendarItem.start.format("HH:mm")`.
- Extra consumer-specific fields are preserved during normalization and passed to slots.

## CalendarRoot

`CalendarRoot` is the main package component. It owns or receives calendar state, provides context to descendants, and renders `CalendarGrid` after its children.

Location: `src/components/calendar/CalendarRoot.jsx`

State transition logic lives in `src/components/calendar/useCalendarState.js`. `CalendarRoot` uses that module, resolves default slots, provides context, and renders `CalendarGrid`.

### Props

```js
<CalendarRoot
	entries={entries}
	view={view}
	date={date}
	showWeekend={showWeekend}
	workHoursPreset={workHoursPreset}
	onViewChange={setView}
	onDateChange={setDate}
	onShowWeekendChange={setShowWeekend}
	onWorkHoursPresetChange={setWorkHoursPreset}
	timeSlotMinutes={timeSlotMinutes}
	onTimeSlotMinutesChange={setTimeSlotMinutes}
	onTimeSlotClick={({ start, end }) => console.log({ start, end })}
	onItemClick={(item) => console.log(item)}
	onEntryTimeChange={({ id, start, end, action }) => console.log({ id, start, end, action })}
	showRowHeaders={({ view }) => view === CALENDAR_VIEWS.WEEK}
	defaultView={CALENDAR_VIEWS.MONTH}
	defaultDate={dayjs()}
	defaultShowWeekend={true}
	defaultWorkHourPreset={WORK_HOUR_PRESETS.WORK_EXTENDED.id}
	defaultTimeSlotMinutes={15}
	slots={{ item: CustomItem }}
	slotProps={{ item: { sx: { borderRadius: 2 } } }}
	gridSx={{}}
	sx={{}}
>
	<CalendarTopbar>{controls}</CalendarTopbar>
</CalendarRoot>
```

State props support controlled and uncontrolled usage:

- `view` / `defaultView` / `onViewChange`
- `date` / `defaultDate` / `onDateChange`
- `showWeekend` / `defaultShowWeekend` / `onShowWeekendChange`
- `workHoursPreset` / `defaultWorkHourPreset` / `onWorkHoursPresetChange`
- `timeSlotMinutes` / `defaultTimeSlotMinutes` / `onTimeSlotMinutesChange`

Other props:

- `entries`: calendar entries array
- `slots`: component overrides for `cellHeader`, `entry`, `item`, `rowHeader`, and `timeSlotIndicator`
- `slotProps`: props forwarded to slotted components
- `children`: rendered above the grid inside the calendar context, usually controls
- `showRowHeaders`: optional boolean or function receiving row context; defaults to showing Row Headers in week view only
- `onTimeSlotClick`: week-only callback fired with a snapped `{ start, end, date, view, timeSlotMinutes }` payload
- `onItemClick`: callback fired with the clicked normalized calendar entry
- `onEntryTimeChange`: week-only callback fired with a proposed `{ id, start, end, entry, action }` payload after entry move or resize
- `onExternalItemDrop`: week-only callback fired when an External Drag Source is dropped onto a week day column with a normalized `{ source, start, end, date, view, timeSlotMinutes, timeSlot }` payload
- `gridSx`: `sx` forwarded to `CalendarGrid`
- `sx`: `sx` applied to the root MUI `Box`
- Remaining props are forwarded to `CalendarGrid`

Root layout behavior:

- Displays as a flex column
- Fills the available parent height
- Uses `overflow: hidden`
- Lets `CalendarGrid` own internal scrolling

## useCalendar

`useCalendar()` reads calendar context. It must be called by a descendant of `CalendarRoot`.

Location: `src/components/calendar/useCalendar.js`

Returned state:

```js
const calendar = useCalendar();

calendar.view;
calendar.date;
calendar.title;
calendar.showWeekend;
calendar.workHoursPreset;
calendar.workHours;
calendar.timeSlotMinutes;
calendar.visibleDates;
calendar.slots;
calendar.slotProps;
```

Returned actions:

```js
calendar.setView(nextView);
calendar.setDate(nextDate);
calendar.setShowWeekend(nextBoolean);
calendar.setWorkHoursPreset(nextPresetId);
calendar.setTimeSlotMinutes(nextMinutes);
calendar.navigate(-1);
calendar.navigate(1);
calendar.today();
```

`navigate(direction)` advances by month in month view and by week in week view.

## CalendarTopbar

`CalendarTopbar` is a layout primitive for controls. It does not own calendar behavior.

Location: `src/components/calendar/CalendarTopbar.jsx`

Props:

- `children`: rendered inside a horizontal MUI `Stack`
- `sx`: applied to the outer `Box`
- `stackSx`: applied to the inner `Stack`
- Remaining props are forwarded to the outer `Box`

Default behavior:

- Horizontal, non-wrapping controls
- `overflowX: auto`
- `flexShrink: 0`
- `mb: 1.5`

## CalendarGrid

`CalendarGrid` owns the scroll container and renders either `CalendarMonthView` or `CalendarWeekView`. Most consumers should use it through `CalendarRoot` instead of directly.

Location: `src/components/calendar/CalendarGrid.jsx`

Props normally supplied by `CalendarRoot`:

- `view`
- `dates`
- `anchorDate`
- `entries`
- `showWeekend`
- `workHours`
- `showRowHeaders`
- `slots`
- `slotProps`

Additional props:

- `cellSx`: applied to month `CalendarCell` instances
- `sx`: applied to the scroll container
- Remaining props are forwarded to the scroll container

Scroll behavior:

- The grid container uses `overflow: auto`, `flex: 1`, `minHeight: 0`, and `height: 0`.
- Parent containers must provide a real bounded height.
- View-specific rendering lives in `src/components/calendar/CalendarMonthView.jsx` and `src/components/calendar/CalendarWeekView.jsx`.

## Month View

Month view behavior:

- Uses ISO weeks, so weeks start on Monday.
- Renders a 42-day grid based on the month anchor date.
- Includes overflow days from previous and next months.
- Filters out Saturday and Sunday cells when `showWeekend` is false.
- Displays weekday labels from `getWeekdayLabels()`.
- Can render an optional Row Header Gutter through the `rowHeader` slot and `showRowHeaders`.
- Groups entries by same calendar day using `getEntriesForDate()`.

Month view cell state:

- `isToday`: true for the current local day
- `isCurrentMonth`: true when the cell belongs to the anchor month
- `ownerState`: `{ date, entries, view, isToday, isCurrentMonth }`

## Week View

Week view behavior:

- Uses ISO weeks, so weeks start on Monday.
- Displays five or seven day columns depending on `showWeekend`.
- Displays a left Row Header Gutter by default. The default week Row Header renders hour markers based on the selected work-hour preset.
- Filters entries that overlap the visible day/work-hour range.
- Clips entries to the visible range.
- Positions entries by start time and duration.
- Places overlapping entries in side-by-side lanes.
- Calculates week entry layout in `src/components/calendar/utils/weekLayout.js` before rendering.
- Tracks hovered time slots by snapping pointer position to the configured `timeSlotMinutes`.
- Fires `onTimeSlotClick` with snapped `start` and `end` Day.js values when a week column is clicked.
- Supports entry body drag with `action: "move"`, preserving duration and allowing day changes.
- Supports top resize with `action: "resize-start"` and bottom resize with `action: "resize-end"`.
- Supports External Drag Sources created with `useCalendarExternalDragSource()` and dropped onto week day columns.
- Shows an internal ghost preview and time label during entry move/resize. The preview is package-owned because it depends on week geometry, Time Slot snapping, and the active interaction.
- Fires `onEntryTimeChange` on pointer release; the package does not mutate entries internally.

Week layout constants in `src/components/calendar/utils/weekGeometry.js`:

- `WEEK_HOUR_HEIGHT = 52`
- `WEEK_HEADER_HEIGHT = 42`
- `ROW_HEADER_GUTTER_WIDTH = 58`

Week item slot extras:

- `layout.top`: absolute top position in pixels
- `layout.height`: rendered height in pixels
- `layout.width`: CSS width value for the lane
- `layout.left`: CSS left value for the lane
- `layout.laneIndex`: zero-based lane index
- `layout.laneCount`: total concurrent lane count

## Time Slots

Time Slots are week-only interaction primitives used to snap hover and click behaviour to a fixed minute interval. They are groundwork for future drag, drop, and resize interactions; month view does not render or manage time slots.

Location: `src/components/calendar/utils/timeSlots.js`

Constants:

```js
export const TIME_SLOT_MINUTE_OPTIONS = [5, 15, 30, 60];
export const DEFAULT_TIME_SLOT_MINUTES = 15;
```

Root state:

- `timeSlotMinutes`: controlled active week slot size
- `defaultTimeSlotMinutes`: uncontrolled initial slot size, defaulting to `15`
- `onTimeSlotMinutesChange`: receives the normalized next slot size

Unsupported values are normalized to the nearest supported option.

Pointer geometry and click payload construction are owned by `src/components/calendar/utils/weekInteractions.js`, so `CalendarGrid` does not duplicate Time Slot event rules.

Entry time-change payload:

```js
onEntryTimeChange({
	id, // entry id
	start, // Day.js proposed start
	end, // Day.js proposed end
	entry, // normalized entry
	action, // "move", "resize-start", or "resize-end"
});
```

Consumers own persistence and data updates. The demo uses `updateCalendarSampleEntryTime(entries, { id, start, end })` from `src/demo/calendarSampleData.js` as a mock Adapter for updating local sample data.

External item drop payload:

```js
onExternalItemDrop({
	source, // caller-owned value supplied to useCalendarExternalDragSource()
	start, // Day.js normalized start, currently one hour by default
	end, // Day.js normalized end
	date, // Day.js week column date
	view, // "week"
	timeSlotMinutes,
	timeSlot,
});
```

The package owns native browser drag details and emits `source` instead of exposing drag event objects.

During an active entry time interaction, the package renders an internal ghost preview using the same proposed range that will be sent to `onEntryTimeChange`. Move previews show `HH:mm-HH:mm`; top resize previews show the proposed start time; bottom resize previews show the proposed end time. These preview visuals are not currently exposed as slots.

Click callback payload:

```js
onTimeSlotClick({
	start, // Day.js snapped slot start
	end, // Day.js snapped slot end
	date, // Day.js week column date
	view, // "week"
	timeSlotMinutes,
});
```

The default week hover indicator is `CalendarTimeSlotIndicator`. It is visual-only and receives:

```js
function CustomTimeSlotIndicator({ date, view, timeSlot, ownerState, sx, ...props }) {
	// Return a React element.
}
```

`timeSlot` contains:

```js
{
	(start, end, index, top, height, minutes);
}
```

## Slots And Slot Props

Default slots are resolved in `CalendarRoot`:

```js
const resolvedSlots = {
	cellHeader: CalendarCellHeader,
	entry: CalendarEntry,
	item: CalendarItem,
	rowHeader: CalendarRowHeader,
	timeSlotIndicator: CalendarTimeSlotIndicator,
	...slots,
};
```

Supported slots:

- `cellHeader`: replaces `CalendarCellHeader`
- `entry`: replaces `CalendarEntry`
- `item`: replaces `CalendarItem`
- `rowHeader`: replaces `CalendarRowHeader` in Row Header Gutters
- `timeSlotIndicator`: replaces `CalendarTimeSlotIndicator` in week view

Native structural slot props:

- Month keys: `monthRoot`, `monthCorner`, `monthWeekdayHeader`, `monthWeekdayLabel`, `monthRowHeaderGutter`, `monthItemWrapper`
- Week keys: `weekRoot`, `weekContent`, `weekGrid`, `weekHeader`, `weekHeaderLabel`, `weekColumn`, `weekEntryTimePreview`, `weekEntryTimePreviewLabel`, `weekTimeSlotLayer`, `weekDraggableEntry`, `weekResizeHandle`, `weekRowHeaderGutter`, `weekRowHeaderCorner`, `weekRowHeaderCell`
- These keys accept at least `sx` and are forwarded to the package-owned native MUI element for that slot.

Theme component names:

- `CALENDAR_CalendarRoot`
- `CALENDAR_CalendarGrid`
- `CALENDAR_CalendarTopbar`
- `CALENDAR_CalendarMonthView`
- `CALENDAR_CalendarWeekView`
- `CALENDAR_CalendarCell`
- `CALENDAR_CalendarCellHeader`
- `CALENDAR_CalendarEntry`
- `CALENDAR_CalendarItem`
- `CALENDAR_CalendarRowHeader`
- `CALENDAR_CalendarTimeSlotIndicator`

Package-owned colors should come from MUI theme tokens. Demo data may still provide consumer `entry.color` values.

Slot prop forwarding:

- `slotProps.cellHeader` is passed to `cellHeader` in month cells.
- `slotProps.entry` is passed to `entry` in month cells and week day columns.
- `slotProps.item` is passed to every rendered item in month and week views.
- `slotProps.rowHeader` is passed to rendered Row Headers.
- `slotProps.timeSlotIndicator` is passed to the rendered week hover indicator.

Common slot props received by custom item components:

```js
function CustomItem({ item, entry, date, view, layout, ownerState, sx, ...props }) {
	// Return a React element.
}
```

Month item `ownerState` contains:

```js
{
	(date, entries, view, isToday, isCurrentMonth, item, entry);
}
```

Week item `ownerState` contains:

```js
{
  date,
  item: entry,
  entry,
  view,
  layout
}
```

Week time slot indicator `ownerState` contains:

```js
{
	(date, view, timeSlot);
}
```

Row Header `ownerState` contains:

```js
{
	(view, rowIndex, rowStart, rowEnd, dates); // month rows only
}
```

Slot-facing `ownerState` is built where the slot is rendered so the call site stays easy to audit.

Internal provider note:

- `CalendarRoot` uses `CalendarContext.Provider` directly.
- There is intentionally no separate `CalendarProvider` module; the former wrapper was a pass-through and failed the deletion test.
- `CalendarEntry` and `CalendarTopbar` remain exported package primitives because deleting them would push layout knowledge into callers.

## CalendarCell

`CalendarCell` renders one day cell in month view.

Location: `src/components/calendar/CalendarCell.jsx`

Props:

- `date`
- `entries`
- `view`
- `isToday`
- `isCurrentMonth`
- `slots`
- `slotProps`
- `sx`
- Remaining props are forwarded to the cell `Box`

Default styling:

- `minHeight: 116`
- Borders on right and bottom
- Current-month cells use `background.paper`
- Overflow-month cells use `action.hover`
- Hover changes current-month cells to `action.selected`

## CalendarCellHeader

`CalendarCellHeader` renders the weekday abbreviation and day number inside a month cell.

Location: `src/components/calendar/CalendarCellHeader.jsx`

Props:

- `date`
- `isToday`
- `isCurrentMonth`
- `sx`
- Remaining props are forwarded to the header `Box`

Default behavior:

- Shows `date.format("dd")`
- Shows `date.format("D")`
- Highlights today with `primary.main`
- Dims overflow-month dates

## CalendarEntry

`CalendarEntry` is the default entry container.

Location: `src/components/calendar/CalendarEntry.jsx`

Props:

- `children`
- `sx`
- Remaining props are forwarded to the container `Box`

Default behavior:

- Flex column
- Gap of `0.75`
- Full width
- `minWidth: 0`

In week view, `CalendarGrid` overrides entry styling with `position: absolute` and `inset: 0`.

## CalendarItem

`CalendarItem` is the default entry renderer.

Location: `src/components/calendar/CalendarItem.jsx`

Props:

- `item`
- `entry = item`
- `sx`
- Remaining props are forwarded to the item `Box`

Default behavior:

- Uses `entry || item` as the display object
- Displays `calendarItem.start.format("HH:mm")`
- Displays `calendarItem.title`
- Uses `calendarItem.color || "secondary.light"` as background
- Uses `secondary.contrastText` as text color
- Receives an `onClick` prop from `CalendarRoot` item handling when `onItemClick` is provided

## CalendarRowHeader

`CalendarRowHeader` is the default Row Header renderer used in Row Header Gutters.

Location: `src/components/calendar/CalendarRowHeader.jsx`

Props:

- `ownerState`: row context containing `view`, `rowIndex`, `rowStart`, `rowEnd`, and optional `dates`
- `sx`
- Remaining props are forwarded to the Row Header `Box`

Default behavior:

- In week view, renders `ownerState.rowStart.format("HH:mm")`.
- In month view, renders `KW ${ownerState.rowStart.isoWeek()}` when month Row Headers are enabled.
- Consumers can replace this through `slots.rowHeader` and render any row-specific content. Do not pass arrays of labels; use the render seam.

## CalendarTimeSlotIndicator

`CalendarTimeSlotIndicator` is the default week time-slot hover renderer.

Location: `src/components/calendar/CalendarTimeSlotIndicator.jsx`

Props:

- `timeSlot`: snapped slot data containing `start`, `end`, `index`, `top`, `height`, and `minutes`
- `sx`
- Remaining props are forwarded to the indicator `Box`

Default behavior:

- Renders an absolutely positioned visual indicator using `timeSlot.top` and `timeSlot.height`
- Uses `pointerEvents: "none"`
- Does not render in month view

## Constants

Location: `src/components/calendar/utils/views.js`

```js
export const CALENDAR_VIEWS = {
	WEEK: "week",
	MONTH: "month",
};
```

Location: `src/components/calendar/utils/dateRange.js`

```js
export const WORK_HOUR_PRESETS = {
	FULL_DAY: { id: "full-day", label: "Ganztag", startHour: 0, endHour: 24 },
	WORK_EXTENDED: { id: "6-22", label: "6-22 Uhr", startHour: 6, endHour: 22 },
};
```

```js
export const WORK_HOUR_PRESET_OPTIONS = Object.values(WORK_HOUR_PRESETS);
```

Location: `src/components/calendar/utils/timeSlots.js`

```js
export const TIME_SLOT_MINUTE_OPTIONS = [5, 15, 30, 60];
```

Default root values:

- `defaultView`: `CALENDAR_VIEWS.MONTH`
- `defaultDate`: current day via `dayjs()`
- `defaultShowWeekend`: `true`
- `defaultWorkHourPreset`: `WORK_HOUR_PRESETS.WORK_EXTENDED.id`
- `defaultTimeSlotMinutes`: `15`

## Date Utilities

Location: `src/components/calendar/utils/dateRange.js`

Important functions:

- `getWeekdayLabels({ showWeekend })`: returns German weekday labels, Monday first
- `getMonthViewDates(anchorDate)`: returns 42 Day.js dates for the month grid
- `getWeekViewDates(anchorDate, showWeekend)`: returns five or seven dates for the ISO week
- `isSameDay(a, b)`: day-level comparison
- `sortEntriesByStart(entries)`: returns a copy sorted by `start`
- `getEntriesForDate(entries, date)`: returns entries starting on a day
- `getEntriesForDateRange(entries, startDate, endDate)`: returns entries overlapping a range

Location: `src/components/calendar/utils/views.js`

Important functions:

- `getVisibleDates({ view, anchorDate, showWeekend })`: delegates to the selected calendar view adapter
- `formatToolbarTitle({ view, anchorDate })`: returns the selected calendar view title
- `getNextAnchorDate({ view, anchorDate, direction })`: moves by the selected calendar view interval

Location: `src/components/calendar/useCalendarState.js`

Important functions:

- `useCalendarState(props)`: owns controlled/uncontrolled state, derived title, visible dates, work-hour preset resolution, navigation, and today behaviour

Location: `src/components/calendar/utils/entries.js`

Important functions:

- `normalizeCalendarEntry(entry)`: preserves entry fields while converting `start` and `end` to Day.js values
- `normalizeCalendarEntries(entries)`: normalizes an entries array for internal rendering
- `getCalendarEntryEnd(entry)`: returns the explicit end or defaults to one hour after `start`

Location: `src/components/calendar/utils/weekLayout.js`

Important functions:

- `getWeekEntryLayouts({ entries, date, workHours, hourHeight })`: filters, clips, lanes, and positions visible week entries for one day

Location: `src/components/calendar/utils/weekGeometry.js`

Important functions:

- `getWeekColumnHeight(workHours, hourHeight)`: returns the rendered week day column height
- `getWeekVisibleRange(date, workHours)`: returns the visible Day.js start and end for a week day column
- `getPointerYWithinElement(event)`: returns pointer Y relative to the event target
- `ROW_HEADER_GUTTER_WIDTH`: default Row Header Gutter width

Location: `src/components/calendar/utils/timeSlots.js`

Important functions:

- `normalizeTimeSlotMinutes(value)`: returns one of `5`, `15`, `30`, or `60`
- `getWeekTimeSlot({ date, pointerY, workHours, hourHeight, timeSlotMinutes })`: returns the snapped week slot for a pointer position

Location: `src/components/calendar/utils/weekInteractions.js`

Important functions:

- `createWeekTimeSlotFromPointerEvent({ date, event, workHours, timeSlotMinutes, hourHeight })`: adapts pointer events to snapped week Time Slots
- `createWeekTimeSlotClickPayload({ date, view, timeSlot })`: creates the documented `onTimeSlotClick` payload
- `createWeekEntryTimeInteraction({ action, entry, date, pointerY, pointerStartX, pointerStartY, timeSlotMinutes })`: captures entry move/resize start state
- `createWeekEntryTimeChange({ interaction, date, pointerY, workHours, timeSlotMinutes, hourHeight })`: creates the documented `onEntryTimeChange` payload
- `createWeekEntryTimePreview({ change, date, workHours, hourHeight })`: creates the internal ghost preview and time label from the same range used for commit
- `trapWeekEntryPointerEvent(event)`: stops entry hover from reaching the Time Slot layer

Location: `src/components/calendar/utils/itemEvents.js`

Important functions:

- `createCalendarItemClickHandler({ item, slotOnClick, onItemClick })`: preserves item click callback ordering and stops propagation

Location: `src/components/calendar/utils/layout.js`

Important functions:

- `chunkDates(dates, size)`: generic date chunk helper used to render month rows

## Day.js Setup

Location: `src/lib/dayjs.js`

Configured plugins:

- `localizedFormat`
- `isoWeek`
- `utc`
- `timezone`

Configured defaults:

- Locale: `de`
- Timezone: `Europe/Berlin`

Use this module instead of importing `dayjs` directly when working in this package.

## Layout Requirements

The calendar is designed to fill a bounded parent. Consumers must provide height through the app layout.

Recommended parent chain:

```txt
#root: height: 100vh
app layout: height: 100%; display: flex; flex-direction: column
fixed header: flex-shrink: 0
content: flex: 1; min-height: 0
calendar wrapper: flex: 1; min-height: 0; display: flex; flex-direction: column
CalendarRoot: flex: 1; min-height: 0
```

If the calendar does not scroll internally or overflows the page, check for a missing `height`, `flex: 1`, or `minHeight: 0` on an ancestor.

## Demo Implementation

Location: `src/App.jsx`

The demo shows:

- `CalendarRoot` with sample entries
- `CalendarTopbar` controls
- `useCalendar()` for navigation and state changes
- View toggle between week and month
- Weekend visibility toggle
- Work-hour preset selector shown only in week view
- Time-slot minute selector shown only in week view
- Category filtering outside the package primitives
- Custom `slots.item` renderer
- `onTimeSlotClick` and `onItemClick` callbacks that log their payloads
- `onEntryTimeChange` callback that updates local sample entries through `updateCalendarSampleEntryTime()`

Sample entries live in `src/demo/calendarSampleData.js`.

The demo data models user time tracking rather than only meetings:

- Entries span days 2-28 of the current month so month view has realistic density.
- Categories are `Fokus`, `Meetings`, `Produkt`, `Kunden`, `Support`, and `Admin`.
- Several entries are multi-hour blocks for focused work, support, customer work, or documentation.
- Several entries start and end on non-round minutes such as `09:07`, `10:52`, `13:12`, and `16:49`.
- Some entries overlap intentionally so week view lane layout is visible.

## Minimal Usage

```jsx
import { CalendarRoot, CalendarTopbar, useCalendar } from "./components/calendar";

function CalendarControls() {
	const calendar = useCalendar();

	return (
		<CalendarTopbar>
			<button onClick={() => calendar.navigate(-1)}>Previous</button>
			<button onClick={calendar.today}>Today</button>
			<button onClick={() => calendar.navigate(1)}>Next</button>
			<strong>{calendar.title}</strong>
		</CalendarTopbar>
	);
}

export function CalendarPage({ entries }) {
	return (
		<CalendarRoot entries={entries} sx={{ flex: 1, minHeight: 0 }}>
			<CalendarControls />
		</CalendarRoot>
	);
}
```

## Controlled Usage

```jsx
import { useState } from "react";
import dayjs from "./lib/dayjs";
import { CalendarRoot, CALENDAR_VIEWS } from "./components/calendar";

export function ControlledCalendar({ entries }) {
	const [view, setView] = useState(CALENDAR_VIEWS.MONTH);
	const [date, setDate] = useState(dayjs());
	const [showWeekend, setShowWeekend] = useState(true);

	return (
		<CalendarRoot
			entries={entries}
			view={view}
			date={date}
			showWeekend={showWeekend}
			onViewChange={setView}
			onDateChange={setDate}
			onShowWeekendChange={setShowWeekend}
		/>
	);
}
```

## Custom Item Slot

```jsx
import { Box, Typography } from "@mui/material";

function CustomCalendarItem({ item, layout, sx, ...props }) {
	return (
		<Box
			{...props}
			sx={{
				height: "100%",
				borderRadius: 2,
				px: 1,
				py: 0.75,
				backgroundColor: item.color,
				overflow: "hidden",
				...sx,
			}}
		>
			<Typography variant='caption' fontWeight={800}>
				{item.title}
			</Typography>
		</Box>
	);
}

<CalendarRoot entries={entries} slots={{ item: CustomCalendarItem }} />;
```

## Engineering Guidelines For Future Changes

- Keep package primitives reusable; avoid demo/product-specific controls inside `src/components/calendar/`.
- Keep package vocabulary in `CALENDAR_LANGUAGE.md` current when adding new calendar concepts.
- Prefer MUI `sx`, `slots`, and `slotProps` for customization.
- Keep slot-facing `ownerState` construction close to the rendered slot.
- Keep Row Header rendering behind `slots.rowHeader`; do not add label-array Interfaces.
- Keep week clipping and lane layout in `src/components/calendar/utils/weekLayout.js`.
- Keep week geometry constants and minute-to-pixel helpers in `src/components/calendar/utils/weekGeometry.js`.
- Keep week time-slot snapping in `src/components/calendar/utils/timeSlots.js`.
- Keep week Time Slot interaction payloads and entry pointer trapping in `src/components/calendar/utils/weekInteractions.js`.
- Keep item event adaptation in `src/components/calendar/utils/itemEvents.js`.
- Keep entry normalization and missing-end handling in `src/components/calendar/utils/entries.js`.
- Keep title, visible-date, and navigation behaviour in `src/components/calendar/utils/views.js`.
- Preserve controlled and uncontrolled behavior for root state props.
- Preserve internal scrolling in `CalendarGrid`; do not move calendar scrolling to the page body.
- Keep `CalendarGrid` as a small active-view switch; put month and week rendering in their explicit view components.
- Use `src/lib/dayjs.js` for package date work.
- Treat month and week views as different layout modes sharing the same entry data model.
- When adding new slot props, keep default slots working and document the new prop shape here.
- If adding new views, extend `CALENDAR_VIEWS`, `utils/views.js`, any date-range utilities, `CalendarGrid` rendering, explicit view components, docs, and tests together.

## Tests

Test files live next to the Modules they protect:

- `src/components/calendar/utils/entries.test.js`: entry normalization and missing-end defaults
- `src/components/calendar/utils/weekLayout.test.js`: clipping, exclusion, missing-end layout, and overlap lanes
- `src/components/calendar/utils/timeSlots.test.js`: time-slot normalization and pointer snapping
- `src/components/calendar/utils/weekInteractions.test.js`: time-slot click payloads, hover comparison, and entry time-change payloads
- `src/components/calendar/utils/itemEvents.test.js`: item click callback ordering and propagation handling
- `src/components/calendar/utils/views.test.js`: visible dates, titles, and navigation intervals
- `src/components/calendar/CalendarRoot.test.jsx`: integration checks for normalized entries, slot layout props, Row Headers, time-slot clicks, item clicks, and entry move/resize

Testing guidelines:

- Prefer pure Module tests for date, entry, and layout behaviour.
- Use `CalendarRoot` integration tests only for package seams that require rendering.
- Avoid snapshot tests for MUI markup; assert calendar behaviour and slot-facing data instead.
- Add tests before changing overlap layout, entry normalization, view navigation, or slot prop shapes.
- Add tests before changing time-slot snapping or click payload shapes.
- Add tests before changing entry move/resize payload shapes.

## Validation

Run after package changes:

```bash
pnpm test:run
pnpm lint
pnpm build
```

For documentation-only changes, validation is optional but still safe to run.
