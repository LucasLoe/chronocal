import { useMemo } from "react";
import { CalendarLocalizationContext } from "./CalendarLocalizationContext";

export function CalendarLocalizationProvider({ children, locale }) {
	const value = useMemo(() => ({ locale }), [locale]);

	return (
		<CalendarLocalizationContext.Provider value={value}>
			{children}
		</CalendarLocalizationContext.Provider>
	);
}
