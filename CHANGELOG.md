# Changelog

All notable changes to the Chronocal npm package are documented here.

This project follows Semantic Versioning. Changelog sections use Keep a Changelog-style headings so humans, release tooling, and AI agents can quickly identify package impact.

## 1.3.0 - 2026-07-23

### Changed

- Stabilized `CalendarRoot` and localization context values so consumers do not redraw when their calendar inputs are unchanged.
- Split per-day Week View rendering into an internal `WeekdayColumn` component without changing public exports, slots, or callback behavior.
- Moved generated demo output to the ignored `build` directory instead of committing bundled vendor code.
- Updated the demo to import calendar modules directly while package consumers continue to import from `@lucasloe/chronocal`.

### Fixed

- Month weekday headers now use stable ISO weekday identities instead of array-index keys.
- Time Slot state normalization now runs only during initial state creation.
- Removed an unused demo entry-update export.

### Performance

- Entry sorting now uses immutable `Array.prototype.toSorted()` without an intermediate spread copy.
- Week entry clipping and filtering now use one normalization pass instead of a chained map and filter.

### Security

- Added pnpm release-age and trust-downgrade policies to reduce dependency supply-chain risk.

### Stability

- Passed 76 tests across 11 test files, ESLint, package builds, runtime export checks, and declaration checks.
- Verified React Doctor reports no findings with a score of 100/100.

## 1.2.0 - 2026-07-12

### Added

- Added fail-fast validation for required calendar dates, entry shape, unique IDs, and valid entry ranges. Omitted or `undefined` entry ends remain valid.
- Added keyboard Week View Time Slot navigation when `onTimeSlotClick` is present. Arrow keys move through times and visible days; Enter emits the standard Time Slot payload.
- Added focus, button semantics, and Enter activation to clickable default `CalendarItem` instances.
- Added the `CALENDAR_CalendarWeekView.styleOverrides.keyboardTimeSlot` theme key.
- Added `weekLayout.hourMinHeight` for responsive viewport-filling Week View geometry and `weekLayout.hourHeight` for an exact fixed ratio.
- Added one shared-store demo workspace covering Week View scheduling/sizing and dense Month View overscroll through a single `CalendarRoot`.
- Added package-first composition for consumer handlers on interactive Week View structural slot props.

### Changed

- Function-valued `showRowHeaders` now works independently for every Month or Week View row instead of using only row zero.
- Missing entry `end` values remain valid and continue to use an effective one-hour duration without adding `end` to normalized entries.
- `useCalendarExternalDragSource().isDragging` now reflects the active native drag lifecycle.
- Unsupported views and work-hour preset IDs now log and throw instead of falling back to inconsistent rendered state.
- Week View now expands its Hour Height to fill the bounded viewport unless `weekLayout.hourHeight` supplies an exact value.
- Package-owned work-hour labels are now English or language-neutral instead of German.
- The package now declares support for Node.js 20.19 or newer.

### Fixed

- Active Week View pointer listeners are now removed when an interaction completes, is cancelled, restarts, or unmounts.
- Row Header Gutters now preserve alignment when a predicate hides only some rows.
- External drag registry entries are removed when their source unmounts.

### Accessibility

- Pointer and keyboard Week View Time Slot selection now share the same callback payload and visible indicator.
- Keyboard entry move/resize, Month View grid navigation, Space activation, and ARIA grid structure remain outside the current scope.

### Stability

- Passed 75 tests across 11 test files.
- Passed ESLint, package build, demo build, native ESM import, and declaration export checks.
- Verified the npm tarball contains `dist`, declarations, 35 readable calendar source files, the Day.js adapter, and package documentation.
- Installed the final tarball in an isolated consumer and verified package-root exports and readable source.

### Deferred

- Review `useCalendarExternalDragSource()` API stability. It uses native browser drag and drop, so `transform` remains `null` and `setNodeRef` remains a compatibility no-op; either give those fields native semantics or remove them in a future breaking release.

## 1.1.0 - 2026-06-26

### Added

- Added `CHANGELOG.md` to the published npm package for release notes, progress, and stability tracking.
- Added `calendar.range` to `useCalendar()` for the active view data range.
- Added `getCalendarViewRange({ view, anchorDate })` as a public helper for parent-level fetching, reports, and sidebars.
- Added `monthLayout` to `CalendarRoot` for semantic month grid sizing: `rowHeaderWidth`, `cellMinWidth`, `cellMinHeight`, and `weekdayHeaderHeight`.

### Fixed

- Suppressed immediate Time Slot clicks after External Drag Source drops and Entry Time Changes so consuming apps do not need local timestamp guards.

### Changed

- Published readable calendar source alongside the built ESM bundle so installed packages are locally discoverable in `node_modules`; runtime imports still point to `dist/index.js`.
- Documented `Calendar View Range` in the package language guide.
- Updated README and package guide documentation for the new range and month layout APIs.

### Stability

- Passed: `pnpm test:run`
- Passed: `pnpm lint`
- Passed: `pnpm build`
- Passed: `pnpm pack --dry-run`

## 1.0.0 - 2026-06-26

### Added

- Initial public package release with reusable React month and week calendar primitives.
- Supported controlled and uncontrolled calendar state for view, date, weekend visibility, work-hour preset, and Time Slot granularity.
- Supported MUI-style `slots`, `slotProps`, and `sx` customization.
- Supported week Time Slot click, item click, entry move, entry resize, ghost preview, and External Drag Sources.
- Supported package-owned German-capable Day.js localization through `CalendarLocalizationProvider` and `locale` props.
