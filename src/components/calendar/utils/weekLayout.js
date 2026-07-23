import dayjs from "../../../lib/dayjs";
import { getEntriesForDateRange } from "./dateRange";
import { getCalendarEntryEnd } from "./entries";
import { getWeekPxPerMinute, getWeekVisibleRange, WEEK_HOUR_HEIGHT } from "./weekGeometry";

const MIN_ENTRY_HEIGHT = 18;

export function getWeekEntryRangeLayout({ start, end, date, workHours, hourHeight = WEEK_HOUR_HEIGHT }) {
	const { visibleStart, visibleEnd } = getWeekVisibleRange(date, workHours);
	const pxPerMinute = getWeekPxPerMinute(hourHeight);
	const clippedStart = dayjs(start).isBefore(visibleStart) ? visibleStart : dayjs(start);
	const clippedEnd = dayjs(end).isAfter(visibleEnd) ? visibleEnd : dayjs(end);
	const startMin = clippedStart.diff(visibleStart, "minute");
	const endMin = clippedEnd.diff(visibleStart, "minute");

	return {
		top: startMin * pxPerMinute,
		height: Math.max(MIN_ENTRY_HEIGHT, (endMin - startMin) * pxPerMinute),
	};
}

function layoutOverlappingEvents(events) {
	const groups = [];

	for (const event of events) {
		const currentGroup = groups.at(-1);

		if (!currentGroup || event.startMin >= currentGroup.endMin) {
			groups.push({ endMin: event.endMin, events: [event] });
		} else {
			currentGroup.events.push(event);
			currentGroup.endMin = Math.max(currentGroup.endMin, event.endMin);
		}
	}

	return groups.flatMap((group) => {
		const laneEnds = [];
		const withLanes = group.events.map((event) => {
			let laneIndex = laneEnds.findIndex((endMin) => endMin <= event.startMin);

			if (laneIndex === -1) {
				laneIndex = laneEnds.length;
			}

			laneEnds[laneIndex] = event.endMin;

			return { ...event, laneIndex };
		});

		const laneCount = Math.max(1, laneEnds.length);
		return withLanes.map((event) => ({ ...event, laneCount }));
	});
}

export function getWeekEntryLayouts({ entries, date, workHours, hourHeight = WEEK_HOUR_HEIGHT }) {
	const dayStart = dayjs(date).hour(workHours.startHour).minute(0).second(0);
	const dayEnd = dayjs(date)
		.hour(workHours.endHour === 24 ? 23 : workHours.endHour)
		.minute(59)
		.second(59);
	const { visibleStart, visibleEnd } = getWeekVisibleRange(date, workHours);

	const normalized = [];

	for (const entry of getEntriesForDateRange(entries, dayStart, dayEnd)) {
		const entryStart = dayjs(entry.start);
		const entryEnd = getCalendarEntryEnd(entry);
		const clippedStart = entryStart.isBefore(visibleStart) ? visibleStart : entryStart;
		const clippedEnd = entryEnd.isAfter(visibleEnd) ? visibleEnd : entryEnd;
		const startMin = clippedStart.diff(visibleStart, "minute");
		const endMin = clippedEnd.diff(visibleStart, "minute");

		if (endMin <= startMin) continue;

		normalized.push({
			...entry,
			clippedStart,
			clippedEnd,
			startMin,
			endMin,
		});
	}

	normalized.sort((left, right) => left.startMin - right.startMin);

	return layoutOverlappingEvents(normalized).map((entry) => {
		const { top, height } = getWeekEntryRangeLayout({
			start: entry.clippedStart,
			end: entry.clippedEnd,
			date,
			workHours,
			hourHeight,
		});
		const widthPercent = 100 / entry.laneCount;
		const leftPercent = widthPercent * entry.laneIndex;
		const layout = {
			top,
			height,
			width: `calc(${widthPercent}% - 4px)`,
			left: `calc(${leftPercent}% + 2px)`,
			laneIndex: entry.laneIndex,
			laneCount: entry.laneCount,
		};

		return { ...entry, layout };
	});
}
