import {
	AppBar,
	Box,
	Button,
	Chip,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Toolbar,
	Typography,
} from "@mui/material";
import { useState } from "react";
import {
	CalendarLocalizationProvider,
	CalendarRoot,
	CalendarTopbar,
	CALENDAR_VIEWS,
	TIME_SLOT_MINUTE_OPTIONS,
	useCalendar,
	useCalendarExternalDragSource,
	WORK_HOUR_PRESET_OPTIONS,
} from "./components/calendar";
import { categoryFilters } from "./demo/calendarSampleData";
import { demoCalendarProps, hourHeightModes } from "./demo/demoCalendarConfig";
import { DemoStoreProvider, useDemoStore } from "./demo/demoStore";

const ticketStatus = {
	normal: { color: "#52745f", background: "#e9f2e9" },
	warning: { color: "#9a6415", background: "#fff0c9" },
	error: { color: "#a83827", background: "#ffe2da" },
};

function TicketCard({ ticket }) {
	const { attributes, listeners, setNodeRef, isDragging } = useCalendarExternalDragSource({
		id: ticket.id,
		source: ticket,
	});
	const status = ticketStatus[ticket.status] || ticketStatus.normal;

	return (
		<Paper
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			elevation={0}
			sx={{
				p: 1.25,
				minWidth: { xs: 190, lg: 0 },
				border: "1px solid",
				borderColor: isDragging ? status.color : "#d8cdbb",
				borderRadius: 2,
				background: isDragging ? "#fff" : status.background,
				boxShadow: isDragging ? "0 14px 32px rgba(56, 45, 27, .22)" : "none",
				cursor: isDragging ? "grabbing" : "grab",
				opacity: isDragging ? 0.72 : 1,
				transition: "box-shadow 120ms ease, opacity 120ms ease, border-color 120ms ease",
			}}
		>
			<Stack direction='row' justifyContent='space-between' gap={1} alignItems='flex-start'>
				<Box sx={{ minWidth: 0 }}>
					<Typography variant='body2' sx={{ fontWeight: 800, lineHeight: 1.2 }}>
						{ticket.title}
					</Typography>
					<Typography variant='caption' color='text.secondary'>
						{ticket.category} · 1 hour
					</Typography>
				</Box>
				<Box sx={{ width: 8, height: 8, mt: 0.5, borderRadius: "50%", bgcolor: status.color }} />
			</Stack>
		</Paper>
	);
}

function TicketRail() {
	const { backlogTickets } = useDemoStore();

	return (
		<Box
			component='aside'
			sx={{
				minWidth: 0,
				minHeight: 0,
				p: 1.5,
				bgcolor: "#f3ecdf",
				borderRight: { xs: 0, lg: "1px solid #d8cdbb" },
				borderBottom: { xs: "1px solid #d8cdbb", lg: 0 },
				overflow: "hidden",
				display: "flex",
				flexDirection: "column",
				gap: 1.25,
			}}
		>
			<Box>
				<Typography
					variant='overline'
					sx={{ color: "#765f3d", fontWeight: 900, letterSpacing: ".12em" }}
				>
					Ticket rail
				</Typography>
				<Typography variant='body2' color='text.secondary'>
					Drag a ticket into Week View. Month View keeps the same shared worklogs.
				</Typography>
			</Box>
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "row", lg: "column" },
					gap: 1,
					overflow: "auto",
					minHeight: 0,
					pb: { xs: 0.5, lg: 0 },
				}}
			>
				{backlogTickets.map((ticket) => (
					<TicketCard key={ticket.id} ticket={ticket} />
				))}
			</Box>
		</Box>
	);
}

function CalendarControls({ filter, onFilterChange, sizeMode, onSizeModeChange }) {
	const calendar = useCalendar();
	const isWeek = calendar.view === CALENDAR_VIEWS.WEEK;

	return (
		<CalendarTopbar
			sx={{
				width: "100%",
				minWidth: 0,
				overflowX: "auto",
				px: 1,
				borderBottom: "1px solid",
				borderColor: "divider",
				bgcolor: "background.paper",
			}}
		>
			<IconButton size='small' onClick={() => calendar.navigate(-1)} aria-label='Previous period'>
				←
			</IconButton>
			<IconButton size='small' onClick={() => calendar.navigate(1)} aria-label='Next period'>
				→
			</IconButton>
			<Typography
				variant='subtitle1'
				sx={{ minWidth: 160, fontWeight: 850, textTransform: "capitalize" }}
			>
				{calendar.title}
			</Typography>
			<Button size='small' variant='outlined' onClick={calendar.today}>
				Today
			</Button>
			<ToggleButtonGroup
				exclusive
				size='small'
				value={calendar.view}
				onChange={(_, next) => next && calendar.setView(next)}
			>
				<ToggleButton value={CALENDAR_VIEWS.WEEK}>Week</ToggleButton>
				<ToggleButton value={CALENDAR_VIEWS.MONTH}>Month</ToggleButton>
			</ToggleButtonGroup>
			<ToggleButton
				size='small'
				value='weekend'
				selected={calendar.showWeekend}
				onChange={() => calendar.setShowWeekend(!calendar.showWeekend)}
			>
				Weekend
			</ToggleButton>
			{isWeek && (
				<FormControl size='small' sx={{ minWidth: 150 }}>
					<InputLabel id='demo-hours-label'>Hours</InputLabel>
					<Select
						size='small'
						labelId='demo-hours-label'
						value={calendar.workHoursPreset}
						label='Hours'
						onChange={(event) => calendar.setWorkHoursPreset(event.target.value)}
					>
						{WORK_HOUR_PRESET_OPTIONS.map((option) => (
							<MenuItem key={option.id} value={option.id}>
								{option.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			)}
			{isWeek && (
				<FormControl size='small' sx={{ minWidth: 150 }}>
					<InputLabel id='demo-grid-label'>Grid</InputLabel>
					<Select
						size='small'
						labelId='demo-grid-label'
						value={calendar.timeSlotMinutes}
						label='Grid'
						onChange={(event) => calendar.setTimeSlotMinutes(event.target.value)}
					>
						{TIME_SLOT_MINUTE_OPTIONS.map((minutes) => (
							<MenuItem key={minutes} value={minutes}>
								{minutes} min
							</MenuItem>
						))}
					</Select>
				</FormControl>
			)}
			<FormControl size='small' sx={{ minWidth: 150 }}>
				<InputLabel id='demo-filter-label'>Category</InputLabel>
				<Select
					size='small'
					labelId='demo-filter-label'
					value={filter}
					label='Category'
					onChange={(event) => onFilterChange(event.target.value)}
				>
					{categoryFilters.map((option) => (
						<MenuItem key={option} value={option}>
							{option}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			{isWeek && (
				<FormControl size='small' sx={{ minWidth: 150 }}>
					<InputLabel id='demo-size-label'>Hour height</InputLabel>
					<Select
						size='small'
						labelId='demo-size-label'
						value={sizeMode}
						label='Hour height'
						onChange={(event) => onSizeModeChange(event.target.value)}
					>
						{Object.entries(hourHeightModes).map(([id, mode]) => (
							<MenuItem key={id} value={id}>
								{mode.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			)}
		</CalendarTopbar>
	);
}

function CalendarWorkspace() {
	const store = useDemoStore();
	const [filter, setFilter] = useState(categoryFilters[0]);
	const [sizeMode, setSizeMode] = useState("comfortable");
	const [lastAction, setLastAction] = useState("Ready");
	const visibleEntries =
		filter === categoryFilters[0]
			? store.entries
			: store.entries.filter((entry) => entry.category === filter);

	return (
		<Box
			sx={{
				flex: 1,
				minHeight: 0,
				display: "grid",
				gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "250px minmax(0, 1fr)" },
				gridTemplateRows: { xs: "auto minmax(0, 1fr)", lg: "minmax(0, 1fr)" },
				overflow: "hidden",
			}}
		>
			<TicketRail />
			<Box
				sx={{
					minWidth: 0,
					minHeight: 0,
					display: "flex",
					flexDirection: "column",
					position: "relative",
				}}
			>
				<CalendarLocalizationProvider locale='de'>
					<CalendarRoot
						{...demoCalendarProps}
						weekLayout={hourHeightModes[sizeMode].value}
						entries={visibleEntries}
						onTimeSlotClick={({ start }) => setLastAction(`Selected ${start.format("ddd HH:mm")}`)}
						onItemClick={(entry) => setLastAction(`Opened ${entry.title}`)}
						onExternalItemDrop={({ source: ticket, start, end }) => {
							store.addWorklog({ ticketId: ticket.id, start, end });
							setFilter(categoryFilters[0]);
							setLastAction(`Scheduled ${ticket.title} at ${start.format("ddd HH:mm")}`);
						}}
						onEntryTimeChange={({ id, start, end, action }) => {
							store.updateWorklog({ id, start, end });
							setLastAction(`${action} · ${start.format("ddd HH:mm")}`);
						}}
						sx={{ flex: 1, minHeight: 0, ...demoCalendarProps.sx }}
					>
						<CalendarControls
							filter={filter}
							onFilterChange={setFilter}
							sizeMode={sizeMode}
							onSizeModeChange={setSizeMode}
						/>
					</CalendarRoot>
				</CalendarLocalizationProvider>
				<Chip
					size='small'
					label={lastAction}
					sx={{
						position: "absolute",
						right: 12,
						bottom: 12,
						zIndex: 10,
						maxWidth: "calc(100% - 24px)",
						bgcolor: "background.paper",
						boxShadow: 3,
					}}
				/>
			</Box>
		</Box>
	);
}

function DemoApp() {
	const { reset } = useDemoStore();

	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#ebe8e1" }}>
			<AppBar
				position='static'
				color='transparent'
				elevation={0}
				sx={{ bgcolor: "#f8f6f0", borderBottom: "1px solid #cbc6bb" }}
			>
				<Toolbar sx={{ gap: 2, minHeight: { xs: 56, md: 64 } }}>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography
							variant='overline'
							sx={{ color: "#a34c35", fontWeight: 900, letterSpacing: ".16em" }}
						>
							Demo Application
						</Typography>
						<Typography variant='h6' sx={{ fontWeight: 900, lineHeight: 1.05 }}>
							Chronocal
						</Typography>
					</Box>
					<Button size='small' variant='outlined' onClick={reset}>
						Reset mock data
					</Button>
				</Toolbar>
			</AppBar>

			<Box
				sx={{
					flex: 1,
					minHeight: 0,
					p: { xs: 1, md: 2 },
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Paper
					elevation={0}
					sx={{
						flex: 1,
						minHeight: 0,
						overflow: "hidden",
						display: "flex",
						flexDirection: "column",
						border: "1px solid #cbc6bb",
						borderRadius: 2,
					}}
				>
					<Box
						sx={{
							px: 2,
							py: 1.25,
							borderBottom: "1px solid",
							borderColor: "divider",
							bgcolor: "background.paper",
						}}
					>
						<Stack direction={{ xs: "column", md: "row" }} justifyContent='space-between' gap={0.5}>
							<Typography variant='subtitle1' sx={{ fontWeight: 900 }}>
								Shared ticket and worklog workspace
							</Typography>
						</Stack>
					</Box>
					<CalendarWorkspace />
				</Paper>
			</Box>
		</Box>
	);
}

export default function App() {
	return (
		<DemoStoreProvider>
			<DemoApp />
		</DemoStoreProvider>
	);
}
