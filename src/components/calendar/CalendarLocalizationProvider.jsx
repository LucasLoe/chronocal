import { CalendarLocalizationContext } from "./CalendarLocalizationContext";

export function CalendarLocalizationProvider({ children, locale }) {
	return (
		<CalendarLocalizationContext.Provider value={{ locale }}>
			{children}
		</CalendarLocalizationContext.Provider>
	);
}
