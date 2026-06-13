import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "dayjs/locale/de";
import { describe, expect, it, vi } from "vitest";
import { CalendarCell } from "../../../src/components/calendar/CalendarCell";
import { CalendarItem } from "../../../src/components/calendar/CalendarItem";
import { CalendarMonthWeekdayHeader } from "../../../src/components/calendar/CalendarMonthWeekdayHeader";
import { CalendarRoot } from "../../../src/components/calendar/CalendarRoot";
import { CalendarWeekHeader } from "../../../src/components/calendar/CalendarWeekHeader";
import { useCalendar } from "../../../src/components/calendar/useCalendar";
import { useCalendarExternalDragSource } from "../../../src/components/calendar/utils/calendarDnd";
import { CALENDAR_VIEWS } from "../../../src/components/calendar/utils/views";

function TestItem({ item, ownerState }) {
	return (
		<div data-testid={`entry-${item.id}`} data-view={ownerState.view}>
			{item.start.format("HH:mm")} {item.title}
		</div>
	);
}

function ClickableTestItem({ item, onClick }) {
	return (
		<button type='button' data-testid={`entry-${item.id}`} onClick={onClick}>
			{item.title}
		</button>
	);
}

function WrappedCalendarItem(props) {
	return <CalendarItem {...props} data-testid={`wrapped-entry-${props.item.id}`} />;
}

function WrappedCalendarCell({ marker, ...props }) {
	return (
		<CalendarCell
			{...props}
			data-testid={`month-cell-${props.date.format("YYYY-MM-DD")}`}
			data-marker={marker}
		/>
	);
}

function WrappedMonthWeekdayHeader({ marker, ...props }) {
	return (
		<CalendarMonthWeekdayHeader
			{...props}
			data-testid={`month-weekday-${props.label}`}
			data-marker={marker}
		>
			{props.label} business
		</CalendarMonthWeekdayHeader>
	);
}

function WrappedWeekHeader({ marker, ...props }) {
	return (
		<CalendarWeekHeader
			{...props}
			data-testid={`week-header-${props.date.format("YYYY-MM-DD")}`}
			data-marker={marker}
		>
			{props.date.format("YYYY-MM-DD")} business
		</CalendarWeekHeader>
	);
}

function TestTimeSlotIndicator({ timeSlot }) {
	return (
		<div data-testid='time-slot-indicator'>
			{timeSlot.start.format("HH:mm")}-{timeSlot.end.format("HH:mm")}
		</div>
	);
}

function TestRowHeader({ ownerState }) {
	return (
		<div data-testid={`row-header-${ownerState.view}-${ownerState.rowIndex}`}>
			{ownerState.rowStart.format("YYYY-MM-DD HH:mm")}
		</div>
	);
}

function CalendarStateProbe() {
	const calendar = useCalendar();

	return (
		<button type='button' data-testid='time-slot-state' onClick={() => calendar.setTimeSlotMinutes(14)}>
			{calendar.timeSlotMinutes}
		</button>
	);
}

function CalendarTitleProbe() {
	const calendar = useCalendar();

	return <div data-testid='calendar-title'>{calendar.title}</div>;
}

function ExternalDragSource({ source }) {
	const { attributes, listeners, setNodeRef } = useCalendarExternalDragSource({
		id: source.id,
		source,
	});

	return (
		<button type='button' data-testid='external-drag-source' ref={setNodeRef} {...attributes} {...listeners}>
			{source.title}
		</button>
	);
}

function createRect(rect) {
	return {
		x: rect.left ?? 0,
		y: rect.top ?? 0,
		left: rect.left ?? 0,
		top: rect.top ?? 0,
		right: (rect.left ?? 0) + (rect.width ?? 0),
		bottom: (rect.top ?? 0) + (rect.height ?? 0),
		width: rect.width ?? 0,
		height: rect.height ?? 0,
		toJSON: () => {},
	};
}

function setupWeekDragGeometry(container) {
	const grid = container.querySelector('[data-calendar-week-grid="true"]');
	grid.getBoundingClientRect = () => createRect({ left: 0, top: 0, width: 700, height: 874 });

	for (const [index, column] of Array.from(
		container.querySelectorAll("[data-calendar-week-column]"),
	).entries()) {
		column.getBoundingClientRect = () =>
			createRect({ left: index * 100, top: 42, width: 100, height: 832 });
	}
}

function createDataTransfer() {
	const store = new Map();
	return {
		dropEffect: "none",
		effectAllowed: "all",
		get types() {
			return Array.from(store.keys());
		},
		setData(type, value) {
			store.set(type, value);
		},
		getData(type) {
			return store.get(type) || "";
		},
	};
}

function fireNativeDragEvent(element, type, { clientX = 0, clientY = 0, dataTransfer }) {
	const event = new Event(type, { bubbles: true, cancelable: true });
	Object.assign(event, { clientX, clientY, dataTransfer });

	fireEvent(element, event);
}

function dragPointer(element, { from, to }) {
	const activationPoint = {
		x: from.x + Math.sign(to.x - from.x || 1) * 4,
		y: from.y + Math.sign(to.y - from.y || 1) * 4,
	};

	fireEvent.pointerDown(element, {
		button: 0,
		clientX: from.x,
		clientY: from.y,
		isPrimary: true,
		pointerId: 1,
	});
	fireEvent.pointerMove(document, {
		button: 0,
		clientX: activationPoint.x,
		clientY: activationPoint.y,
		isPrimary: true,
		pointerId: 1,
	});
	fireEvent.pointerMove(document, {
		button: 0,
		clientX: to.x,
		clientY: to.y,
		isPrimary: true,
		pointerId: 1,
	});
	fireEvent.pointerUp(document, {
		button: 0,
		clientX: to.x,
		clientY: to.y,
		isPrimary: true,
		pointerId: 1,
	});
}

function dragPointerWithSingleMove(element, { from, to }) {
	fireEvent.pointerDown(element, {
		button: 0,
		clientX: from.x,
		clientY: from.y,
		isPrimary: true,
		pointerId: 1,
	});
	fireEvent.pointerMove(document, {
		button: 0,
		clientX: to.x,
		clientY: to.y,
		isPrimary: true,
		pointerId: 1,
	});
	fireEvent.pointerUp(document, {
		button: 0,
		clientX: to.x,
		clientY: to.y,
		isPrimary: true,
		pointerId: 1,
	});
}

function startDragPointer(element, { from, to }) {
	fireEvent.pointerDown(element, {
		button: 0,
		clientX: from.x,
		clientY: from.y,
		isPrimary: true,
		pointerId: 1,
	});
	fireEvent.pointerMove(document, {
		button: 0,
		clientX: from.x + Math.sign(to.x - from.x || 1) * 4,
		clientY: from.y + Math.sign(to.y - from.y || 1) * 4,
		isPrimary: true,
		pointerId: 1,
	});
	fireEvent.pointerMove(document, {
		button: 0,
		clientX: to.x,
		clientY: to.y,
		isPrimary: true,
		pointerId: 1,
	});
}

describe("CalendarRoot", () => {
	it("renders string and native Date entries through normalized slot items", () => {
		render(
			<CalendarRoot
				view={CALENDAR_VIEWS.MONTH}
				date='2026-05-18'
				entries={[
					{ id: "string", title: "String entry", start: "2026-05-18T09:00:00" },
					{ id: "date", title: "Date entry", start: new Date(2026, 4, 18, 10, 30) },
				]}
				slots={{ item: TestItem }}
			/>,
		);

		expect(screen.getByTestId("entry-string")).toHaveTextContent("09:00 String entry");
		expect(screen.getByTestId("entry-date")).toHaveTextContent("10:30 Date entry");
		expect(screen.getByTestId("entry-string")).toHaveAttribute("data-view", CALENDAR_VIEWS.MONTH);
	});

	it("formats package-owned labels with the root locale", () => {
		render(
			<CalendarRoot
				view={CALENDAR_VIEWS.MONTH}
				date='2026-05-18'
				entries={[{ id: "a", title: "A", start: "2026-05-18T10:00:00" }]}
				locale='de'
			>
				<CalendarTitleProbe />
			</CalendarRoot>,
		);

		expect(screen.getByTestId("calendar-title")).toHaveTextContent("Mai 2026");
		expect(screen.getAllByText("Mo").length).toBeGreaterThan(0);
		expect(screen.getByText("18")).toBeInTheDocument();
		expect(screen.getByText("10:00")).toBeInTheDocument();
	});

	it("passes week layout data to item slots", () => {
		const Item = vi.fn(({ item, layout }) => (
			<div data-testid={`entry-${item.id}`}>{layout.laneCount}</div>
		));

		render(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[
					{
						id: "a",
						title: "A",
						start: "2026-05-18T10:00:00",
						end: "2026-05-18T11:00:00",
					},
					{
						id: "b",
						title: "B",
						start: "2026-05-18T10:30:00",
						end: "2026-05-18T11:30:00",
					},
				]}
				slots={{ item: Item }}
			/>,
		);

		expect(screen.getByTestId("entry-a")).toHaveTextContent("2");
		expect(screen.getByTestId("entry-b")).toHaveTextContent("2");
		expect(Item).toHaveBeenCalledWith(
			expect.objectContaining({
				layout: expect.objectContaining({ laneCount: 2 }),
				ownerState: expect.objectContaining({ view: CALENDAR_VIEWS.WEEK }),
			}),
			undefined,
		);
	});

	it("passes item clicks to the root callback", () => {
		const handleItemClick = vi.fn();

		render(
			<CalendarRoot
				view={CALENDAR_VIEWS.MONTH}
				date='2026-05-18'
				entries={[{ id: "a", title: "A", start: "2026-05-18T10:00:00" }]}
				onItemClick={handleItemClick}
				slots={{ item: ClickableTestItem }}
			/>,
		);

		fireEvent.click(screen.getByTestId("entry-a"));

		expect(handleItemClick).toHaveBeenCalledWith(
			expect.objectContaining({ id: "a", title: "A" }),
		);
	});

	it("bounds dense month entries inside the month grid", () => {
		const Entry = vi.fn(({ children }) => <div>{children}</div>);
		const entries = Array.from({ length: 8 }, (_, index) => ({
			id: `dense-${index}`,
			title: `Dense ${index}`,
			start: "2026-05-18T09:00:00",
		}));

		const { container } = render(
			<CalendarRoot
				view={CALENDAR_VIEWS.MONTH}
				date='2026-05-18'
				entries={entries}
				slots={{ entry: Entry }}
			/>,
		);
		const denseEntryCall = Entry.mock.calls.find(([props]) => props.entries.length === 8);

		expect(container.querySelector('[data-calendar-month-grid="true"]')).toBeInTheDocument();
		expect(denseEntryCall[0].sx[0]).toEqual(
			expect.objectContaining({ flex: 1, minHeight: 0, overflow: "auto" }),
		);
	});

	it("keeps month headers sticky inside the package scroll container", () => {
		const { container } = render(
			<CalendarRoot
				view={CALENDAR_VIEWS.MONTH}
				date='2026-05-18'
				entries={[]}
				showRowHeaders={true}
			/>,
		);

		expect(container.querySelector('[data-calendar-month-weekday-header="Mo"]')).toHaveStyle({
			position: "sticky",
			top: "0px",
		});
		expect(container.querySelector('[data-calendar-month-row-header="2026-04-27"]')).toHaveStyle({
			position: "sticky",
			left: "0px",
		});
	});

	it("applies sx to native month and week structural slots", () => {
		const { container, rerender } = render(
			<CalendarRoot
				view={CALENDAR_VIEWS.MONTH}
				date='2026-05-18'
				entries={[]}
				slotProps={{
					monthWeekdayHeader: { sx: { minHeight: 44 } },
					monthRoot: { sx: { borderTopWidth: 3 } },
				}}
			/>,
		);

		expect(container.querySelector('[data-calendar-month-weekday-header="Mo"]')).toHaveStyle({
			minHeight: "44px",
		});
		expect(container.querySelector('[data-calendar-month-grid="true"]')).toHaveStyle({
			borderTopWidth: "3px",
		});

		rerender(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[]}
				slotProps={{
					weekColumn: { sx: { outlineStyle: "solid", outlineWidth: 4 } },
					weekHeader: { sx: { minHeight: 48 } },
				}}
			/>,
		);

		expect(container.querySelector('[data-calendar-week-column="2026-05-18"]')).toHaveStyle({
			outlineStyle: "solid",
			outlineWidth: "4px",
		});
		expect(container.querySelector('[data-calendar-week-header="2026-05-18"]')).toHaveStyle({
			minHeight: "48px",
		});
	});

	it("renders wrapped public month cell and weekday header slots", () => {
		render(
			<CalendarRoot
				view={CALENDAR_VIEWS.MONTH}
				date='2026-05-18'
				entries={[{ id: "a", title: "A", start: "2026-05-18T10:00:00" }]}
				slots={{ cell: WrappedCalendarCell, monthWeekdayHeader: WrappedMonthWeekdayHeader }}
				slotProps={{
					cell: { marker: "cell-slot" },
					monthWeekdayHeader: { marker: "weekday-slot" },
				}}
			/>,
		);

		expect(screen.getByTestId("month-cell-2026-05-18")).toHaveAttribute(
			"data-marker",
			"cell-slot",
		);
		expect(screen.getByTestId("month-cell-2026-05-18")).toHaveTextContent("A");
		expect(screen.getByTestId("month-weekday-Mo")).toHaveAttribute(
			"data-marker",
			"weekday-slot",
		);
		expect(screen.getByTestId("month-weekday-Mo")).toHaveTextContent("Mo business");
	});

	it("renders wrapped public week header slots", () => {
		render(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[]}
				slots={{ weekHeader: WrappedWeekHeader }}
				slotProps={{ weekHeader: { marker: "week-header-slot" } }}
			/>,
		);

		expect(screen.getByTestId("week-header-2026-05-18")).toHaveAttribute(
			"data-marker",
			"week-header-slot",
		);
		expect(screen.getByTestId("week-header-2026-05-18")).toHaveTextContent(
			"2026-05-18 business",
		);
	});

	it("keeps item clicks working when consumers wrap the public CalendarItem", () => {
		const handleItemClick = vi.fn();

		render(
			<CalendarRoot
				view={CALENDAR_VIEWS.MONTH}
				date='2026-05-18'
				entries={[{ id: "a", title: "A", start: "2026-05-18T10:00:00" }]}
				onItemClick={handleItemClick}
				slots={{ item: WrappedCalendarItem }}
			/>,
		);

		fireEvent.click(screen.getByTestId("wrapped-entry-a"));

		expect(handleItemClick).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }));
	});

	it("applies theme component overrides to CALENDAR-prefixed calendar components", () => {
		const theme = createTheme({
			components: {
				CALENDAR_CalendarItem: {
					styleOverrides: {
						root: {
							borderStyle: "solid",
							borderWidth: 3,
						},
					},
				},
				CALENDAR_CalendarWeekView: {
					styleOverrides: {
						column: {
							outlineStyle: "solid",
							outlineWidth: 5,
						},
					},
				},
			},
		});

		const { container } = render(
			<ThemeProvider theme={theme}>
				<CalendarRoot
					view={CALENDAR_VIEWS.WEEK}
					date='2026-05-18'
					entries={[
						{
							id: "a",
							title: "Theme Override",
							start: "2026-05-18T10:00:00",
							end: "2026-05-18T11:00:00",
						},
					]}
				/>
			</ThemeProvider>,
		);

		expect(container.querySelector('[data-calendar-week-column="2026-05-18"]')).toHaveStyle({
			outlineStyle: "solid",
			outlineWidth: "5px",
		});
		expect(container.querySelector('[data-calendar-week-entry="a"] > div')).toHaveStyle({
			borderStyle: "solid",
			borderWidth: "3px",
		});
	});

	it("renders and clicks snapped week time slots", () => {
		const handleTimeSlotClick = vi.fn();
		const { container } = render(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[]}
				timeSlotMinutes={30}
				onTimeSlotClick={handleTimeSlotClick}
				slots={{ timeSlotIndicator: TestTimeSlotIndicator }}
			/>,
		);
		const column = container.querySelector('[data-calendar-week-column="2026-05-18"]');
		column.getBoundingClientRect = () => ({ top: 0 });

		fireEvent.pointerMove(column, { clientY: 78 });

		expect(screen.getByTestId("time-slot-indicator")).toHaveTextContent("07:30-08:00");

		fireEvent.click(column, { clientY: 78 });

		expect(handleTimeSlotClick).toHaveBeenCalledWith(
			expect.objectContaining({
				start: expect.objectContaining({}),
				end: expect.objectContaining({}),
				timeSlotMinutes: 30,
			}),
		);
		expect(handleTimeSlotClick.mock.calls[0][0].start.format("HH:mm")).toBe("07:30");
		expect(handleTimeSlotClick.mock.calls[0][0].end.format("HH:mm")).toBe("08:00");
	});

	it("sets a minimum width on week columns for mobile scrolling", () => {
		const { container } = render(
			<CalendarRoot view={CALENDAR_VIEWS.WEEK} date='2026-05-18' entries={[]} />,
		);

		expect(container.querySelector('[data-calendar-week-view-grid="true"]')).toHaveStyle({
			minWidth: "982px",
		});
	});

	it("keeps week headers sticky inside the package scroll container", () => {
		const { container } = render(
			<CalendarRoot view={CALENDAR_VIEWS.WEEK} date='2026-05-18' entries={[]} />,
		);

		expect(container.querySelector('[data-calendar-week-header="2026-05-18"]')).toHaveStyle({
			position: "sticky",
			top: "0px",
		});
		expect(container.querySelector('[data-calendar-week-row-header-gutter="true"]')).toHaveStyle({
			position: "sticky",
			left: "0px",
		});
	});

	it("traps week entry hover before it reaches the time slot layer", () => {
		const { container } = render(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[
					{
						id: "a",
						title: "A",
						start: "2026-05-18T10:00:00",
						end: "2026-05-18T11:00:00",
					},
				]}
				timeSlotMinutes={30}
				slots={{ item: ClickableTestItem, timeSlotIndicator: TestTimeSlotIndicator }}
			/>,
		);
		const column = container.querySelector('[data-calendar-week-column="2026-05-18"]');
		const entry = container.querySelector('[data-calendar-week-entry="a"]');
		column.getBoundingClientRect = () => ({ top: 0 });

		fireEvent.pointerMove(column, { clientY: 78 });
		expect(screen.getByTestId("time-slot-indicator")).toHaveTextContent("07:30-08:00");

		fireEvent.pointerEnter(entry);
		expect(screen.queryByTestId("time-slot-indicator")).not.toBeInTheDocument();

		fireEvent.pointerMove(entry, { clientY: 130 });
		expect(screen.queryByTestId("time-slot-indicator")).not.toBeInTheDocument();
	});

	it("renders row headers through one slot for week and month rows", () => {
		const RowHeader = vi.fn(TestRowHeader);
		const { rerender } = render(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[]}
				slots={{ rowHeader: RowHeader }}
			/>,
		);

		expect(screen.getByTestId("row-header-week-0")).toHaveTextContent("06:00");
		expect(RowHeader).toHaveBeenCalledWith(
			expect.objectContaining({
				ownerState: expect.objectContaining({ view: CALENDAR_VIEWS.WEEK, rowIndex: 0 }),
			}),
			undefined,
		);

		rerender(
			<CalendarRoot
				view={CALENDAR_VIEWS.MONTH}
				date='2026-05-18'
				entries={[]}
				showRowHeaders={({ view }) => view === CALENDAR_VIEWS.MONTH}
				slots={{ rowHeader: RowHeader }}
			/>,
		);

		expect(screen.getByTestId("row-header-month-0")).toHaveTextContent("2026-04-27 00:00");
	});

	it("controls row header visibility and forwards row header slot props", () => {
		const RowHeader = vi.fn(({ ownerState, marker }) => (
			<div data-testid={`row-header-${ownerState.view}-${ownerState.rowIndex}`}>{marker}</div>
		));
		const { rerender } = render(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[]}
				showRowHeaders={false}
				slots={{ rowHeader: RowHeader }}
			/>,
		);

		expect(screen.queryByTestId("row-header-week-0")).not.toBeInTheDocument();

		rerender(
			<CalendarRoot
				view={CALENDAR_VIEWS.MONTH}
				date='2026-05-18'
				entries={[]}
				showRowHeaders={true}
				slots={{ rowHeader: RowHeader }}
				slotProps={{ rowHeader: { marker: "row" } }}
			/>,
		);

		expect(screen.getByTestId("row-header-month-0")).toHaveTextContent("row");
		expect(RowHeader).toHaveBeenCalledWith(
			expect.objectContaining({
				marker: "row",
				ownerState: expect.objectContaining({
					view: CALENDAR_VIEWS.MONTH,
					rowIndex: 0,
					dates: expect.any(Array),
				}),
			}),
			undefined,
		);
	});

	it("normalizes controlled and uncontrolled time slot minute state", () => {
		const handleTimeSlotMinutesChange = vi.fn();
		const { rerender } = render(
			<CalendarRoot
				entries={[]}
				defaultTimeSlotMinutes={14}
				onTimeSlotMinutesChange={handleTimeSlotMinutesChange}
			>
				<CalendarStateProbe />
			</CalendarRoot>,
		);

		expect(screen.getByTestId("time-slot-state")).toHaveTextContent("15");
		fireEvent.click(screen.getByTestId("time-slot-state"));
		expect(handleTimeSlotMinutesChange).toHaveBeenCalledWith(15);

		rerender(
			<CalendarRoot entries={[]} timeSlotMinutes={29}>
				<CalendarStateProbe />
			</CalendarRoot>,
		);

		expect(screen.getByTestId("time-slot-state")).toHaveTextContent("30");
	});

	it("renders week entries without committing pointer changes before movement", () => {
		const handleEntryTimeChange = vi.fn();
		const { container } = render(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[
					{
						id: "a",
						title: "A",
						start: "2026-05-18T10:00:00",
						end: "2026-05-18T11:00:00",
					},
				]}
				timeSlotMinutes={30}
				onEntryTimeChange={handleEntryTimeChange}
				slots={{ item: ClickableTestItem }}
			/>,
		);
		const entry = container.querySelector('[data-calendar-week-entry="a"]');

		fireEvent.pointerDown(entry, { button: 0, clientX: 50, clientY: 260, pointerId: 1 });
		fireEvent.pointerUp(document, { button: 0, clientX: 50, clientY: 260, pointerId: 1 });

		expect(handleEntryTimeChange).not.toHaveBeenCalled();
	});

	it("keeps week item clicks separate from pointer movement", () => {
		const handleEntryTimeChange = vi.fn();
		const handleItemClick = vi.fn();
		render(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[
					{
						id: "a",
						title: "A",
						start: "2026-05-18T10:00:00",
						end: "2026-05-18T11:00:00",
					},
				]}
				timeSlotMinutes={30}
				onEntryTimeChange={handleEntryTimeChange}
				onItemClick={handleItemClick}
				slots={{ item: ClickableTestItem }}
			/>,
		);
		fireEvent.click(screen.getByTestId("entry-a"));

		expect(handleEntryTimeChange).not.toHaveBeenCalled();
		expect(handleItemClick).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }));
	});

	it("renders week resize handles without committing pointer changes before movement", () => {
		const handleEntryTimeChange = vi.fn();
		const { container } = render(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[
					{
						id: "a",
						title: "A",
						start: "2026-05-18T10:00:00",
						end: "2026-05-18T11:00:00",
					},
				]}
				timeSlotMinutes={30}
				onEntryTimeChange={handleEntryTimeChange}
				slots={{ item: ClickableTestItem }}
			/>,
		);
		const startHandle = container.querySelector('[data-calendar-week-resize-handle="a-start"]');
		const endHandle = container.querySelector('[data-calendar-week-resize-handle="a-end"]');

		fireEvent.pointerDown(startHandle, { button: 0, clientX: 50, clientY: 252, pointerId: 1 });
		fireEvent.pointerUp(document, { button: 0, clientX: 50, clientY: 252, pointerId: 1 });
		fireEvent.pointerDown(endHandle, { button: 0, clientX: 50, clientY: 302, pointerId: 1 });
		fireEvent.pointerUp(document, { button: 0, clientX: 50, clientY: 302, pointerId: 1 });

		expect(handleEntryTimeChange).not.toHaveBeenCalled();
	});

	it("moves week entries with pointer events using snapped week geometry", async () => {
		const handleEntryTimeChange = vi.fn();
		const { container } = render(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[
					{
						id: "a",
						title: "A",
						start: "2026-05-18T10:00:00",
						end: "2026-05-18T11:00:00",
					},
				]}
				timeSlotMinutes={30}
				onEntryTimeChange={handleEntryTimeChange}
				slots={{ item: ClickableTestItem }}
			/>,
		);
		setupWeekDragGeometry(container);

		dragPointer(container.querySelector('[data-calendar-week-entry="a"]'), {
			from: { x: 50, y: 260 },
			to: { x: 150, y: 364 },
		});

		await waitFor(() => expect(handleEntryTimeChange).toHaveBeenCalledTimes(1));
		expect(handleEntryTimeChange.mock.calls[0][0]).toEqual(
			expect.objectContaining({ id: "a", action: "move" }),
		);
		expect(handleEntryTimeChange.mock.calls[0][0].start.format("YYYY-MM-DDTHH:mm")).toBe(
			"2026-05-19T12:00",
		);
		expect(handleEntryTimeChange.mock.calls[0][0].end.format("YYYY-MM-DDTHH:mm")).toBe(
			"2026-05-19T13:00",
		);
	});

	it("drops external drag sources onto week columns with calendar-owned payloads", async () => {
		const source = { id: "template-a", title: "Template A" };
		const handleExternalItemDrop = vi.fn();
		const { container } = render(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[]}
				timeSlotMinutes={30}
				onExternalItemDrop={handleExternalItemDrop}
			>
				<ExternalDragSource source={source} />
			</CalendarRoot>,
		);
		setupWeekDragGeometry(container);
		const dataTransfer = createDataTransfer();
		const column = container.querySelector('[data-calendar-week-column="2026-05-18"]');

		fireNativeDragEvent(screen.getByTestId("external-drag-source"), "dragstart", { dataTransfer });
		fireNativeDragEvent(column, "dragover", { clientX: 50, clientY: 250, dataTransfer });
		fireNativeDragEvent(column, "drop", { clientX: 50, clientY: 250, dataTransfer });

		await waitFor(() => expect(handleExternalItemDrop).toHaveBeenCalledTimes(1));
		const payload = handleExternalItemDrop.mock.calls[0][0];
		expect(payload).toEqual(
			expect.objectContaining({
				source,
				view: "week",
				timeSlotMinutes: 30,
			}),
		);
		expect(payload.start.format("YYYY-MM-DDTHH:mm")).toBe("2026-05-18T10:00");
		expect(payload.end.format("YYYY-MM-DDTHH:mm")).toBe("2026-05-18T11:00");
		expect(payload.date.format("YYYY-MM-DD")).toBe("2026-05-18");
		expect(payload.timeSlot.start.format("HH:mm")).toBe("10:00");
		expect(payload).not.toHaveProperty("active");
		expect(payload).not.toHaveProperty("over");
	});

	it("ignores external drag sources dropped outside week columns", async () => {
		const handleExternalItemDrop = vi.fn();
		const { container } = render(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[]}
				onExternalItemDrop={handleExternalItemDrop}
			>
				<ExternalDragSource source={{ id: "template-a", title: "Template A" }} />
			</CalendarRoot>,
		);
		setupWeekDragGeometry(container);
		const dataTransfer = createDataTransfer();

		fireNativeDragEvent(screen.getByTestId("external-drag-source"), "dragstart", { dataTransfer });
		fireNativeDragEvent(container.querySelector('[data-calendar-week-grid="true"]'), "drop", {
			clientX: 750,
			clientY: 250,
			dataTransfer,
		});

		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(handleExternalItemDrop).not.toHaveBeenCalled();
	});

	it("resizes week entries from handles without activating move", async () => {
		const handleEntryTimeChange = vi.fn();
		const { container } = render(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[
					{
						id: "a",
						title: "A",
						start: "2026-05-18T10:00:00",
						end: "2026-05-18T11:00:00",
					},
				]}
				timeSlotMinutes={30}
				onEntryTimeChange={handleEntryTimeChange}
				slots={{ item: ClickableTestItem }}
			/>,
		);
		setupWeekDragGeometry(container);

		dragPointer(container.querySelector('[data-calendar-week-resize-handle="a-start"]'), {
			from: { x: 50, y: 252 },
			to: { x: 50, y: 224 },
		});

		await waitFor(() => expect(handleEntryTimeChange).toHaveBeenCalledTimes(1));
		expect(handleEntryTimeChange.mock.calls[0][0].action).toBe("resize-start");
		expect(handleEntryTimeChange.mock.calls[0][0].start.format("HH:mm")).toBe("09:30");
		expect(handleEntryTimeChange.mock.calls[0][0].end.format("HH:mm")).toBe("11:00");
	});

	it("shrinks week entries when resizing inward inside the entry bounds", async () => {
		const handleEntryTimeChange = vi.fn();
		const { container, rerender } = render(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[
					{
						id: "a",
						title: "A",
						start: "2026-05-18T10:00:00",
						end: "2026-05-18T11:00:00",
					},
				]}
				timeSlotMinutes={30}
				onEntryTimeChange={handleEntryTimeChange}
				slots={{ item: ClickableTestItem }}
			/>,
		);
		setupWeekDragGeometry(container);

		dragPointerWithSingleMove(container.querySelector('[data-calendar-week-resize-handle="a-start"]'), {
			from: { x: 50, y: 252 },
			to: { x: 50, y: 276 },
		});

		await waitFor(() => expect(handleEntryTimeChange).toHaveBeenCalledTimes(1));
		expect(handleEntryTimeChange.mock.calls[0][0].action).toBe("resize-start");
		expect(handleEntryTimeChange.mock.calls[0][0].start.format("HH:mm")).toBe("10:30");
		expect(handleEntryTimeChange.mock.calls[0][0].end.format("HH:mm")).toBe("11:00");

		handleEntryTimeChange.mockClear();
		rerender(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[
					{
						id: "a",
						title: "A",
						start: "2026-05-18T10:00:00",
						end: "2026-05-18T11:00:00",
					},
				]}
				timeSlotMinutes={30}
				onEntryTimeChange={handleEntryTimeChange}
				slots={{ item: ClickableTestItem }}
			/>,
		);
		setupWeekDragGeometry(container);

		dragPointerWithSingleMove(container.querySelector('[data-calendar-week-resize-handle="a-end"]'), {
			from: { x: 50, y: 302 },
			to: { x: 50, y: 250 },
		});

		await waitFor(() => expect(handleEntryTimeChange).toHaveBeenCalledTimes(1));
		expect(handleEntryTimeChange.mock.calls[0][0].action).toBe("resize-end");
		expect(handleEntryTimeChange.mock.calls[0][0].start.format("HH:mm")).toBe("10:00");
		expect(handleEntryTimeChange.mock.calls[0][0].end.format("HH:mm")).toBe("10:30");
	});

	it("suppresses time slot hover while a week entry drag is active", async () => {
		const { container } = render(
			<CalendarRoot
				view={CALENDAR_VIEWS.WEEK}
				date='2026-05-18'
				entries={[
					{
						id: "a",
						title: "A",
						start: "2026-05-18T10:00:00",
						end: "2026-05-18T11:00:00",
					},
				]}
				timeSlotMinutes={30}
				onEntryTimeChange={() => {}}
				onTimeSlotClick={() => {}}
				slots={{ item: ClickableTestItem, timeSlotIndicator: TestTimeSlotIndicator }}
			/>,
		);
		setupWeekDragGeometry(container);
		const column = container.querySelector('[data-calendar-week-column="2026-05-18"]');

		startDragPointer(container.querySelector('[data-calendar-week-entry="a"]'), {
			from: { x: 50, y: 260 },
			to: { x: 50, y: 312 },
		});
		fireEvent.pointerMove(column, { clientX: 50, clientY: 130, isPrimary: true, pointerId: 1 });

		await waitFor(() =>
			expect(container.querySelector('[data-calendar-week-entry-time-preview="a"]')).toBeInTheDocument(),
		);
		expect(screen.queryByTestId("time-slot-indicator")).not.toBeInTheDocument();
		fireEvent.pointerUp(document, { clientX: 50, clientY: 312, isPrimary: true, pointerId: 1 });
	});
});
