# Chronocal

Chronocal is a React calendar package that provides reusable month and week calendar primitives. It is built with MUI, Day.js, and a slot-based customization model.

The package currently supports:

| Area              | Support                                                                        |
| ----------------- | ------------------------------------------------------------------------------ |
| Views             | Month and week                                                                 |
| Entries           | Plain objects with `id`, `title`, `start`, optional `end`, and custom metadata |
| Week interactions | Time Slot click, item click, move, top resize, bottom resize, ghost preview    |
| Customization     | MUI-style `slots`, `slotProps`, and `sx` props                                 |
| Row Headers       | Enabled by default in week view, optional in month view                        |

For shared vocabulary, read `CALENDAR_LANGUAGE.md`. For implementation notes, read `CALENDAR_PACKAGE.md`.

## Installation

```bash
pnpm add @lucasloe/chronocal @mui/material @emotion/react @emotion/styled dayjs react react-dom
```

Peer dependencies:

| Package           | Version    |
| ----------------- | ---------- |
| `react`           | `^19.2.6`  |
| `react-dom`       | `^19.2.6`  |
| `@mui/material`   | `^9.0.1`   |
| `@emotion/react`  | `^11.14.0` |
| `@emotion/styled` | `^11.14.1` |
| `dayjs`           | `^1.11.20` |

Chronocal exports ESM only.

## Quick Start

```jsx
import { CalendarRoot, CALENDAR_VIEWS } from "@lucasloe/chronocal";

const entries = [
	{
		id: "entry-1",
		title: "Deep Work",
		start: "2026-05-18T08:57:00",
		end: "2026-05-18T12:46:00",
	},
];

export function CalendarPage() {
	return (
		<div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
			<CalendarRoot view={CALENDAR_VIEWS.WEEK} entries={entries} sx={{ flex: 1, minHeight: 0 }} />
		</div>
	);
}
```

## Public Exports

```js
import {
	CalendarCell,
	CalendarCellHeader,
	CalendarEntry,
	CalendarGrid,
	CalendarItem,
	CalendarRoot,
	CalendarRowHeader,
	CalendarTimeSlotIndicator,
	CalendarTopbar,
	CALENDAR_VIEWS,
	TIME_SLOT_MINUTE_OPTIONS,
	WORK_HOUR_PRESETS,
	WORK_HOUR_PRESET_OPTIONS,
	useCalendar,
} from "@lucasloe/chronocal";
```

Most applications should render `CalendarRoot` and use the other exports as customization primitives.

## Entry Data

Entries are plain objects. Chronocal normalizes `start` and provided `end` values to Day.js values before rendering and before passing entries to callbacks and slots.

```js
const entries = [
	{
		id: "entry-1",
		title: "Client Work",
		start: "2026-05-18T09:00:00",
		end: "2026-05-18T11:30:00",
		projectId: "project-1",
	},
];
```

| Field        | Required | Description                                        |
| ------------ | -------- | -------------------------------------------------- |
| `id`         | Yes      | Stable unique key used for rendering and callbacks |
| `title`      | Yes      | Display label used by the default `CalendarItem`   |
| `start`      | Yes      | Day.js value, ISO string, or native `Date`         |
| `end`        | No       | Day.js value, ISO string, or native `Date`         |
| `color`      | No       | Default item background color                      |
| Extra fields | No       | Preserved and passed to callbacks and slots        |

Missing `end` values remain absent on normalized entries. Week layout treats a missing `end` as one hour after `start` when positioning an entry.

## Month View

Month view renders a date grid. It does not use Time Slots. Row Headers are hidden by default in month view.

```jsx
import { CalendarRoot, CALENDAR_VIEWS } from "@lucasloe/chronocal";

export function MonthCalendar({ entries }) {
	return <CalendarRoot view={CALENDAR_VIEWS.MONTH} entries={entries} />;
}
```

Enable month Row Headers when you need week numbers, totals, or other row-level content.

```jsx
<CalendarRoot
	view={CALENDAR_VIEWS.MONTH}
	entries={entries}
	showRowHeaders={({ view }) => view === CALENDAR_VIEWS.MONTH}
/>
```

## Week View

Week view renders day columns with time-based rows. Week Row Headers are shown by default and display hour markers.

```jsx
import { useState } from "react";
import { CalendarRoot, CALENDAR_VIEWS } from "@lucasloe/chronocal";

function updateEntryTime(entries, { id, start, end }) {
	return entries.map((entry) => (entry.id === id ? { ...entry, start, end } : entry));
}

export function WeekCalendar({ initialEntries }) {
	const [entries, setEntries] = useState(initialEntries);

	return (
		<CalendarRoot
			view={CALENDAR_VIEWS.WEEK}
			entries={entries}
			timeSlotMinutes={15}
			onTimeSlotClick={({ start, end }) => {
				console.log("time slot", start.format(), end.format());
			}}
			onItemClick={(item) => {
				console.log("entry", item);
			}}
			onEntryTimeChange={({ id, start, end }) => {
				setEntries((current) => updateEntryTime(current, { id, start, end }));
			}}
		/>
	);
}
```

Hide week Row Headers with `showRowHeaders={false}`.

## Controls

Place controls inside `CalendarRoot` so they can read calendar context with `useCalendar()`.

```jsx
import {
	CalendarRoot,
	CalendarTopbar,
	CALENDAR_VIEWS,
	TIME_SLOT_MINUTE_OPTIONS,
	useCalendar,
} from "@lucasloe/chronocal";

function CalendarControls() {
	const calendar = useCalendar();

	return (
		<CalendarTopbar>
			<button onClick={() => calendar.navigate(-1)}>Previous</button>
			<button onClick={calendar.today}>Today</button>
			<button onClick={() => calendar.navigate(1)}>Next</button>
			<strong>{calendar.title}</strong>
			<button onClick={() => calendar.setView(CALENDAR_VIEWS.MONTH)}>Month</button>
			<button onClick={() => calendar.setView(CALENDAR_VIEWS.WEEK)}>Week</button>
			<select
				value={calendar.timeSlotMinutes}
				onChange={(event) => calendar.setTimeSlotMinutes(event.target.value)}
			>
				{TIME_SLOT_MINUTE_OPTIONS.map((minutes) => (
					<option key={minutes} value={minutes}>
						{minutes} minutes
					</option>
				))}
			</select>
		</CalendarTopbar>
	);
}

export function CalendarWithControls({ entries }) {
	return (
		<CalendarRoot entries={entries} sx={{ flex: 1, minHeight: 0 }}>
			<CalendarControls />
		</CalendarRoot>
	);
}
```

`useCalendar()` returns:

| Value             | Description                         |
| ----------------- | ----------------------------------- |
| `view`            | Current view, `"month"` or `"week"` |
| `date`            | Current Day.js anchor date          |
| `title`           | Formatted title for the active view |
| `showWeekend`     | Whether weekends are visible        |
| `workHoursPreset` | Active work-hour preset id          |
| `workHours`       | Active work-hour preset object      |
| `timeSlotMinutes` | Active Time Slot granularity        |
| `visibleDates`    | Dates rendered by the active view   |
| `slots`           | Resolved slot components            |
| `slotProps`       | Slot props passed to `CalendarRoot` |

`useCalendar()` actions:

| Action                             | Description                              |
| ---------------------------------- | ---------------------------------------- |
| `setView(nextView)`                | Set active view                          |
| `setDate(nextDate)`                | Set anchor date                          |
| `setShowWeekend(nextBoolean)`      | Show or hide weekends                    |
| `setWorkHoursPreset(nextPresetId)` | Select work-hour preset                  |
| `setTimeSlotMinutes(nextMinutes)`  | Select Time Slot granularity             |
| `navigate(direction)`              | Move by month or week, depending on view |
| `today()`                          | Set anchor date to today                 |

## CalendarRoot Props

| Prop                      | Default                              | Description                                          |
| ------------------------- | ------------------------------------ | ---------------------------------------------------- |
| `entries`                 | `[]`                                 | Entries rendered by month and week views             |
| `view`                    | uncontrolled                         | Controlled active view                               |
| `defaultView`             | `CALENDAR_VIEWS.MONTH`               | Initial uncontrolled view                            |
| `onViewChange`            | none                                 | Called with the next view                            |
| `date`                    | uncontrolled                         | Controlled anchor date                               |
| `defaultDate`             | current day                          | Initial uncontrolled anchor date                     |
| `onDateChange`            | none                                 | Called with the next Day.js anchor date              |
| `showWeekend`             | uncontrolled                         | Controlled weekend visibility                        |
| `defaultShowWeekend`      | `true`                               | Initial uncontrolled weekend visibility              |
| `onShowWeekendChange`     | none                                 | Called with the next boolean                         |
| `workHoursPreset`         | uncontrolled                         | Controlled work-hour preset id                       |
| `defaultWorkHourPreset`   | `WORK_HOUR_PRESETS.WORK_EXTENDED.id` | Initial uncontrolled work-hour preset id             |
| `onWorkHoursPresetChange` | none                                 | Called with the next preset id                       |
| `timeSlotMinutes`         | uncontrolled                         | Controlled Time Slot granularity                     |
| `defaultTimeSlotMinutes`  | `15`                                 | Initial uncontrolled Time Slot granularity           |
| `onTimeSlotMinutesChange` | none                                 | Called with the normalized Time Slot granularity     |
| `onTimeSlotClick`         | none                                 | Week-only callback for clicked Time Slots            |
| `onItemClick`             | none                                 | Callback for clicked entries                         |
| `onEntryTimeChange`       | none                                 | Week-only callback for move and resize changes       |
| `showRowHeaders`          | week only                            | Boolean or function controlling Row Header rendering |
| `slots`                   | `{}`                                 | Custom renderers                                     |
| `slotProps`               | `{}`                                 | Props forwarded to custom renderers                  |
| `children`                | none                                 | Rendered above the grid inside context               |
| `gridSx`                  | none                                 | `sx` forwarded to the scroll container               |
| `sx`                      | none                                 | `sx` applied to the root container                   |
| `cellSx`                  | none                                 | `sx` passed to month cells                           |

## Callback Payloads

```js
onTimeSlotClick({
	start, // Day.js snapped slot start
	end, // Day.js snapped slot end
	date, // Day.js day column date
	view, // "week"
	timeSlotMinutes,
});
```

```js
onItemClick(item); // normalized entry
```

```js
onEntryTimeChange({
	id,
	start, // Day.js proposed start
	end, // Day.js proposed end
	entry, // normalized entry before the change
	action, // "move", "resize-start", or "resize-end"
});
```

## Slots

| Slot                | Default                     | Used In                             | Purpose                                |
| ------------------- | --------------------------- | ----------------------------------- | -------------------------------------- |
| `cellHeader`        | `CalendarCellHeader`        | Month                               | Renders the header inside a month cell |
| `entry`             | `CalendarEntry`             | Month and week                      | Renders the entry container/layer      |
| `item`              | `CalendarItem`              | Month and week                      | Renders each entry item                |
| `rowHeader`         | `CalendarRowHeader`         | Week by default, month when enabled | Renders Row Header content             |
| `timeSlotIndicator` | `CalendarTimeSlotIndicator` | Week                                | Renders hovered Time Slot indicator    |

Pass custom renderers with `slots` and extra props with `slotProps`.

```jsx
<CalendarRoot
	entries={entries}
	slots={{ item: CustomItem, rowHeader: CustomRowHeader }}
	slotProps={{ item: { sx: { borderRadius: 2 } } }}
/>
```

## MUI Styling

All exported calendar primitives accept `sx`. Native month/week structure can be styled through `slotProps` keys such as `monthRoot`, `monthWeekdayHeader`, `weekRoot`, `weekHeader`, `weekColumn`, `weekDraggableEntry`, and `weekResizeHandle`.

Chronocal also registers MUI custom component names prefixed with `CALENDAR_`, so theme overrides can target package internals:

```js
const theme = createTheme({
	components: {
		CALENDAR_CalendarItem: {
			styleOverrides: {
				root: ({ theme }) => ({
					borderRadius: theme.shape.borderRadius * 2,
				}),
			},
		},
		CALENDAR_CalendarWeekView: {
			styleOverrides: {
				column: ({ theme }) => ({
					backgroundColor: theme.palette.background.default,
				}),
			},
		},
	},
});
```

Available theme component names are `CALENDAR_CalendarRoot`, `CALENDAR_CalendarGrid`, `CALENDAR_CalendarTopbar`, `CALENDAR_CalendarMonthView`, `CALENDAR_CalendarWeekView`, `CALENDAR_CalendarCell`, `CALENDAR_CalendarCellHeader`, `CALENDAR_CalendarEntry`, `CALENDAR_CalendarItem`, `CALENDAR_CalendarRowHeader`, and `CALENDAR_CalendarTimeSlotIndicator`.

Custom item example:

```jsx
import { Box, Typography } from "@mui/material";

function CustomItem({ item, sx, onClick, ...props }) {
	return (
		<Box {...props} onClick={onClick} sx={{ height: "100%", p: 1, ...sx }}>
			<Typography variant='caption' fontWeight={800}>
				{item.start.format("HH:mm")}
			</Typography>
			<Typography variant='caption'>{item.title}</Typography>
		</Box>
	);
}
```

Important slot props:

| Slot                | Important props                                                          |
| ------------------- | ------------------------------------------------------------------------ |
| `cellHeader`        | `date`, `isToday`, `isCurrentMonth`, `view`, `ownerState`, `sx`          |
| `entry`             | `children`, `date`, `entries`, `view`, `ownerState`, `sx`                |
| `item`              | `item`, `entry`, `date`, `view`, `layout`, `ownerState`, `onClick`, `sx` |
| `rowHeader`         | `view`, `rowIndex`, `rowStart`, `rowEnd`, `dates`, `ownerState`, `sx`    |
| `timeSlotIndicator` | `date`, `view`, `timeSlot`, `ownerState`, `sx`                           |

## Constants

```js
CALENDAR_VIEWS = {
	WEEK: "week",
	MONTH: "month",
};

TIME_SLOT_MINUTE_OPTIONS = [5, 15, 30, 60];

WORK_HOUR_PRESETS = {
	FULL_DAY: { id: "full-day", label: "Ganztag", startHour: 0, endHour: 24 },
	WORK_EXTENDED: { id: "6-22", label: "6-22 Uhr", startHour: 6, endHour: 22 },
};
```

## Layout Requirements

The calendar fills a bounded parent and owns internal scrolling. If it overflows the page or does not scroll internally, check for a missing `height`, `flex: 1`, or `minHeight: 0` on an ancestor.

Recommended parent chain:

```txt
#root: height: 100vh
app layout: height: 100%; display: flex; flex-direction: column
fixed header: flex-shrink: 0
content: flex: 1; min-height: 0
calendar wrapper: flex: 1; min-height: 0; display: flex; flex-direction: column
CalendarRoot: flex: 1; min-height: 0
```

## Development

```bash
pnpm install
pnpm dev
pnpm test:run
pnpm lint
pnpm build
```

Commands:

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `pnpm dev`        | Start the demo app                   |
| `pnpm build`      | Build the package library to `dist/` |
| `pnpm build:demo` | Build the demo app to `dist-demo/`   |
| `pnpm test:run`   | Run tests once                       |
| `pnpm lint`       | Run ESLint                           |

Demo code lives in `src/App.jsx` and `src/demo/calendarSampleData.js`.
