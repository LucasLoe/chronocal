# Chronocal Calendar Language

Shared package vocabulary for calendar concepts. Use these terms when naming Modules, props, slots, tests, and docs.

## Calendar Cell

A rendered area that represents one unit in a calendar view. In month view this is a date cell. In week view this is a day column segment inside the time-based grid.

## Calendar Row

A horizontal set of Calendar Cells. Calendar Rows can exist in any view. They are not inherently time-based.

## Calendar View Range

The date range represented by the active view for data loading, reporting, and sidebars. Week view ranges use ISO week start/end. Month view ranges use calendar month start/end.

## Row Header

Optional rendered content associated with a Calendar Row. A Row Header is supplied through the `rowHeader` slot and receives row context through `ownerState`.

Row Headers are not labels arrays. The package provides a render seam so consumers can render whatever belongs there.

When `showRowHeaders` is a function, it is evaluated independently for every Calendar Row.

## Row Header Gutter

The optional leading area before Calendar Cells where Row Headers are rendered. In week view the default Row Header Gutter shows hour markers. In month view consumers may enable Row Headers to render week numbers, totals, icons, or any other row-specific content.

If only some Row Headers are visible, empty gutter cells preserve Calendar Row alignment.

## Entry

A consumer-provided calendar item with an `id`, `title`, `start`, optional `end`, and optional display metadata. Entries are normalized internally before rendering.

Chronocal validates Entries before rendering. An omitted or `undefined` `end` is valid and has an effective one-hour duration where a range is required.

## Entry Range

The time interval occupied by an Entry: `{ start, end }`.

## Entry Time Change

A proposed change to an Entry Range emitted by the package through `onEntryTimeChange`.

Supported actions:

- `move`
- `resize-start`
- `resize-end`

## Entry Time Preview

The internal ghost shown while moving or resizing an Entry. The preview uses the same proposed range that will be emitted through `onEntryTimeChange`.

## Time Slot

A week-only snapped interaction target inside the week grid. Time Slots are used for hover, click, move, and resize snapping.

A Time Slot contains `start`, `end`, `minutes`, `index`, `top`, and `height`.

Time Slots can be selected with a pointer or, when `onTimeSlotClick` is present, with package-owned keyboard controls.

## Keyboard Time Slot Control

A focusable Week View control that selects one Time Slot in a visible day. Arrow keys move between Time Slots and visible days; Enter emits the same selection payload as a pointer click.

The control is package-owned because it depends on Week View geometry. It is themeable but is not a replaceable component slot.

## Time Slot Minutes

The active Time Slot granularity in minutes. Supported values are `5`, `15`, `30`, and `60`.

## Hour Height

The Week View pixel height representing one hour. Time Slot, Entry, pointer, preview, and Row Header geometry derive from the same Hour Height.

When no exact Hour Height is supplied, Chronocal expands it to fill the bounded calendar viewport without going below the configured minimum.

## Work Hour Preset

A current week-view preset that configures which time-based Calendar Rows are rendered by default. This is one package Adapter for week row generation, not the Row Header abstraction itself.

## Month View

A date-grid view. Month view does not use Time Slots. Month Row Headers are optional through the same `rowHeader` slot.

## Week View

A time-grid view. Week view supports Time Slots, Entry Time Changes, Entry Time Previews, and default Row Headers for hour markers.

## External Drag Source

A caller-owned value made draggable outside the calendar and dropped into the Week View. External Drag Sources are exposed to `onExternalItemDrop` as `source`; native browser drag details remain package-owned.
