import { useRef, useState } from "react";
import { getExternalCalendarDragSource, hasExternalCalendarDragSource } from "./calendarDnd";
import { getWeekTimeSlot } from "./timeSlots";
import { CALENDAR_VIEWS } from "./views";
import {
	createHoveredWeekTimeSlot,
	createWeekEntryTimeChange,
	createWeekEntryTimeInteraction,
	createWeekEntryTimePreview,
	createWeekTimeSlotClickPayload,
	createWeekTimeSlotFromPointerEvent,
	isSameHoveredWeekTimeSlot,
	trapWeekEntryPointerEvent,
	WEEK_ENTRY_TIME_ACTIONS,
} from "./weekInteractions";
import {
	getWeekBodyPointerY,
	getWeekBodyPointerYFromPoint,
	getWeekDateAtPoint,
	getWeekVisibleRange,
	WEEK_HOUR_HEIGHT,
} from "./weekGeometry";

const EXTERNAL_DROP_DURATION_MINUTES = 60;
const ENTRY_TIME_DRAG_THRESHOLD_PX = 2;
const INTERACTION_CLICK_SUPPRESSION_MS = 200;

function isSameEntryTimePreview(left, right) {
	return (
		left?.id === right?.id &&
		left?.action === right?.action &&
		left?.dateKey === right?.dateKey &&
		left?.start?.isSame(right?.start) &&
		left?.end?.isSame(right?.end)
	);
}

function hasMovedPastThreshold(interaction, point) {
	return (
		Math.abs(point.clientX - interaction.pointerStartX) > ENTRY_TIME_DRAG_THRESHOLD_PX ||
		Math.abs(point.clientY - interaction.pointerStartY) > ENTRY_TIME_DRAG_THRESHOLD_PX
	);
}

export function useWeekDndInteractions({
	dates,
	gridRef,
	locale,
	onEntryTimeChange,
	onExternalItemDrop,
	onTimeSlotClick,
	timeSlotMinutes,
	view,
	workHours,
}) {
	const activeEntryTimeInteractionRef = useRef(null);
	const activeEntryTimePreviewRef = useRef(null);
	const suppressNextItemClickRef = useRef(false);
	const suppressTimeSlotClickUntilRef = useRef(0);
	const [hoveredTimeSlot, setHoveredTimeSlot] = useState(null);
	const [activeEntryTimeId, setActiveEntryTimeId] = useState(null);
	const [activeEntryTimePreview, setActiveEntryTimePreview] = useState(null);

	const getTimeSlotFromEvent = (date, event) =>
		createWeekTimeSlotFromPointerEvent({
			date,
			event,
			workHours,
			timeSlotMinutes,
		});
	const getTimeSlotFromPoint = (date, point) => {
		const gridElement = gridRef.current;
		if (!gridElement) {
			return null;
		}

		return getWeekTimeSlot({
			date,
			pointerY: getWeekBodyPointerYFromPoint({ point, gridElement }),
			workHours,
			hourHeight: WEEK_HOUR_HEIGHT,
			timeSlotMinutes,
		});
	};
	const createExternalDropPayload = ({ source, date, point }) => {
		const timeSlot = getTimeSlotFromPoint(date, point);
		if (!timeSlot) {
			return null;
		}

		const { visibleEnd } = getWeekVisibleRange(date, workHours);
		const latestStart = visibleEnd.subtract(EXTERNAL_DROP_DURATION_MINUTES, "minute");
		const start = timeSlot.start.isAfter(latestStart) ? latestStart : timeSlot.start;
		const end = start.add(EXTERNAL_DROP_DURATION_MINUTES, "minute");

		return {
			source,
			date,
			start,
			end,
			view: CALENDAR_VIEWS.WEEK,
			timeSlotMinutes,
			timeSlot,
		};
	};
	const updateEntryTimePreview = (interaction, event) => {
		const gridElement = gridRef.current;
		if (!gridElement) {
			return null;
		}

		const targetDate =
			interaction.action === WEEK_ENTRY_TIME_ACTIONS.MOVE
				? getWeekDateAtPoint({ point: event, gridElement, dates })
				: interaction.date;
		const change = createWeekEntryTimeChange({
			interaction,
			date: targetDate,
			pointerY: getWeekBodyPointerY({ event, gridElement }),
			workHours,
			timeSlotMinutes,
		});
		const preview = createWeekEntryTimePreview({
			change,
			date: targetDate,
			locale,
			workHours,
		});
		const currentPreview = activeEntryTimePreviewRef.current;

		if (isSameEntryTimePreview(currentPreview, preview)) {
			return currentPreview;
		}

		activeEntryTimePreviewRef.current = preview;
		setActiveEntryTimePreview(preview);
		return preview;
	};
	const clearEntryTimeInteraction = () => {
		activeEntryTimeInteractionRef.current = null;
		activeEntryTimePreviewRef.current = null;
		setActiveEntryTimeId(null);
		setActiveEntryTimePreview(null);
	};
	const suppressImmediateTimeSlotClick = () => {
		suppressTimeSlotClickUntilRef.current = Date.now() + INTERACTION_CLICK_SUPPRESSION_MS;
	};
	const startEntryTimeInteraction = ({ action, date, disabled, entry }) => (event) => {
		if (disabled || !onEntryTimeChange || event.button !== 0) {
			return;
		}
		event.preventDefault();
		trapWeekEntryPointerEvent(event);

		const gridElement = gridRef.current;
		if (!gridElement) {
			return;
		}

		const startPoint = { clientX: event.clientX, clientY: event.clientY };
		const interaction = createWeekEntryTimeInteraction({
			action,
			entry,
			date,
			pointerY: getWeekBodyPointerYFromPoint({ point: startPoint, gridElement }),
			pointerStartX: event.clientX,
			pointerStartY: event.clientY,
			timeSlotMinutes,
		});
		activeEntryTimeInteractionRef.current = interaction;
		activeEntryTimePreviewRef.current = null;
		setActiveEntryTimeId(entry.id);
		setActiveEntryTimePreview(null);

		const handlePointerMove = (moveEvent) => {
			const currentInteraction = activeEntryTimeInteractionRef.current;
			if (!currentInteraction) {
				return;
			}

			const point = { clientX: moveEvent.clientX, clientY: moveEvent.clientY };
			if (!hasMovedPastThreshold(currentInteraction, point)) {
				return;
			}

			currentInteraction.hasMoved = true;
			setHoveredTimeSlot(null);
			updateEntryTimePreview(currentInteraction, point);
		};
		const handlePointerUp = (upEvent) => {
			document.removeEventListener("pointermove", handlePointerMove);
			document.removeEventListener("pointerup", handlePointerUp);
			document.removeEventListener("pointercancel", handlePointerCancel);

			const currentInteraction = activeEntryTimeInteractionRef.current;
			const currentPreview = activeEntryTimePreviewRef.current;
			clearEntryTimeInteraction();

			if (!currentInteraction || !currentInteraction.hasMoved) {
				return;
			}

			const point = { clientX: upEvent.clientX, clientY: upEvent.clientY };
			const preview = currentPreview || updateEntryTimePreview(currentInteraction, point);
			if (!preview) {
				return;
			}

			suppressNextItemClickRef.current = true;
			suppressImmediateTimeSlotClick();
			onEntryTimeChange({
				id: preview.id,
				start: preview.start,
				end: preview.end,
				entry: preview.entry,
				action: preview.action,
			});
		};
		const handlePointerCancel = () => {
			document.removeEventListener("pointermove", handlePointerMove);
			document.removeEventListener("pointerup", handlePointerUp);
			document.removeEventListener("pointercancel", handlePointerCancel);
			clearEntryTimeInteraction();
		};

		document.addEventListener("pointermove", handlePointerMove);
		document.addEventListener("pointerup", handlePointerUp);
		document.addEventListener("pointercancel", handlePointerCancel);
	};

	const handleWeekColumnPointerMove = (date) => (event) => {
		if (activeEntryTimeInteractionRef.current) {
			return;
		}

		const timeSlot = getTimeSlotFromEvent(date, event);
		const nextHoveredTimeSlot = createHoveredWeekTimeSlot({ date, timeSlot });

		setHoveredTimeSlot((current) => {
			if (isSameHoveredWeekTimeSlot(current, nextHoveredTimeSlot)) {
				return current;
			}

			return nextHoveredTimeSlot;
		});
	};

	const handleWeekColumnPointerLeave = () => {
		setHoveredTimeSlot(null);
	};

	const handleWeekColumnClick = (date) => (event) => {
		if (Date.now() < suppressTimeSlotClickUntilRef.current) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		const timeSlot = getTimeSlotFromEvent(date, event);

		onTimeSlotClick?.(createWeekTimeSlotClickPayload({ date, view, timeSlot }));
	};

	const handleWeekColumnDragOver = (date) => (event) => {
		if (!hasExternalCalendarDragSource(event)) {
			return;
		}

		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = "copy";
		}

		const timeSlot = getTimeSlotFromPoint(date, event);
		if (timeSlot) {
			setHoveredTimeSlot(createHoveredWeekTimeSlot({ date, timeSlot }));
		}
	};

	const handleWeekColumnDrop = (date) => (event) => {
		const source = getExternalCalendarDragSource(event);
		if (!source) {
			return;
		}

		event.preventDefault();
		setHoveredTimeSlot(null);
		const payload = createExternalDropPayload({ source, date, point: event });
		if (payload) {
			suppressImmediateTimeSlotClick();
			onExternalItemDrop?.(payload);
		}
	};

	const handleWeekItemPointerEnter = (event) => {
		trapWeekEntryPointerEvent(event);
		setHoveredTimeSlot(null);
	};

	const handleWeekItemClick = (itemClickHandler) => (event) => {
		if (suppressNextItemClickRef.current) {
			suppressNextItemClickRef.current = false;
			event.stopPropagation();
			return;
		}

		itemClickHandler(event);
	};

	return {
		activeEntryTimeId,
		activeEntryTimePreview,
		getWeekEntryTimePointerProps: (options) => ({
			onPointerDown: startEntryTimeInteraction(options),
		}),
		handleWeekColumnClick,
		handleWeekColumnDragOver,
		handleWeekColumnDrop,
		handleWeekColumnPointerLeave,
		handleWeekColumnPointerMove,
		handleWeekItemClick,
		handleWeekItemPointerEnter,
		hoveredTimeSlot,
	};
}
