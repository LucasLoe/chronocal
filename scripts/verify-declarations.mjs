import { readFileSync } from "node:fs";
import { parse } from "@babel/parser";

const declarations = readFileSync("src/components/calendar/index.d.ts", "utf8");
const ast = parse(declarations, {
	sourceType: "module",
	plugins: [["typescript", { dts: true }]],
});

const exportedNames = new Set(
	ast.program.body.flatMap((node) => {
		if (node.type !== "ExportNamedDeclaration") {
			return [];
		}
		if (!node.declaration) {
			return node.specifiers.map((specifier) => specifier.exported.name);
		}
		if (node.declaration.type === "VariableDeclaration") {
			return node.declaration.declarations.flatMap((declaration) =>
				declaration.id.type === "Identifier" ? [declaration.id.name] : [],
			);
		}
		return node.declaration.id?.name ? [node.declaration.id.name] : [];
	}),
);
const requiredRuntimeDeclarations = [
	"CalendarCell",
	"CalendarCellHeader",
	"CalendarEntry",
	"CalendarGrid",
	"CalendarItem",
	"CalendarLocalizationProvider",
	"CalendarMonthWeekdayHeader",
	"CalendarRoot",
	"CalendarRowHeader",
	"CalendarTimeSlotIndicator",
	"CalendarTopbar",
	"CalendarWeekHeader",
	"CALENDAR_VIEWS",
	"getCalendarViewRange",
	"TIME_SLOT_MINUTE_OPTIONS",
	"useCalendar",
	"useCalendarExternalDragSource",
	"WORK_HOUR_PRESETS",
	"WORK_HOUR_PRESET_OPTIONS",
];
const missingDeclarations = requiredRuntimeDeclarations.filter((name) => !exportedNames.has(name));

if (missingDeclarations.length > 0) {
	throw new Error(`Public declarations are missing runtime exports: ${missingDeclarations.join(", ")}`);
}

console.log(
	`Parsed public TypeScript declarations and verified ${requiredRuntimeDeclarations.length} runtime exports.`,
);
