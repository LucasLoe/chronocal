import { Box } from "@mui/material";
import { createCalendarItemClickHandler } from "./utils/itemEvents";
import {
	createMonthCellOwnerState,
	createMonthItemOwnerState,
	getSlotProps,
	splitSlotSx,
} from "./utils/slots";

export function CalendarCell({
	date,
	entries,
	view,
	isToday,
	isCurrentMonth,
	slots,
	slotProps = {},
	onItemClick,
	sx,
	...rest
}) {
	const CellHeader = slots.cellHeader;
	const Entry = slots.entry;
	const Item = slots.item;
	const ownerState = createMonthCellOwnerState({ date, entries, view, isToday, isCurrentMonth });
	const cellHeaderSlotProps = getSlotProps(slotProps, "cellHeader");
	const { sx: entrySx, rest: entrySlotRest } = splitSlotSx(getSlotProps(slotProps, "entry"));
	const { onClick: itemSlotOnClick, ...itemSlotRest } = getSlotProps(slotProps, "item");

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: 116,
				minWidth: 0,
				overflow: "hidden",
				borderRight: "1px solid",
				borderBottom: "1px solid",
				borderColor: "divider",
				...sx,
			}}
			{...rest}
		>
			<CellHeader
				date={date}
				isToday={isToday}
				isCurrentMonth={isCurrentMonth}
				view={view}
				ownerState={ownerState}
				{...cellHeaderSlotProps}
			/>
			<Entry
				date={date}
				entries={entries}
				view={view}
				ownerState={ownerState}
				sx={{ flex: 1, minHeight: 0, overflow: "auto", ...entrySx }}
				{...entrySlotRest}
			>
				{entries.map((entry) => (
					<Box key={entry.id} sx={{ width: "100%", minWidth: 0, "& > *": { width: "100%" } }}>
						<Item
							item={entry}
							entry={entry}
							date={date}
							view={view}
							onClick={createCalendarItemClickHandler({
								item: entry,
								slotOnClick: itemSlotOnClick,
								onItemClick,
							})}
							ownerState={createMonthItemOwnerState({ cellOwnerState: ownerState, entry })}
							{...itemSlotRest}
						/>
					</Box>
				))}
			</Entry>
		</Box>
	);
}
