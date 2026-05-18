import { describe, expect, it } from "vitest";
import { calendarSampleEntries, getPalePastelColor } from "./calendarSampleData";

describe("calendar sample data colors", () => {
	it("maps the same project type to the same pale pastel color", () => {
		expect(getPalePastelColor("Produkt")).toBe(getPalePastelColor(" produkt "));
		expect(getPalePastelColor("Produkt")).toMatch(/^#[0-9a-f]{6}$/);
	});

	it("derives demo entry colors from their category", () => {
		for (const entry of calendarSampleEntries) {
			expect(entry.color).toBe(getPalePastelColor(entry.category));
		}
	});
});
