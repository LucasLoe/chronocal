# Chronocal

Chronocal is a React calendar package for MUI applications. It provides month and week views, controlled or uncontrolled state, pointer scheduling, basic keyboard selection, and MUI-style customization through `slots`, `slotProps`, themes, and `sx`.

## At A Glance

| Area | Support |
| --- | --- |
| Views | Month and week |
| Entries | Timed entries with caller-owned metadata |
| Week interactions | Select, move, resize, and external drop |
| Keyboard | Entry activation and Week View Time Slot selection |
| Customization | MUI slots, slot props, theme overrides, and `sx` |
| Date engine | Day.js with ISO weeks |

Chronocal is ESM-only. It does not include an all-day lane, recurrence engine, persistence layer, or complete ARIA grid implementation.

## Installation

```bash
pnpm add @lucasloe/chronocal @mui/material @emotion/react @emotion/styled dayjs react react-dom
```

Chronocal supports Node.js 20.19 or newer. Supported peer ranges are React 18 or 19 and MUI 7, 8, or 9. See `package.json` for exact ranges.

The installed package contains both the production `dist/index.js` bundle and readable source under `src/components/calendar/`, plus `src/lib/dayjs.js`, declarations, and package guides. Runtime imports still use the package root; the published source is included so developers and AI tools can inspect the implementation in `node_modules/@lucasloe/chronocal`.

## Quick Start

The calendar fills a bounded parent and owns its scrolling. Give its parent a real height.

```jsx
import { CalendarRoot, CALENDAR_VIEWS } from "@lucasloe/chronocal";

const entries = [
	{
		id: "entry-1",
		title: "Deep Work",
		start: "2026-05-18T09:00:00",
		end: "2026-05-18T11:30:00",
	},
];

export function CalendarPage() {
	return (
		<div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				entries={entries}
				sx={{ flex: 1, minHeight: 0 }}
			/>
		</div>
	);
}
```

## Entry Data

Entries are plain objects. Chronocal preserves custom fields and converts `start` and `end` to Day.js values before passing entries to slots and callbacks.

```ts
interface CalendarEntryItem {
	id: string;
	title: string;
	start: Dayjs | Date | string;
	end?: Dayjs | Date | string;
	color?: string;
	[key: string]: unknown;
}
```

An omitted or explicitly `undefined` `end` is valid. Week layout treats it as one hour after `start`; normalization does not add an omitted `end` property.

### Validation

Chronocal fails fast instead of silently dropping malformed data. It logs a `[Chronocal]` error and throws when:

- `entries` is not an array;
- an entry has no non-empty string `id` or `title`, or has no valid `start`;
- a provided `end` is invalid or is not after `start`;
- two entries use the same `id`; or
- `date`, `defaultDate`, `setDate()` input, or a range helper anchor is invalid;
- `view` is not `"month"` or `"week"`; or
- a work-hour preset ID is not one of the exported presets.

Validation happens during initialization or rendering. Validate untrusted API data before passing it to the calendar.

In TypeScript, extend `CalendarEntryItem` with application metadata:

```tsx
import type { CalendarEntryItem, NormalizedCalendarEntry } from "@lucasloe/chronocal";

interface ProjectEntry extends CalendarEntryItem {
	projectId: string;
}

function handleItemClick(entry: NormalizedCalendarEntry<ProjectEntry>) {
	console.log(entry.projectId, entry.start.toISOString());
}
```

## Views

### Month View

Month View renders the complete ISO weeks intersecting the anchor month. Depending on the month, it contains four, five, or six rows, including adjacent-month dates.

- Weeks start on Monday.
- Hiding weekends leaves Monday through Friday.
- Entries appear on their start date.
- Dense cells scroll internally.
- There is no multi-day spanning lane or built-in "show more" control.

Use `monthLayout` for common dimensions:

```jsx
<CalendarRoot
	view={CALENDAR_VIEWS.MONTH}
	entries={entries}
	monthLayout={{ cellMinWidth: 140, cellMinHeight: 180, weekdayHeaderHeight: 44 }}
/>
```

### Week View

Week View renders five or seven timed day columns and clips entries to the selected work hours. Overlapping entries are placed in side-by-side lanes.

```jsx
<CalendarRoot
	view={CALENDAR_VIEWS.WEEK}
	entries={entries}
	timeSlotMinutes={15}
	onTimeSlotClick={({ start, end }) => openCreateDialog({ start, end })}
	onEntryTimeChange={({ id, start, end }) => updateEntry(id, { start, end })}
/>
```

Chronocal proposes changes through callbacks; it never mutates `entries`.

### Week Height

Week View uses one resolved pixel-per-hour ratio for rendering and interaction geometry. By default, each hour is at least `52px` high and expands when necessary to fill the bounded calendar viewport.

```jsx
// Automatic viewport filling with a 40px minimum
<CalendarRoot weekLayout={{ hourMinHeight: 40 }} />

// Exact fixed ratio; automatic sizing is disabled
<CalendarRoot weekLayout={{ hourHeight: 64 }} />
```

`hourHeight` is the stable unit. The height of a 15-minute Time Slot, for example, is `hourHeight * 15 / 60`. The resolved value drives columns, dividers, Row Headers, entries, pointer snapping, previews, and keyboard controls together.

Custom Week View slots can read the resolved `ownerState.hourHeight`. Do not override hour or column heights independently through `sx`, because visual positions and interaction geometry must use the same ratio.

## Controls And State

Place controls inside `CalendarRoot` and read state with `useCalendar()`.

```jsx
import { Button } from "@mui/material";
import { CalendarRoot, CalendarTopbar, useCalendar } from "@lucasloe/chronocal";

function Controls() {
	const calendar = useCalendar();

	return (
		<CalendarTopbar>
			<Button onClick={() => calendar.navigate(-1)}>Previous</Button>
			<Button onClick={calendar.today}>Today</Button>
			<Button onClick={() => calendar.navigate(1)}>Next</Button>
			<strong>{calendar.title}</strong>
		</CalendarTopbar>
	);
}

function Calendar({ entries }) {
	return (
		<CalendarRoot entries={entries}>
			<Controls />
		</CalendarRoot>
	);
}
```

`today()` changes the anchor date and leaves focus on the caller's button.

### Controlled State

These pairs support controlled and uncontrolled use:

| Controlled | Initial uncontrolled value | Change callback |
| --- | --- | --- |
| `view` | `defaultView` (`"month"`) | `onViewChange` |
| `date` | `defaultDate` (today) | `onDateChange` |
| `showWeekend` | `defaultShowWeekend` (`true`) | `onShowWeekendChange` |
| `workHoursPreset` | `defaultWorkHourPreset` (`"6-22"`) | `onWorkHoursPresetChange` |
| `timeSlotMinutes` | `defaultTimeSlotMinutes` (`15`) | `onTimeSlotMinutesChange` |

Unsupported Time Slot values are normalized to the nearest value in `TIME_SLOT_MINUTE_OPTIONS`: `5`, `15`, `30`, or `60`.

`useCalendar()` exposes the current values, `visibleDates`, `range`, resolved slots, locale, and the corresponding setters. `navigate(direction)` moves by month or week. `today()` moves to the current date.

## Migrating From 1.1

- Invalid entries, dates, views, and work-hour preset IDs now throw. An omitted or `undefined` entry `end` remains valid.
- `showRowHeaders` predicates now run for every row instead of only row zero.
- Week View now expands to fill its viewport. Use `weekLayout={{ hourHeight: 52 }}` to retain the previous fixed density.
- Interactive Week structural handlers now run package behavior before consumer handlers, and external drag `isDragging` now reflects native drag state.
- The package now declares Node.js 20.19 or newer, and built-in preset labels are `Full day` and `06:00-22:00`.

## Row Headers

Week Row Headers are shown by default; Month Row Headers are hidden. Pass a boolean to control the whole view, or a predicate to decide each row independently.

```jsx
<CalendarRoot
	showRowHeaders={({ view, rowIndex }) =>
		view === CALENDAR_VIEWS.MONTH ? rowIndex % 2 === 0 : true
	}
/>
```

If any row returns `true`, Chronocal keeps the gutter aligned and leaves empty gutter cells for rows returning `false`.

Month predicates receive `{ view, rowIndex, rowStart, rowEnd, dates }`. Week predicates receive `{ view, rowIndex, rowStart, rowEnd }`. `rowEnd` is exclusive.

## Interaction Callbacks

| Callback | View | Purpose |
| --- | --- | --- |
| `onItemClick(entry)` | Month and week | Activate a normalized entry |
| `onTimeSlotClick(payload)` | Week | Select a Time Slot |
| `onEntryTimeChange(payload)` | Week | Propose a move or resize |
| `onExternalItemDrop(payload)` | Week | Create from an external source |

Time Slot selection emits:

```js
{ start, end, date, view: "week", timeSlotMinutes }
```

Move and resize emit:

```js
{ id, start, end, entry, action }
```

`action` is `"move"`, `"resize-start"`, or `"resize-end"`.

## Keyboard Behavior

When `onTimeSlotClick` is present, Week View provides one focusable Time Slot control per visible day.

| Key | Result |
| --- | --- |
| `ArrowUp` / `ArrowDown` | Move by one configured Time Slot |
| `ArrowLeft` / `ArrowRight` | Move to the adjacent visible day at the same time |
| `Enter` | Emit `onTimeSlotClick` |

Navigation clamps at visible day and work-hour boundaries. Pointer and keyboard selection emit the same payload. Time Slot accessibility labels use the configured calendar locale.

Clickable default `CalendarItem` instances expose `role="button"`, are focusable, and activate with Enter. Custom item slots must preserve or provide equivalent keyboard behavior.

Keyboard entry move/resize, Month View grid navigation, Space activation, and ARIA grid structure are not currently provided.

## External Drag Sources

External drag uses native browser drag and drop and is intended primarily for desktop workflows.

```jsx
function BacklogItem({ template }) {
	const drag = useCalendarExternalDragSource({ id: template.id, source: template });

	return (
		<div ref={drag.setNodeRef} {...drag.attributes} {...drag.listeners}>
			{template.title}
		</div>
	);
}

<CalendarRoot
	view={CALENDAR_VIEWS.WEEK}
	onExternalItemDrop={({ source, start, end }) => createEntry({ source, start, end })}
/>
```

Drops emit `{ source, start, end, date, view, timeSlotMinutes, timeSlot }` with a one-hour proposed range. `isDragging` reflects the native drag lifecycle; `transform` remains `null`, and `setNodeRef` is a compatibility no-op.

## Customization

Most applications should use `CalendarRoot` and customize these component slots:

| Slot | Used in |
| --- | --- |
| `cell`, `cellHeader`, `monthWeekdayHeader` | Month |
| `weekHeader`, `timeSlotIndicator` | Week |
| `entry`, `item`, `rowHeader` | Both where applicable |

Wrapping a default primitive is safer than rebuilding its behavior:

```jsx
import { CalendarItem } from "@lucasloe/chronocal";

function ProjectItem({ item, sx, ...props }) {
	return <CalendarItem {...props} item={item} sx={[{ borderRadius: 2 }, sx]} />;
}

<CalendarRoot entries={entries} slots={{ item: ProjectItem }} />;
```

Custom slots should forward `sx`, `children`, `className`, `style`, event handlers, `role`, `tabIndex`, `aria-*`, `data-*`, and unknown props. In particular, preserve `onClick` and `onKeyDown` on custom item roots.

Package-owned month/week structure is styled through `slotProps`. Structural keys include:

- Month: `monthRoot`, `monthCorner`, `monthWeekdayHeader`, `monthWeekdayLabel`, `monthRowHeaderGutter`, `monthItemWrapper`.
- Week: `weekRoot`, `weekContent`, `weekGrid`, `weekHeader`, `weekHeaderLabel`, `weekColumn`, `weekTimeSlotLayer`, `weekDraggableEntry`, `weekResizeHandle`, `weekEntryTimePreview`, `weekEntryTimePreviewLabel`, `weekRowHeaderGutter`, `weekRowHeaderCorner`, `weekRowHeaderCell`.

Interactive Week View structural event props are composed after package handlers. This keeps selection, drag/drop, move, and resize behavior intact while allowing consumer analytics and additional behavior. Non-event structural props continue to follow normal MUI prop precedence.

### Theme Overrides

Theme component names use the `CALENDAR_` prefix. The most commonly customized names are `CALENDAR_CalendarItem`, `CALENDAR_CalendarMonthView`, and `CALENDAR_CalendarWeekView`.

```js
const theme = createTheme({
	components: {
		CALENDAR_CalendarItem: {
			styleOverrides: { root: { borderRadius: 8 } },
		},
		CALENDAR_CalendarWeekView: {
			styleOverrides: {
				keyboardTimeSlot: ({ theme }) => ({
					outlineColor: theme.palette.primary.main,
				}),
			},
		},
	},
});
```

The keyboard Time Slot is package-owned and has no component slot or `slotProps` key. Style it with `CALENDAR_CalendarWeekView.styleOverrides.keyboardTimeSlot`.

The complete theme and structural slot map is in `CALENDAR_PACKAGE.md`.

## Localization

Chronocal does not set a global locale or timezone. Import the Day.js locale in the application, then use a provider or root prop:

```jsx
import "dayjs/locale/de";
import { CalendarLocalizationProvider, CalendarRoot } from "@lucasloe/chronocal";

<CalendarLocalizationProvider locale='de'>
	<CalendarRoot entries={entries} />
</CalendarLocalizationProvider>;
```

`CalendarRoot locale` overrides the nearest provider. Locale affects date text in titles, headers, previews, and keyboard labels; times use fixed `HH:mm` formatting. Work-hour preset labels and the default month week-number prefix are static package strings.

Chronocal always uses ISO weeks beginning Monday. Timezone conversion is not part of the public API; consuming applications own timezone policy.

## View Ranges

`calendar.range` and `getCalendarViewRange({ view, anchorDate })` return the full active period for loading data:

- Month: start and end of the calendar month.
- Week: start and end of the Monday-Sunday ISO week.

Hiding weekends does not narrow the range.

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
	useCalendar,
	useCalendarExternalDragSource,
	WORK_HOUR_PRESETS,
	WORK_HOUR_PRESET_OPTIONS,
} from "@lucasloe/chronocal";
```

## Current Limits

- Month and week views only.
- No all-day row, recurrence, multi-day month spanning, or built-in overflow summary.
- Two built-in work-hour presets; custom presets are not public.
- Entry move/resize is pointer-only.
- Native external drag support varies on mobile browsers.
- No public timezone conversion policy.
- No ARIA grid, row, or grid-cell structure.
- Plain-object `slotProps`; function-valued MUI slot props are not supported.

## Development

```bash
pnpm install
pnpm dev
pnpm test:run
pnpm lint
pnpm build
```

The demo is one integrated workspace backed by an in-memory ticket/worklog store. Its single `CalendarRoot` demonstrates:

- Week View drag/drop, move, resize, keyboard Time Slots, filtering, work hours, and Hour Height modes.
- Dense Month View cells, per-row headers, filtering, weekend changes, and internal overscroll.
- A persistent ticket rail and shared worklogs across both views.

Read `CALENDAR_LANGUAGE.md` for shared vocabulary and `CALENDAR_PACKAGE.md` for maintainer architecture and extension contracts.
