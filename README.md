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

Chronocal exports ESM only. Runtime imports use the built `dist/index.js` bundle, and the readable calendar source is published alongside it under `src/components/calendar/` plus `src/lib/dayjs.js` so installed packages remain locally inspectable by humans and AI agents.

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
	CalendarLocalizationProvider,
	CalendarMonthWeekdayHeader,
	CalendarRoot,
	CalendarRowHeader,
	CalendarTimeSlotIndicator,
	CalendarTopbar,
	CalendarWeekHeader,
	CALENDAR_VIEWS,
	getCalendarViewRange,
	TIME_SLOT_MINUTE_OPTIONS,
	WORK_HOUR_PRESETS,
	WORK_HOUR_PRESET_OPTIONS,
	useCalendar,
	useCalendarExternalDragSource,
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

### TypeScript And Custom Metadata

Extra entry fields are preserved and passed to callbacks and slots. In TypeScript, extend `CalendarEntryItem` for application metadata.

```tsx
import type { CalendarEntryItem, NormalizedCalendarEntry } from "@lucasloe/chronocal";

interface ProjectEntry extends CalendarEntryItem {
	projectId: string;
	status?: "normal" | "warning" | "error";
}

const entries: ProjectEntry[] = [
	{
		id: "entry-1",
		title: "Client Work",
		start: "2026-05-18T09:00:00",
		end: "2026-05-18T11:30:00",
		projectId: "project-1",
		status: "warning",
	},
];

function handleItemClick(entry: NormalizedCalendarEntry<ProjectEntry>) {
	console.log(entry.projectId, entry.start.format());
}
```

Callback entries are normalized, so `start` and provided `end` values are Day.js objects. Convert them back to strings before persistence if your API stores ISO values.

```js
onEntryTimeChange={({ id, start, end }) => {
	api.updateEntry(id, {
		start: start.toISOString(),
		end: end.toISOString(),
	});
}};
```

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

Tune month layout dimensions with `monthLayout` instead of replacing package grid templates.

```jsx
<CalendarRoot
	view={CALENDAR_VIEWS.MONTH}
	entries={entries}
	showRowHeaders={({ view }) => view === CALENDAR_VIEWS.MONTH}
	monthLayout={{ rowHeaderWidth: 30, cellMinHeight: 200 }}
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

## External Drag Sources

Week view supports dropping caller-owned values into day columns. Use `useCalendarExternalDragSource()` on an element outside the grid and handle `onExternalItemDrop` on `CalendarRoot`.

```jsx
import { Box } from "@mui/material";
import { CalendarRoot, CALENDAR_VIEWS, useCalendarExternalDragSource } from "@lucasloe/chronocal";

function BacklogItem({ template }) {
	const { attributes, listeners, setNodeRef } = useCalendarExternalDragSource({
		id: template.id,
		source: template,
	});

	return (
		<Box ref={setNodeRef} {...attributes} {...listeners} sx={{ cursor: "grab" }}>
			{template.title}
		</Box>
	);
}

export function CalendarWithBacklog({ entries, setEntries, templates }) {
	return (
		<CalendarRoot
			view={CALENDAR_VIEWS.WEEK}
			entries={entries}
			onExternalItemDrop={({ source, start, end }) => {
				setEntries((current) => [
					...current,
					{
						id: crypto.randomUUID(),
						title: source.title,
						start,
						end,
					},
				]);
			}}
		>
			{templates.map((template) => (
				<BacklogItem key={template.id} template={template} />
			))}
		</CalendarRoot>
	);
}
```

External drop payload:

```js
onExternalItemDrop({
	source, // caller-owned value supplied to useCalendarExternalDragSource()
	start, // Day.js snapped start
	end, // Day.js snapped end, currently one hour after start
	date, // Day.js day column date
	view, // "week"
	timeSlotMinutes,
	timeSlot,
});
```

External drag uses native browser drag and drop. It is best suited for desktop pointer workflows; mobile support depends on the browser.

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
| `range`           | Active view data range `{ start, end }` |
| `locale`          | Resolved calendar locale            |
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
| `locale`                  | nearest provider or global Day.js    | Optional locale for package-owned labels             |
| `onTimeSlotClick`         | none                                 | Week-only callback for clicked Time Slots            |
| `onItemClick`             | none                                 | Callback for clicked entries                         |
| `onEntryTimeChange`       | none                                 | Week-only callback for move and resize changes       |
| `onExternalItemDrop`      | none                                 | Week-only callback for dropped External Drag Sources |
| `showRowHeaders`          | week only                            | Boolean or function controlling Row Header rendering |
| `slots`                   | `{}`                                 | Custom renderers                                     |
| `slotProps`               | `{}`                                 | Props forwarded to custom renderers                  |
| `monthLayout`             | package defaults                     | Month grid sizing: `rowHeaderWidth`, `cellMinWidth`, `cellMinHeight`, and `weekdayHeaderHeight` |
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

```js
onExternalItemDrop({
	source,
	start, // Day.js snapped start
	end, // Day.js snapped end
	date, // Day.js day column date
	view, // "week"
	timeSlotMinutes,
	timeSlot,
});
```

## View Ranges

`useCalendar()` exposes `calendar.range` for controls inside `CalendarRoot`. Use the exported `getCalendarViewRange()` helper when parent components need the same range for fetching, reports, or sidebars before rendering the calendar.

```js
import { CALENDAR_VIEWS, getCalendarViewRange } from "@lucasloe/chronocal";

const range = getCalendarViewRange({ view: CALENDAR_VIEWS.WEEK, anchorDate: date });

api.fetchWorklogs({
	start: range.start.toISOString(),
	end: range.end.toISOString(),
});
```

Ranges use ISO weeks for week view and calendar months for month view. `end` is an end-of-period Day.js value.

## Slots

| Slot                 | Default                      | Used In                             | Purpose                                |
| -------------------- | ---------------------------- | ----------------------------------- | -------------------------------------- |
| `cell`               | `CalendarCell`               | Month                               | Renders a month day cell               |
| `cellHeader`         | `CalendarCellHeader`         | Month                               | Renders the header inside a month cell |
| `monthWeekdayHeader` | `CalendarMonthWeekdayHeader` | Month                               | Renders the top weekday labels         |
| `weekHeader`         | `CalendarWeekHeader`         | Week                                | Renders the top day labels             |
| `entry`              | `CalendarEntry`              | Month and week                      | Renders the entry container/layer      |
| `item`               | `CalendarItem`               | Month and week                      | Renders each entry item                |
| `rowHeader`          | `CalendarRowHeader`          | Week by default, month when enabled | Renders Row Header content             |
| `timeSlotIndicator`  | `CalendarTimeSlotIndicator`  | Week                                | Renders hovered Time Slot indicator    |

Pass custom renderers with `slots` and extra props with `slotProps`.

```jsx
<CalendarRoot
	entries={entries}
	slots={{ item: CustomItem, rowHeader: CustomRowHeader }}
	slotProps={{ item: { sx: { borderRadius: 2 } } }}
/>
```

For business applications, prefer importing the default slot component, wrapping it, and passing it back. This keeps package-owned behavior intact.

```jsx
import { CalendarCell, CalendarItem, CalendarWeekHeader } from "@lucasloe/chronocal";

function BusinessCell(props) {
	return <CalendarCell {...props} sx={[{ bgcolor: "background.paper" }, props.sx]} />;
}

function BusinessWeekHeader(props) {
	return <CalendarWeekHeader {...props}>{props.date.format("ddd DD.MM")}</CalendarWeekHeader>;
}

function BusinessItem(props) {
	return <CalendarItem {...props} sx={[{ borderRadius: 2 }, props.sx]} />;
}

<CalendarRoot
	entries={entries}
	slots={{ cell: BusinessCell, weekHeader: BusinessWeekHeader, item: BusinessItem }}
/>;
```

The week column, draggable wrapper, resize handles, and drag preview are intentionally not replaceable components. They own time-slot click, hover, external drop, move, resize, and preview geometry. Style them with `slotProps` instead.

### Slot Contract

Custom slot components should forward package props to the rendered root element. This preserves clicks, layout, theme classes, data attributes, and test hooks.

Forward these props unless you intentionally handle them yourself:

| Prop type          | Why it matters                                           |
| ------------------ | -------------------------------------------------------- |
| `sx`               | Keeps MUI styling and package-provided layout intact     |
| `onClick`          | Keeps `onItemClick` and slot click composition working   |
| `children`         | Keeps nested package renderers visible                   |
| `className`        | Keeps MUI styled classes and theme overrides working     |
| `style`            | Keeps inline positioning and caller styles working       |
| `data-*`, `aria-*` | Keeps diagnostics, tests, and accessibility hooks intact |
| Unknown props      | Keeps future package props and caller props compatible   |

Recommended pattern:

```jsx
import { CalendarItem } from "@lucasloe/chronocal";

function BusinessItem({ item, sx, ...props }) {
	return (
		<CalendarItem {...props} item={item} sx={[{ borderRadius: 2, bgcolor: item.color }, sx]} />
	);
}
```

If a custom week item does not wrap `CalendarItem`, render a single root element and forward `onClick`, `sx`, and `...props` to that root.

## MUI Styling

All exported calendar primitives accept `sx`. Native month/week structure can be styled through `slotProps` keys such as `monthRoot`, `monthWeekdayHeader`, `weekRoot`, `weekHeader`, `weekColumn`, `weekDraggableEntry`, and `weekResizeHandle`. Prefer `monthLayout` for month grid sizing before overriding month grid templates manually.

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

Available theme component names are `CALENDAR_CalendarRoot`, `CALENDAR_CalendarGrid`, `CALENDAR_CalendarTopbar`, `CALENDAR_CalendarMonthView`, `CALENDAR_CalendarWeekView`, `CALENDAR_CalendarCell`, `CALENDAR_CalendarCellHeader`, `CALENDAR_CalendarMonthWeekdayHeader`, `CALENDAR_CalendarWeekHeader`, `CALENDAR_CalendarEntry`, `CALENDAR_CalendarItem`, `CALENDAR_CalendarRowHeader`, and `CALENDAR_CalendarTimeSlotIndicator`.

Common style override slot keys:

| Component                             | Slot keys                                                                                                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CALENDAR_CalendarRoot`               | `root`                                                                                                                                                                                     |
| `CALENDAR_CalendarGrid`               | `root`                                                                                                                                                                                     |
| `CALENDAR_CalendarTopbar`             | `root`                                                                                                                                                                                     |
| `CALENDAR_CalendarMonthView`          | `root`, `corner`, `rowHeaderGutter`                                                                                                                                                        |
| `CALENDAR_CalendarWeekView`           | `root`, `content`, `grid`, `column`, `entryTimePreview`, `entryTimePreviewLabel`, `timeSlotLayer`, `draggableEntry`, `resizeHandle`, `rowHeaderGutter`, `rowHeaderCorner`, `rowHeaderCell` |
| `CALENDAR_CalendarCell`               | `root`, `itemWrapper`                                                                                                                                                                      |
| `CALENDAR_CalendarCellHeader`         | `root`, `weekday`, `day`                                                                                                                                                                   |
| `CALENDAR_CalendarMonthWeekdayHeader` | `root`, `label`                                                                                                                                                                            |
| `CALENDAR_CalendarWeekHeader`         | `root`, `label`                                                                                                                                                                            |
| `CALENDAR_CalendarEntry`              | `root`                                                                                                                                                                                     |
| `CALENDAR_CalendarItem`               | `root`, `time`, `title`                                                                                                                                                                    |
| `CALENDAR_CalendarRowHeader`          | `root`, `label`                                                                                                                                                                            |
| `CALENDAR_CalendarTimeSlotIndicator`  | `root`                                                                                                                                                                                     |

Custom item example:

```jsx
import { Box, Typography } from "@mui/material";

function CustomItem({ item, sx, onClick, ...props }) {
	return (
		<Box {...props} onClick={onClick} sx={[{ height: "100%", p: 1 }, sx]}>
			<Typography variant='caption' fontWeight={800}>
				{item.start.format("HH:mm")}
			</Typography>
			<Typography variant='caption'>{item.title}</Typography>
		</Box>
	);
}
```

Important slot props:

| Slot                 | Important props                                                          |
| -------------------- | ------------------------------------------------------------------------ |
| `cell`               | `date`, `entries`, `isToday`, `isCurrentMonth`, `view`, `slots`, `sx`    |
| `cellHeader`         | `date`, `isToday`, `isCurrentMonth`, `view`, `ownerState`, `sx`          |
| `monthWeekdayHeader` | `label`, `index`, `view`, `ownerState`, `labelProps`, `sx`               |
| `weekHeader`         | `date`, `label`, `view`, `ownerState`, `labelProps`, `sx`                |
| `entry`              | `children`, `date`, `entries`, `view`, `ownerState`, `sx`                |
| `item`               | `item`, `entry`, `date`, `view`, `layout`, `ownerState`, `onClick`, `sx` |
| `rowHeader`          | `view`, `rowIndex`, `rowStart`, `rowEnd`, `dates`, `ownerState`, `sx`    |
| `timeSlotIndicator`  | `date`, `view`, `timeSlot`, `ownerState`, `sx`                           |

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

## Localization

Chronocal uses Day.js for date math, but it does not set a global Day.js locale or timezone. The consuming app owns locale and timezone policy.

By default, Chronocal formats labels with the current Day.js locale. For one-locale apps, configure Day.js before rendering the calendar.

```js
import dayjs from "dayjs";
import "dayjs/locale/de";

dayjs.locale("de");
```

For scoped calendar localization, use `CalendarLocalizationProvider`.

```jsx
import "dayjs/locale/de";
import { CalendarLocalizationProvider, CalendarRoot } from "@lucasloe/chronocal";

<CalendarLocalizationProvider locale='de'>
	<CalendarRoot entries={entries} />
</CalendarLocalizationProvider>;
```

For one-off calendars, pass `locale` directly to `CalendarRoot`. The root prop wins over the nearest provider.

```jsx
import "dayjs/locale/de";

<CalendarRoot entries={entries} locale='de' />;
```

The app must import the Day.js locale before using it. Chronocal does not import all Day.js locales.

MUI X `LocalizationProvider` does not automatically control Chronocal because Chronocal calls Day.js directly instead of reading the MUI X date adapter context. If your app uses MUI X, configure Day.js globally, wrap Chronocal in `CalendarLocalizationProvider`, or pass `locale` to `CalendarRoot`.

Chronocal uses ISO weeks internally, so weeks start on Monday. Entry `start` and `end` values may be Day.js values, ISO strings, or native `Date` objects. Rendered slot entries and callback payloads receive Day.js values.

Timezone conversion is not currently part of the public localization API.

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

## Accessibility And Interaction Scope

Chronocal currently focuses on pointer-first calendar interactions.

| Area                     | Current behavior                                                            |
| ------------------------ | --------------------------------------------------------------------------- |
| Item click               | Supported through `onItemClick`; custom item slots should forward `onClick` |
| Time Slot click          | Supported in week view with pointer/mouse clicks                            |
| Move and resize          | Supported with pointer drag in week view                                    |
| External drop            | Supported with native browser drag and drop in week view                    |
| Keyboard move/resize     | Not currently provided                                                      |
| Keyboard grid navigation | Not currently provided                                                      |
| ARIA calendar roles      | Not currently provided by default                                           |

For production accessibility, add accessible labels and keyboard controls in your custom controls and item slots. If you replace the default `item` slot, preserve `onClick` and pass `aria-*` attributes to your rendered root.

## Known Limitations

| Area            | Limitation                                                                                |
| --------------- | ----------------------------------------------------------------------------------------- |
| Views           | Month and week only                                                                       |
| Month entries   | No package-owned multi-day spanning layout, all-day lane, or "show more" overflow control |
| Week entries    | Time-based entries only; all-day rows are not currently modeled                           |
| Work hours      | Uses package presets; custom public presets are not currently exposed                     |
| Timezone        | Timezone conversion is not currently part of the public localization API                   |
| External drag   | Native browser drag and drop; mobile browser support varies                               |
| `slotProps`     | Plain object props; function-valued MUI slot props are not currently supported            |
| Accessibility   | Pointer-first interactions; keyboard calendar navigation is not built in                  |

The repository also contains `CALENDAR_LANGUAGE.md` and `CALENDAR_PACKAGE.md` for shared vocabulary and implementation notes. Check the published package contents before relying on those files from an installed npm package.

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
