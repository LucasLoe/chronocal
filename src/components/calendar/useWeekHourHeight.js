import { useEffect, useState } from "react";
import { getResponsiveWeekHourHeight, resolveWeekLayout } from "./utils/weekGeometry";

export function useWeekHourHeight({ rootRef, weekLayout, workHours }) {
	const resolvedWeekLayout = resolveWeekLayout(weekLayout);
	const [viewportHeight, setViewportHeight] = useState(0);

	useEffect(() => {
		if (resolvedWeekLayout.hourHeight !== undefined) {
			return undefined;
		}

		const viewport = rootRef.current?.parentElement;
		if (!viewport) {
			return undefined;
		}

		const updateViewportHeight = () => setViewportHeight(viewport.clientHeight);
		updateViewportHeight();

		if (typeof ResizeObserver === "undefined") {
			window.addEventListener("resize", updateViewportHeight);
			return () => window.removeEventListener("resize", updateViewportHeight);
		}

		const observer = new ResizeObserver(updateViewportHeight);
		observer.observe(viewport);
		return () => observer.disconnect();
	}, [resolvedWeekLayout.hourHeight, rootRef]);

	return getResponsiveWeekHourHeight({ viewportHeight, workHours, weekLayout });
}
