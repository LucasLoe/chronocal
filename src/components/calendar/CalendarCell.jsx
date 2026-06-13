import { Box } from "@mui/material";
import { styled, useThemeProps } from "@mui/material/styles";
import { createCalendarItemClickHandler } from "./utils/itemEvents";

const CalendarCellRoot = styled(Box, {
	name: "CALENDAR_CalendarCell",
	slot: "Root",
})(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	minHeight: 116,
	minWidth: 0,
	overflow: "hidden",
	borderRight: "1px solid",
	borderBottom: "1px solid",
	borderColor: theme.palette.divider,
}));

const CalendarCellItemWrapper = styled(Box, {
	name: "CALENDAR_CalendarCell",
	slot: "ItemWrapper",
	overridesResolver: (props, styles) => styles.itemWrapper,
})({
	width: "100%",
	minWidth: 0,
	"& > *": {
		width: "100%",
	},
});

export function CalendarCell(inProps) {
	const props = useThemeProps({ props: inProps, name: "CALENDAR_CalendarCell" });
	const {
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
	} = props;
	const CellHeader = slots.cellHeader;
	const Entry = slots.entry;
	const Item = slots.item;
	const ownerState = { date, entries, view, isToday, isCurrentMonth };
	const cellHeaderSlotProps = slotProps.cellHeader || {};
	const { sx: entrySx, ...entrySlotRest } = slotProps.entry || {};
	const { onClick: itemSlotOnClick, ...itemSlotRest } = slotProps.item || {};
	const { sx: itemWrapperSx, ...itemWrapperSlotRest } = slotProps.monthItemWrapper || {};

	return (
		<CalendarCellRoot
			ownerState={ownerState}
			sx={sx}
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
							sx={[{ flex: 1, minHeight: 0, overflow: "auto" }, entrySx]}
				{...entrySlotRest}
			>
				{entries.map((entry) => {
					const itemOwnerState = { ...ownerState, item: entry, entry };

					return (
						<CalendarCellItemWrapper
							key={entry.id}
							ownerState={itemOwnerState}
							sx={itemWrapperSx}
							{...itemWrapperSlotRest}
						>
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
								ownerState={itemOwnerState}
								{...itemSlotRest}
							/>
						</CalendarCellItemWrapper>
					);
				})}
			</Entry>
		</CalendarCellRoot>
	);
}
