import {
	AppBar,
	Box,
	Drawer,
	FormControl,
	InputLabel,
	IconButton,
	MenuItem,
	Paper,
	Select,
	Toolbar,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
	Button,
} from "@mui/material";
import { useState } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import {
	CalendarRoot,
	CalendarTopbar,
	CalendarLocalizationProvider,
	CALENDAR_VIEWS,
	TIME_SLOT_MINUTE_OPTIONS,
	WORK_HOUR_PRESET_OPTIONS,
	useCalendarExternalDragSource,
	useCalendar,
} from "./components/calendar";
import {
	calendarSampleEntries,
	categoryFilters,
	getPalePastelColor,
	updateCalendarSampleEntryTime,
} from "./demo/calendarSampleData";

const backlogTemplates = [
	{ id: "template-research", title: "Research Spike", category: "Fokus", status: null },
	{ id: "template-customer", title: "Customer Follow-up", category: "Kunden", status: "warning" },
	{ id: "template-incident", title: "Incident Review", category: "Support", status: "error" },
	{ id: "template-demo", title: "Product Demo", category: "Produkt", status: null },
];

function DemoBacklogItem({ template }) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useCalendarExternalDragSource({
			id: template.id,
			source: template,
		});
	const status = demoStatusStyles[template.status] || demoStatusStyles.normal;

	return (
		<Box
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			sx={{
				p: 1.25,
				border: "1px solid",
				borderColor: "divider",
				borderRadius: 1,
				backgroundColor: status.backgroundColor,
				boxShadow: isDragging ? 4 : 0,
				cursor: "grab",
				touchAction: "none",
				transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
				zIndex: isDragging ? 1400 : "auto",
				position: "relative",
			}}
		>
			<Typography variant='body2' sx={{ fontWeight: 700 }}>
				{template.title}
			</Typography>
			<Typography variant='caption' color='text.secondary'>
				{template.category} · 1h
			</Typography>
		</Box>
	);
}

function DemoCalendarControls({ filter, onFilterChange }) {
	const calendar = useCalendar();
	const [isBacklogOpen, setIsBacklogOpen] = useState(false);

	return (
		<CalendarTopbar>
			<Button variant='contained' onClick={() => setIsBacklogOpen(true)}>
				Backlog
			</Button>

			<Drawer anchor='right' open={isBacklogOpen} onClose={() => setIsBacklogOpen(false)}>
				<Box sx={{ width: 320, p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
					<Typography variant='h6' sx={{ fontWeight: 800 }}>
						Backlog
					</Typography>
					<Typography variant='body2' color='text.secondary'>
						Drag an item into the week view. Drops are normalized to one hour.
					</Typography>
					{backlogTemplates.map((template) => (
						<DemoBacklogItem key={template.id} template={template} />
					))}
				</Box>
			</Drawer>

			<IconButton size='small' onClick={() => calendar.navigate(-1)} aria-label='Zurueck'>
				{"<"}
			</IconButton>
			<IconButton size='small' onClick={() => calendar.navigate(1)} aria-label='Vor'>
				{">"}
			</IconButton>

			<Typography variant='subtitle1' sx={{ textTransform: "capitalize", fontWeight: 700, px: 1 }}>
				{calendar.title}
			</Typography>
			<Button variant='outlined' value='today' selected={false} onChange={calendar.today}>
				Heute
			</Button>

			<ToggleButtonGroup
				exclusive
				size='small'
				value={calendar.view}
				onChange={(_, next) => next && calendar.setView(next)}
				color='primary'
			>
				<ToggleButton size='small' value={CALENDAR_VIEWS.WEEK}>
					Woche
				</ToggleButton>
				<ToggleButton size='small' value={CALENDAR_VIEWS.MONTH}>
					Monat
				</ToggleButton>
			</ToggleButtonGroup>

			<ToggleButton
				size='small'
				value='weekend'
				selected={calendar.showWeekend}
				onChange={() => calendar.setShowWeekend(!calendar.showWeekend)}
			>
				Wochenende
			</ToggleButton>

			{calendar.view === CALENDAR_VIEWS.WEEK && (
				<FormControl size='small' sx={{ minWidth: 140 }}>
					<InputLabel id='work-hours-label'>Arbeitszeit</InputLabel>
					<Select
						labelId='work-hours-label'
						value={calendar.workHoursPreset}
						label='Arbeitszeit'
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

			{calendar.view === CALENDAR_VIEWS.WEEK && (
				<FormControl size='small' sx={{ minWidth: 128 }}>
					<InputLabel id='time-slot-label'>Zeitraster</InputLabel>
					<Select
						labelId='time-slot-label'
						value={calendar.timeSlotMinutes}
						label='Zeitraster'
						onChange={(event) => calendar.setTimeSlotMinutes(event.target.value)}
					>
						{TIME_SLOT_MINUTE_OPTIONS.map((minutes) => (
							<MenuItem key={minutes} value={minutes}>
								{minutes} Min.
							</MenuItem>
						))}
					</Select>
				</FormControl>
			)}

			<FormControl size='small' sx={{ minWidth: 140 }}>
				<InputLabel id='demo-filter-label'>Filter</InputLabel>
				<Select
					labelId='demo-filter-label'
					value={filter}
					label='Filter'
					onChange={(event) => onFilterChange(event.target.value)}
				>
					{categoryFilters.map((option) => (
						<MenuItem value={option} key={option}>
							{option}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</CalendarTopbar>
	);
}

const demoStatusStyles = {
	normal: {
		label: "OK",
		backgroundColor: "#e4f5d0",
	},
	warning: {
		label: "Warnung",
		backgroundColor: "#ffe59e",
	},
	error: {
		label: "Fehler",
		backgroundColor: "#ffb59e",
	},
};

function DemoCalendarItem({ item, sx, ...rest }) {
	const status = demoStatusStyles[item.status] || demoStatusStyles.normal;
	const statusLabel = item.status ? `${status.label}: ${item.title}` : item.title;
	delete rest.date;
	delete rest.view;
	delete rest.layout;
	delete rest.ownerState;

	return (
		<Box
			{...rest}
			aria-label={statusLabel}
			title={statusLabel}
			sx={{
				display: "flex",
				flexDirection: "row",
				alignItems: "flex-start",
				justifyContent: "center",
				width: "100%",
				height: "100%",
				borderRadius: 0.25,
				gap: 1,
				pl: 0.5,
				pr: 0.5,
				overflow: "hidden",
				backgroundColor: status.backgroundColor,
				cursor: rest.onClick ? "pointer" : "default",
				...sx,
			}}
		>
			<Typography variant='caption' sx={{ flex: "0 0 auto", fontWeight: 600 }}>
				{item.start.format("HH:mm")}
			</Typography>
			<Typography
				variant='caption'
				sx={{
					flex: 1,
					minWidth: 0,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				}}
			>
				{item.title}
			</Typography>
		</Box>
	);
}

function HomePage() {
	const [filter, setFilter] = useState(categoryFilters[0]);
	const [entries, setEntries] = useState(calendarSampleEntries);
	const visibleEntries =
		filter === "Alle" ? entries : entries.filter((entry) => entry.category === filter);
	const addBacklogTemplateToCalendar = ({ source: template, start, end }) => {
		if (!template) {
			return;
		}

		setEntries((current) => [
			...current,
			{
				...template,
				id: `entry-${crypto.randomUUID()}`,
				start,
				end,
				color: getPalePastelColor(template.category),
			},
		]);
	};

	return (
		<Box
			sx={{
				flex: 1,
				width: "100%",
				display: "flex",
				flexDirection: "column",
				minHeight: 0,
			}}
		>
			<CalendarLocalizationProvider locale='de'>
				<CalendarRoot
					entries={visibleEntries}
					onTimeSlotClick={({ start, end }) => console.log({ start, end })}
					onItemClick={(item) => console.log(item)}
					onExternalItemDrop={addBacklogTemplateToCalendar}
					onEntryTimeChange={({ id, start, end, action }) => {
						console.log({ id, start, end, action });
						setEntries((current) => updateCalendarSampleEntryTime(current, { id, start, end }));
					}}
					slots={{ item: DemoCalendarItem }}
					slotProps={{
						cellHeader: { sx: { bgcolor: "#eee" } },
						entry: { sx: { gap: 0.25, p: 0.5 } },
					}}
					sx={{ flex: 1, minHeight: 0 }}
				>
					<DemoCalendarControls filter={filter} onFilterChange={setFilter} />
				</CalendarRoot>
			</CalendarLocalizationProvider>
		</Box>
	);
}

function BaseLayout() {
	return (
		<Box
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				backgroundColor: "background.default",
			}}
		>
			<AppBar color='transparent' position='static' elevation={0}>
				<Toolbar>
					<Typography variant='h6' component='div' sx={{ flexGrow: 1, fontWeight: 700 }}>
						{`Chronocal`}
					</Typography>
				</Toolbar>
			</AppBar>

			<Box sx={{ flex: 1, p: 2, display: "flex", minHeight: 0 }}>
				<Paper
					elevation={0}
					sx={{
						flex: 1,
						p: 1,
						minHeight: 0,
						border: "1px solid",
						borderColor: "divider",
						backgroundColor: "background.paper",
						overflow: "hidden",
						display: "flex",
						flexDirection: "column",
					}}
				>
					<Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
						<Outlet />
					</Box>
				</Paper>
			</Box>
		</Box>
	);
}

function App() {
	return (
		<Routes>
			<Route path='/' element={<BaseLayout />}>
				<Route index element={<HomePage />} />
			</Route>
		</Routes>
	);
}

export default App;
