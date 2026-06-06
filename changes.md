# Calendar Package Deepening Opportunities

Architectural review notes for `src/components/calendar/`, using the vocabulary from `CALENDAR_PACKAGE.md` and the architecture terms from the codebase review prompt.

No project `CONTEXT.md`, `LANGUAGE.md`, or ADR files were present during review, so these candidates are based on `CALENDAR_PACKAGE.md` and the current calendar package Implementation.

## 1. Deepen The Week View Layout Module

**Files**: `src/components/calendar/CalendarGrid.jsx`, `src/components/calendar/utils/dateRange.js`, `src/components/calendar/utils/layout.js`, `CALENDAR_PACKAGE.md`

**Problem**: The week view Implementation in `CalendarGrid` mixes rendering, work-hour clipping, missing-end defaults, range filtering, minute-to-pixel math, and overlap lane packing. Understanding week layout requires reading `CalendarGrid.jsx`, `dateRange.js`, and `layout.js` together. The current Module has useful Depth, but too much unrelated knowledge is concentrated inside the render Implementation.

**Solution**: Move week event normalization, clipping, and lane placement behind a deeper calendar week layout Module. Keep rendering in `CalendarGrid`, but concentrate the layout rules behind a smaller Interface.

**Status**: Implemented in `src/components/calendar/utils/weekLayout.js` and covered by `src/components/calendar/utils/weekLayout.test.js`.

**Benefits**: This improves **locality** because bugs in overlap handling, work-hour clipping, and missing `end` handling live in one Implementation. It improves **leverage** because both week rendering and tests can use the same Module. The Interface becomes the test surface for hard cases like overlapping entries, entries crossing work hours, and missing `end`.

## 2. Deepen The Calendar Entry Data Model Module

**Files**: `src/components/calendar/CalendarRoot.jsx`, `src/components/calendar/CalendarGrid.jsx`, `src/components/calendar/CalendarItem.jsx`, `CALENDAR_PACKAGE.md`

**Problem**: The documented Interface accepts Day.js values, strings, and `Date` objects for `start`, but the default item renderer assumes `start.format(...)` exists. That mismatch is documented in `CALENDAR_PACKAGE.md`, but the Implementation leaks it to callers. Callers must either know this hidden invariant or provide a custom item Adapter.

**Solution**: Add a calendar entry normalization Module near the package seam so internal calendar rendering receives consistent date values while preserving caller data for slots.

**Status**: Implemented in `src/components/calendar/utils/entries.js` and covered by `src/components/calendar/utils/entries.test.js` plus `CalendarRoot.test.jsx`.

**Benefits**: This improves **locality** because date conversion and missing `end` defaults stop being scattered across filtering, layout, and rendering. It improves **leverage** because callers can rely on the documented entry Interface without needing a custom item Adapter just to avoid `start.format` failures. Tests can cover accepted input shapes through the same Interface consumers use.

## 3. Deepen The Calendar View Behaviour Module

**Files**: `src/components/calendar/CalendarRoot.jsx`, `src/components/calendar/CalendarGrid.jsx`, `src/components/calendar/utils/dateRange.js`, `src/App.jsx`, `CALENDAR_PACKAGE.md`

**Problem**: Month and week view behaviour is spread across constants, title formatting, navigation, visible dates, grid branching, controls, and docs. Adding another view would require coordinated edits in many places. The current view Interface is small, but its Implementation has weak locality.

**Solution**: Concentrate per-view behaviour into a deeper calendar view Module, with month and week as real Adapters at that seam.

**Status**: Implemented in `src/components/calendar/utils/views.js` and covered by `src/components/calendar/utils/views.test.js`. `CalendarGrid` intentionally remains the render switch between month and week views.

**Benefits**: This improves **locality** because title, navigation, visible dates, and render selection change together. It improves **leverage** because callers still choose a view with a small Interface, while the Implementation owns the view-specific rules. Tests can assert each view's calendar behaviour without rendering the whole grid.

## 4. Deepen The Calendar State Module

**Files**: `src/components/calendar/CalendarRoot.jsx`, `src/components/calendar/useCalendar.js`, `src/components/calendar/calendarContext.js`, `src/App.jsx`

**Problem**: `CalendarRoot` owns controlled/uncontrolled state, callback ordering, work-hour preset lookup, title calculation, visible dates, slot resolution, navigation, today, context value construction, and rendering. That makes `CalendarRoot` a high-friction Module: the Interface is broad and the Implementation is difficult to test except through render-heavy paths.

**Solution**: Concentrate calendar state transitions and derived calendar state into a deeper Module, leaving `CalendarRoot` mostly responsible for providing the seam and rendering the package shell.

**Status**: Implemented in `src/components/calendar/useCalendarState.js`.

**Benefits**: This improves **locality** for controlled/uncontrolled behaviour and callback sequencing. It improves **leverage** because navigation, today, work-hour resolution, and visible-date derivation can be tested through one Interface. Tests become less tied to MUI rendering and more focused on calendar state invariants.

## 5. Deepen The Slot Contract Module

**Files**: `src/components/calendar/CalendarRoot.jsx`, `src/components/calendar/CalendarCell.jsx`, `src/components/calendar/CalendarGrid.jsx`, `src/components/calendar/CalendarEntry.jsx`, `src/components/calendar/CalendarItem.jsx`, `src/components/calendar/utils/slots.js`, `CALENDAR_PACKAGE.md`

**Problem**: Slots are the strongest real seam in the package, but their `ownerState`, `item`, `entry`, and `layout` shapes are assembled in multiple places. Month item state and week item state are built separately. The slot Interface is documented, but the Implementation is duplicated and easy to drift.

**Solution**: Concentrate slot prop assembly into a deeper Module that owns the slot contract for month and week views.

**Status**: Implemented in `src/components/calendar/utils/slots.js` and covered at the rendered seam by `src/components/calendar/CalendarRoot.test.jsx`.

**Benefits**: This improves **locality** because changing slot data shape happens in one place. It improves **leverage** because custom item Adapters receive consistent facts across views. Tests can check the slot Interface directly instead of snapshotting large render trees.

## 6. Delete Or Deepen Shallow Pass-Through Modules Intentionally

**Files**: `src/components/calendar/CalendarProvider.jsx` (removed), `src/components/calendar/calendarContext.js`, `src/components/calendar/CalendarEntry.jsx`, `src/components/calendar/CalendarTopbar.jsx`, `src/components/calendar/index.js`

**Problem**: Several Modules are very Shallow. `CalendarProvider` is a one-line wrapper over context, `calendarContext` only creates context, `CalendarEntry` mostly forwards children into a styled box, and `CalendarTopbar` is a small layout primitive. The deletion test says some are not earning much Depth: deleting `CalendarProvider` would mostly remove ceremony. Deleting `CalendarEntry` or `CalendarTopbar` would move some style knowledge into callers, so they have modest leverage.

**Solution**: Decide which Shallow Modules are intentionally public package primitives, and either keep them documented as stable seams or fold the pure pass-through Modules into deeper Modules.

**Status**: Implemented by deleting the internal `CalendarProvider` pass-through Module. `CalendarEntry` and `CalendarTopbar` remain intentional public package primitives.

**Benefits**: This improves **locality** by reducing places an explorer must inspect to understand the package. It improves **leverage** by making exported Modules either meaningfully Deep or intentionally small Adapters. Tests become clearer because the public test surface matches the Modules that actually carry behaviour.
