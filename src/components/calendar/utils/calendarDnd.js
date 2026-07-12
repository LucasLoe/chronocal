import { useEffect, useRef, useState } from "react";

const EXTERNAL_DRAG_MIME_TYPE = "application/x-chronocal-external-source";
const externalDragSources = new Map();

export function useCalendarExternalDragSource({ id, source }) {
	const sourceIdRef = useRef(`calendar-external-item:${id}`);
	const sourceRef = useRef(source);
	const [isDragging, setIsDragging] = useState(false);

	useEffect(() => {
		sourceRef.current = source;
	}, [source]);

	useEffect(
		() => () => {
			externalDragSources.delete(sourceIdRef.current);
		},
		[],
	);

	const handleDragStart = (event) => {
		externalDragSources.set(sourceIdRef.current, sourceRef.current);
		setIsDragging(true);
		event.dataTransfer?.setData(EXTERNAL_DRAG_MIME_TYPE, sourceIdRef.current);
		event.dataTransfer?.setData("text/plain", sourceIdRef.current);
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = "copy";
		}
	};

	const handleDragEnd = () => {
		externalDragSources.delete(sourceIdRef.current);
		setIsDragging(false);
	};

	return {
		attributes: { draggable: true },
		listeners: { onDragStart: handleDragStart, onDragEnd: handleDragEnd },
		setNodeRef: () => {},
		transform: null,
		isDragging,
	};
}

export function getExternalCalendarDragSource(event) {
	const sourceId =
		event.dataTransfer?.getData(EXTERNAL_DRAG_MIME_TYPE) ||
		event.dataTransfer?.getData("text/plain");

	return sourceId ? externalDragSources.get(sourceId) : undefined;
}

export function hasExternalCalendarDragSource(event) {
	const types = Array.from(event.dataTransfer?.types || []);
	return types.includes(EXTERNAL_DRAG_MIME_TYPE) || types.includes("text/plain");
}
