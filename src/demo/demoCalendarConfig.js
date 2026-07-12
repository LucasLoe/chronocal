import { DemoCalendarItem } from "./DemoCalendarItem";
import { CALENDAR_VIEWS } from "../components/calendar";

export const demoCalendarProps = {
	defaultView: CALENDAR_VIEWS.WEEK,
	defaultShowWeekend: false,
	defaultTimeSlotMinutes: 15,
	monthLayout: { cellMinWidth: 168, cellMinHeight: 184, weekdayHeaderHeight: 38 },
	showRowHeaders: ({ view, rowIndex }) => view === CALENDAR_VIEWS.WEEK || rowIndex % 2 === 0,
	slots: { item: DemoCalendarItem },
	slotProps: {
		weekRoot: { sx: { borderColor: "#d8cdbb" } },
		weekColumn: { sx: { bgcolor: "#fffdf7", borderColor: "#e4dac9" } },
		weekRowHeaderGutter: { sx: { bgcolor: "#f3ecdf", borderColor: "#d8cdbb" } },
		monthRoot: { sx: { bgcolor: "#fffdf7", borderColor: "#d8cdbb" } },
		monthWeekdayHeader: { sx: { bgcolor: "#f3ecdf", color: "#493b27", borderColor: "#d8cdbb" } },
		monthRowHeaderGutter: { sx: { bgcolor: "#f3ecdf", borderColor: "#d8cdbb" } },
		cell: { sx: { bgcolor: "#fffdf7", borderColor: "#e4dac9" } },
		cellHeader: { sx: { borderBottom: "1px solid #e4dac9" } },
		entry: { sx: { gap: 0.5, p: 0.5 } },
	},
	sx: { bgcolor: "#fffdf7" },
};

export const hourHeightModes = {
	comfortable: { label: "Auto · min 52", value: { hourMinHeight: 52 } },
	compact: { label: "Auto · min 38", value: { hourMinHeight: 38 } },
	fixed: { label: "Fixed · 72", value: { hourHeight: 72 } },
};
