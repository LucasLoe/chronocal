import { execFileSync } from "node:child_process";

const output = execFileSync("npm", ["--silent", "pack", "--dry-run", "--json"], {
	encoding: "utf8",
	stdio: ["ignore", "pipe", "inherit"],
});
const jsonStart = output.lastIndexOf("\n[");
const [report] = JSON.parse(output.slice(jsonStart === -1 ? 0 : jsonStart + 1));
const files = new Set(report.files.map((file) => file.path));
const requiredFiles = [
	"dist/index.js",
	"src/components/calendar/index.js",
	"src/components/calendar/index.d.ts",
	"src/components/calendar/CalendarRoot.jsx",
	"src/components/calendar/CalendarWeekView.jsx",
	"src/components/calendar/utils/validation.js",
	"src/lib/dayjs.js",
	"README.md",
	"CALENDAR_LANGUAGE.md",
	"CALENDAR_PACKAGE.md",
	"CHANGELOG.md",
	"LICENSE",
];
const missingFiles = requiredFiles.filter((file) => !files.has(file));

if (missingFiles.length > 0) {
	throw new Error(`Package is missing required readable files:\n${missingFiles.join("\n")}`);
}

const sourceFileCount = report.files.filter((file) =>
	file.path.startsWith("src/components/calendar/"),
).length;

if (sourceFileCount < 20) {
	throw new Error(`Expected readable calendar source, found only ${sourceFileCount} files.`);
}

console.log(
	`Verified ${report.files.length} packed files, including ${sourceFileCount} readable calendar source files.`,
);
