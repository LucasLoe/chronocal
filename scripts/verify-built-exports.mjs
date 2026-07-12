const calendar = await import("../dist/index.js");
const requiredExports = [
	"CalendarCell",
	"CalendarCellHeader",
	"CalendarEntry",
	"CalendarGrid",
	"CalendarRoot",
	"CalendarItem",
	"CalendarLocalizationProvider",
	"CalendarMonthWeekdayHeader",
	"CalendarRowHeader",
	"CalendarTimeSlotIndicator",
	"CalendarTopbar",
	"CalendarWeekHeader",
	"useCalendar",
	"useCalendarExternalDragSource",
	"CALENDAR_VIEWS",
	"getCalendarViewRange",
	"TIME_SLOT_MINUTE_OPTIONS",
	"WORK_HOUR_PRESETS",
	"WORK_HOUR_PRESET_OPTIONS",
];
const missingExports = requiredExports.filter((name) => !(name in calendar));

if (missingExports.length > 0) {
	throw new Error(`Built package is missing exports: ${missingExports.join(", ")}`);
}

console.log(`Imported ${Object.keys(calendar).length} exports from dist/index.js.`);
