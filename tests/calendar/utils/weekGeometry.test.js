import { describe, expect, it } from "vitest";
import {
	getResponsiveWeekHourHeight,
	resolveWeekLayout,
	WEEK_HOUR_HEIGHT,
} from "../../../src/components/calendar/utils/weekGeometry";

const workHours = { startHour: 6, endHour: 22 };

describe("week geometry", () => {
	it("uses the package hour height as the automatic minimum", () => {
		expect(resolveWeekLayout()).toEqual({ hourHeight: undefined, hourMinHeight: WEEK_HOUR_HEIGHT });
		expect(
			getResponsiveWeekHourHeight({ viewportHeight: 600, workHours, weekLayout: undefined }),
		).toBe(WEEK_HOUR_HEIGHT);
	});

	it("expands the hour height to fill the available viewport", () => {
		expect(
			getResponsiveWeekHourHeight({
				viewportHeight: 1642,
				workHours,
				weekLayout: { hourMinHeight: 52 },
			}),
		).toBe(100);
	});

	it("supports a smaller automatic minimum", () => {
		expect(
			getResponsiveWeekHourHeight({
				viewportHeight: 500,
				workHours,
				weekLayout: { hourMinHeight: 40 },
			}),
		).toBe(40);
	});

	it("uses an explicit hour height instead of viewport sizing", () => {
		expect(
			getResponsiveWeekHourHeight({
				viewportHeight: 2000,
				workHours,
				weekLayout: { hourHeight: 64, hourMinHeight: 80 },
			}),
		).toBe(64);
	});
});
