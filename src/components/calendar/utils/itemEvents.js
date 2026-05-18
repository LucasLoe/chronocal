export function createCalendarItemClickHandler({ item, slotOnClick, onItemClick }) {
	return (event) => {
		event.stopPropagation();
		slotOnClick?.(event);
		onItemClick?.(item);
	};
}
