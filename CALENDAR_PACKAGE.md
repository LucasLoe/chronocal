# Chronocal Maintainer Guide

This guide explains how the package is organized and which contracts must remain stable. Consumer setup and examples belong in `README.md`; shared terminology belongs in `CALENDAR_LANGUAGE.md`; public TypeScript shapes live in `src/components/calendar/index.d.ts`.

## Package Map

| Area | Location |
| --- | --- |
| Public calendar source | `src/components/calendar/` |
| Public exports | `src/components/calendar/index.js` |
| Public declarations | `src/components/calendar/index.d.ts` |
| Day.js setup | `src/lib/dayjs.js` |
| Demo | `src/App.jsx`, `src/demo/` |
| Unit tests | `tests/calendar/utils/` |
| Integration tests | `tests/calendar/integration/CalendarRoot.test.jsx` |

The package is React + MUI, uses Day.js for date work, and ships ESM from `dist/index.js`.

The demo uses one normalized in-memory ticket/worklog store and one `CalendarRoot`. Keep package options in the inspectable `demoCalendarProps` object; do not fork package behavior into demo-only calendar implementations.

## Component Flow

```txt
CalendarRoot
├─ CalendarLocalizationProvider
├─ CalendarContext.Provider
├─ caller children, usually CalendarTopbar controls
└─ CalendarGrid
   ├─ CalendarMonthView
   │  ├─ CalendarMonthWeekdayHeader
   │  ├─ optional Row Header Gutter
   │  └─ CalendarCell
   │     ├─ CalendarCellHeader
   │     └─ CalendarEntry → CalendarItem
   └─ CalendarWeekView
      ├─ optional Row Header Gutter
      ├─ CalendarWeekHeader
      ├─ package-owned keyboard Time Slot controls
      └─ day columns → positioned CalendarEntry items
```

`CalendarGrid` is only the active-view switch and scroll container. View rendering stays in explicit Month and Week components so inactive view work is not constructed.

## Responsibility Boundaries

### State

`useCalendarState.js` owns controlled/uncontrolled state, navigation, titles, visible dates, ranges, work-hour resolution, and Time Slot normalization.

State pairs:

- `view` / `defaultView`
- `date` / `defaultDate`
- `showWeekend` / `defaultShowWeekend`
- `workHoursPreset` / `defaultWorkHourPreset`
- `timeSlotMinutes` / `defaultTimeSlotMinutes`

Views and work-hour preset IDs are validated against exported package options. Invalid controlled values, defaults, and setter inputs use the same logged `[Chronocal]` error policy as invalid dates and entries.

`CalendarRoot` resolves localization and component slots, provides context, and passes rendering props to `CalendarGrid`. Remaining root props are forwarded to the grid scroll element, not the outer root.

### Date And Entry Modules

| Module | Responsibility |
| --- | --- |
| `utils/validation.js` | Fail-fast date and entry validation |
| `utils/entries.js` | Entry normalization and missing-end resolution |
| `utils/dateRange.js` | Visible dates, entry range filtering, work-hour presets |
| `utils/views.js` | View adapters, navigation, and public ranges |
| `CalendarLocalizationContext.js` | Locale-aware package formatting |

Use `src/lib/dayjs.js` for package date work. It registers `localizedFormat`, `isoWeek`, `utc`, and `timezone`, but does not set a locale or timezone.

### Week Interaction Modules

| Module | Responsibility |
| --- | --- |
| `utils/weekGeometry.js` | Minute/pixel conversion and visible geometry |
| `utils/timeSlots.js` | Time Slot normalization and index/pointer mapping |
| `utils/weekLayout.js` | Filtering, clipping, overlap lanes, and positioning |
| `utils/weekInteractions.js` | Time Slot and entry-range payload construction |
| `utils/weekDndInteractions.js` | Pointer lifecycle, previews, drops, and click suppression |
| `utils/calendarDnd.js` | Native external drag source registry and hook |
| `utils/itemEvents.js` | Item click composition and propagation |

Pointer listeners attached to `document` must always be removed on completion, cancellation, restart, and unmount. Never move that lifecycle into consumer slots.

## Data Contract

Required entry fields are `id`, `title`, and `start`; `end` and display metadata are optional. Custom fields must survive normalization.

Validation is synchronous and fail-fast:

- `entries` must be an array;
- each entry must be an object;
- `id` and `title` must be non-empty strings;
- `start` and a supplied `end` must be valid dates;
- `end` must be strictly after `start`; and
- IDs must be unique across the input.

Invalid root dates and `getCalendarViewRange()` anchors follow the same policy. Validation logs and throws an error prefixed with `[Chronocal]`.

An omitted or `undefined` `end` is valid. `getCalendarEntryEnd()` supplies an effective one-hour duration for filtering, layout, and interactions without adding an omitted `end` property to the normalized entry.

## View Invariants

### Month

- Uses complete ISO weeks intersecting the anchor month: 28, 35, or 42 dates.
- Hiding weekends removes Saturday and Sunday from each row.
- Entries render on their start date only.
- Month cells own dense-entry scrolling.
- `monthLayout` controls row-header width, cell minimum dimensions, and weekday track height.
- There is no all-day lane, multi-day spanning layout, or overflow summary.

### Week

- Uses Monday-Friday or Monday-Sunday columns.
- Filters entries by overlap with each visible day and work-hour range.
- Clips geometry to visible hours while retaining original normalized entry values.
- Uses equal-width lanes for overlap groups.
- Missing ends use a one-hour effective duration.
- Move and resize emit proposals; they never mutate entries.
- External drops propose a one-hour range.
- Without an explicit override, Hour Height expands to fill the bounded grid viewport and never falls below its configured minimum.

Week geometry defaults:

```js
WEEK_HOUR_HEIGHT = 52;
WEEK_HEADER_HEIGHT = 42;
ROW_HEADER_GUTTER_WIDTH = 58;
```

`weekLayout.hourMinHeight` controls the automatic floor and defaults to `WEEK_HOUR_HEIGHT`. `weekLayout.hourHeight` is an exact override that disables viewport sizing. `useWeekHourHeight.js` observes the grid viewport and resolves the effective value.

The effective Hour Height is the only time-to-pixel source of truth. Pass it explicitly through layout, Time Slot, pointer, preview, and keyboard calculations, and expose it to MUI slots through `ownerState.hourHeight`. Do not duplicate or independently style the ratio.

Keep geometry defaults in `utils/weekGeometry.js`; do not duplicate them in renderers.

## Row Headers

`showRowHeaders` accepts a boolean or a row predicate. A predicate is evaluated independently for every rendered row.

Month context:

```js
{ view: "month", rowIndex, rowStart, rowEnd, dates }
```

Week context:

```js
{ view: "week", rowIndex, rowStart, rowEnd }
```

`rowEnd` is exclusive. Week rows are one hour and are anchored to the first visible date.

If at least one row is visible, the gutter remains present for all rows. Rows returning `false` render an empty aligned gutter cell. If every row is hidden, the gutter and corner are omitted.

Row Headers are render seams, not arrays of labels. Keep custom content behind `slots.rowHeader`.

## Keyboard Contract

Keyboard Time Slot controls exist only when `onTimeSlotClick` is provided.

- One focusable package-owned control is rendered per visible Week View day.
- Up and Down move by one configured Time Slot.
- Left and Right move to the adjacent visible day at the same slot index.
- Enter emits the same payload as pointer selection.
- Navigation clamps at work-hour and visible-day boundaries.
- The existing Time Slot indicator displays keyboard focus.
- Accessibility labels contain the localized full date and time range.

The keyboard control is package-owned because it depends on Week View geometry and selection state. It is themeable through `CALENDAR_CalendarWeekView.styleOverrides.keyboardTimeSlot`, but is not a component slot or native `slotProps` key.

Clickable default `CalendarItem` roots receive `role="button"`, `tabIndex={0}`, and Enter activation. A caller `onKeyDown` runs first and can cancel activation with `preventDefault()`.

Do not claim support for Space activation, Month View grid navigation, keyboard entry move/resize, or ARIA grid structure.

## Slots

Replaceable component slots:

```js
{
	cell,
	cellHeader,
	entry,
	item,
	monthWeekdayHeader,
	rowHeader,
	timeSlotIndicator,
	weekHeader,
}
```

Prefer wrapping public default components. Custom roots must forward package props, especially `sx`, positioning styles, children, class names, event handlers, `role`, `tabIndex`, and accessibility/data attributes.

The Week View column, keyboard Time Slot control, draggable wrapper, resize handles, and preview remain package-owned. Their geometry and event behavior must not move into replaceable components.

### Native Structural Keys

Month:

- `monthRoot`
- `monthCorner`
- `monthWeekdayHeader`
- `monthWeekdayLabel`
- `monthRowHeaderGutter`
- `monthItemWrapper`

Week:

- `weekRoot`
- `weekContent`
- `weekGrid`
- `weekHeader`
- `weekHeaderLabel`
- `weekColumn`
- `weekTimeSlotLayer`
- `weekDraggableEntry`
- `weekResizeHandle`
- `weekEntryTimePreview`
- `weekEntryTimePreviewLabel`
- `weekRowHeaderGutter`
- `weekRowHeaderCorner`
- `weekRowHeaderCell`

These accept at least `sx`. Interactive Week View handlers are composed package-first with consumer handlers so package-owned selection, drag/drop, move, and resize behavior cannot be replaced accidentally. Other arbitrary props follow normal MUI precedence.

## MUI Theme Contract

Theme component names:

- `CALENDAR_CalendarRoot`
- `CALENDAR_CalendarGrid`
- `CALENDAR_CalendarTopbar`
- `CALENDAR_CalendarMonthView`
- `CALENDAR_CalendarWeekView`
- `CALENDAR_CalendarCell`
- `CALENDAR_CalendarCellHeader`
- `CALENDAR_CalendarMonthWeekdayHeader`
- `CALENDAR_CalendarWeekHeader`
- `CALENDAR_CalendarEntry`
- `CALENDAR_CalendarItem`
- `CALENDAR_CalendarRowHeader`
- `CALENDAR_CalendarTimeSlotIndicator`

Style override slots:

| Component | Slots |
| --- | --- |
| Root, Grid, Topbar, Entry, TimeSlotIndicator | `root` |
| MonthView | `root`, `corner`, `rowHeaderGutter` |
| WeekView | `root`, `content`, `grid`, `column`, `entryTimePreview`, `entryTimePreviewLabel`, `timeSlotLayer`, `keyboardTimeSlot`, `draggableEntry`, `resizeHandle`, `rowHeaderGutter`, `rowHeaderCorner`, `rowHeaderCell` |
| Cell | `root`, `itemWrapper` |
| CellHeader | `root`, `weekday`, `day` |
| MonthWeekdayHeader, WeekHeader, RowHeader | `root`, `label` |
| Item | `root`, `time`, `title` |

Package-owned colors should use MUI theme tokens. Consumer-provided `entry.color` values are allowed.

## Localization Policy

The consuming application owns locale loading and timezone policy.

- The root `locale` prop overrides the nearest `CalendarLocalizationProvider`.
- The corresponding Day.js locale must already be imported.
- ISO weeks always begin Monday.
- Locale affects Day.js-derived date text in titles, headers, previews, and keyboard labels; times use fixed `HH:mm` formatting.
- Work-hour preset labels and the Month View `W` week-number prefix are static strings.
- Timezone conversion is not a public package feature.

MUI X `LocalizationProvider` does not configure Chronocal because Chronocal reads Day.js directly.

## Layout Contract

`CalendarRoot` fills a bounded flex parent. `CalendarGrid` owns scrolling with `flex: 1`, `minHeight: 0`, and `height: 0`.

Typical ancestor chain:

```txt
#root: height: 100vh
app: height: 100%; display: flex; flex-direction: column
content: flex: 1; min-height: 0
calendar wrapper: flex: 1; min-height: 0; display: flex
CalendarRoot: flex: 1; min-height: 0
```

Do not move calendar scrolling to the page body.

## Public Exports

Runtime exports are defined only in `src/components/calendar/index.js`. When changing the surface, update together:

1. `index.js`
2. `index.d.ts`
3. `README.md`
4. `CHANGELOG.md`
5. package tests

Readable source is published for inspection, but the supported runtime import is the package root.

## Testing And Validation

Tests live outside source:

- `tests/calendar/utils/entries.test.js`
- `tests/calendar/utils/eventHandlers.test.js`
- `tests/calendar/utils/validation.test.js`
- `tests/calendar/utils/weekLayout.test.js`
- `tests/calendar/utils/timeSlots.test.js`
- `tests/calendar/utils/weekInteractions.test.js`
- `tests/calendar/utils/weekGeometry.test.js`
- `tests/calendar/utils/itemEvents.test.js`
- `tests/calendar/utils/views.test.js`
- `tests/calendar/integration/CalendarRoot.test.jsx`
- `tests/demo/calendarSampleData.test.js`

Prefer pure utility tests for date, validation, geometry, and payload behavior. Use integration tests for rendered slot contracts and interactions. Avoid MUI snapshots.

Run after package changes:

```bash
pnpm verify
pnpm build:demo
pnpm verify:package
```

## Change Checklist

- Preserve controlled and uncontrolled behavior.
- Keep date validation and missing-end behavior consistent across views.
- Keep Week View geometry in utility modules.
- Keep the resolved Hour Height shared by rendering and interaction geometry.
- Keep pointer listeners unmount-safe.
- Keep pointer and keyboard Time Slot payloads equivalent.
- Preserve gutter alignment when filtering Row Headers.
- Forward required props through custom slots.
- Compose package-owned structural handlers before consumer handlers.
- Update declarations, consumer docs, vocabulary, changelog, and tests with public changes.
