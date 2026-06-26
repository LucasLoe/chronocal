# Changelog

All notable changes to the Chronocal npm package are documented here.

This project follows Semantic Versioning. Changelog sections use Keep a Changelog-style headings so humans, release tooling, and AI agents can quickly identify package impact.

## Unreleased

### Deferred

- Review `useCalendarExternalDragSource()` API stability. It currently uses native browser drag and drop, so `isDragging` is always `false` and `transform` is always `null`; either implement meaningful native drag state or document/remove misleading fields before a future breaking release.

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
