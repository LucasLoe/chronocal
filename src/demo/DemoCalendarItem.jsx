import { CalendarItem } from "../components/calendar";

export function DemoCalendarItem({ item, sx, ...props }) {
	return (
		<CalendarItem
			{...props}
			item={item}
			sx={[
				{
					bgcolor: item.color,
					color: "#252016",
					borderLeft: "4px solid",
					borderLeftColor:
						item.status === "error" ? "#d04a31" : item.status === "warning" ? "#d18b24" : "#52745f",
					borderRadius: "4px 12px 12px 4px",
					boxShadow: "0 5px 18px rgba(76, 62, 38, 0.10)",
				},
				sx,
			]}
		/>
	);
}
