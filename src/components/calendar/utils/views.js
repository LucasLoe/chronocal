import dayjs from "../../../lib/dayjs";
import { getMonthViewDates, getWeekViewDates } from "./dateRange";

export const CALENDAR_VIEWS = {
	WEEK: "week",
	MONTH: "month",
};

const CALENDAR_VIEW_ADAPTERS = {
	[CALENDAR_VIEWS.MONTH]: {
		getVisibleDates: ({ anchorDate }) => getMonthViewDates(anchorDate),
		getNextAnchorDate: ({ anchorDate, direction }) => dayjs(anchorDate).add(direction, "month"),
	},
	[CALENDAR_VIEWS.WEEK]: {
		getVisibleDates: ({ anchorDate, showWeekend }) => getWeekViewDates(anchorDate, showWeekend),
		getNextAnchorDate: ({ anchorDate, direction }) => dayjs(anchorDate).add(direction, "week"),
	},
};

function getCalendarViewAdapter(view) {
	return CALENDAR_VIEW_ADAPTERS[view] || CALENDAR_VIEW_ADAPTERS[CALENDAR_VIEWS.WEEK];
}

export function getVisibleDates({ view, anchorDate, showWeekend }) {
	return getCalendarViewAdapter(view).getVisibleDates({ anchorDate, showWeekend });
}

export function getNextAnchorDate({ view, anchorDate, direction }) {
	return getCalendarViewAdapter(view).getNextAnchorDate({ anchorDate, direction });
}
