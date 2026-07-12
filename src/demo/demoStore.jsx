import { createContext, useContext, useMemo, useReducer } from "react";
import dayjs from "../lib/dayjs";
import { calendarSampleEntries, getPalePastelColor } from "./calendarSampleData";

const backlogTickets = [
	{ id: "ticket-research", title: "Research spike", category: "Fokus", status: "normal" },
	{ id: "ticket-customer", title: "Customer follow-up", category: "Kunden", status: "warning" },
	{ id: "ticket-incident", title: "Incident review", category: "Support", status: "error" },
	{ id: "ticket-demo", title: "Product demo", category: "Produkt", status: "normal" },
];

const weekFixtures = [
	["week-plan", "Weekly planning", "Meetings", "normal", 0, 9, 0, 90],
	["week-focus", "API implementation", "Fokus", "normal", 0, 10, 45, 165],
	["week-review", "Design review", "Produkt", "warning", 1, 11, 15, 75],
	["week-customer", "Customer workshop", "Kunden", "error", 2, 13, 0, 150],
	["week-support", "Support rotation", "Support", "warning", 3, 8, 30, 120],
	["week-release", "Release window", "Produkt", "normal", 4, 14, 0, 180],
];

function createInitialState() {
	const monthTickets = calendarSampleEntries.map((entry) => ({
		id: `ticket-${entry.id}`,
		title: entry.title,
		category: entry.category,
		status: entry.status || "normal",
	}));
	const monthWorklogs = calendarSampleEntries.map((entry) => ({
		id: entry.id,
		ticketId: `ticket-${entry.id}`,
		start: entry.start,
		end: entry.end,
	}));
	const weekStart = dayjs().startOf("isoWeek");
	const weekTickets = weekFixtures.map(([id, title, category, status]) => ({
		id: `ticket-${id}`,
		title,
		category,
		status,
	}));
	const weekWorklogs = weekFixtures.map(([id, , , , dayOffset, hour, minute, durationMinutes]) => {
		const start = weekStart.add(dayOffset, "day").hour(hour).minute(minute).second(0);
		return { id, ticketId: `ticket-${id}`, start, end: start.add(durationMinutes, "minute") };
	});

	return {
		tickets: [...backlogTickets, ...weekTickets, ...monthTickets],
		worklogs: [...weekWorklogs, ...monthWorklogs],
		nextWorklogId: 1,
	};
}

function reducer(state, action) {
	switch (action.type) {
		case "add-worklog":
			return {
				...state,
				nextWorklogId: state.nextWorklogId + 1,
				worklogs: [
					...state.worklogs,
					{
						id: `dropped-${state.nextWorklogId}`,
						ticketId: action.ticketId,
						start: action.start,
						end: action.end,
					},
				],
			};
		case "update-worklog":
			return {
				...state,
				worklogs: state.worklogs.map((worklog) =>
					worklog.id === action.id ? { ...worklog, start: action.start, end: action.end } : worklog,
				),
			};
		case "reset":
			return createInitialState();
		default:
			return state;
	}
}

const DemoStoreContext = createContext(null);

export function DemoStoreProvider({ children }) {
	const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
	const ticketById = useMemo(
		() => new Map(state.tickets.map((ticket) => [ticket.id, ticket])),
		[state.tickets],
	);
	const entries = useMemo(
		() =>
			state.worklogs.map((worklog) => {
				const ticket = ticketById.get(worklog.ticketId);
				return {
					...ticket,
					id: worklog.id,
					ticketId: worklog.ticketId,
					start: worklog.start,
					end: worklog.end,
					color: getPalePastelColor(ticket.category),
				};
			}),
		[state.worklogs, ticketById],
	);
	const value = {
		entries,
		backlogTickets: state.tickets.filter((ticket) =>
			backlogTickets.some((backlogTicket) => backlogTicket.id === ticket.id),
		),
		addWorklog: ({ ticketId, start, end }) =>
			dispatch({ type: "add-worklog", ticketId, start, end }),
		updateWorklog: ({ id, start, end }) => dispatch({ type: "update-worklog", id, start, end }),
		reset: () => dispatch({ type: "reset" }),
	};

	return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

// The demo keeps its tiny provider and hook together to make the in-memory store easy to inspect.
// eslint-disable-next-line react-refresh/only-export-components
export function useDemoStore() {
	const store = useContext(DemoStoreContext);
	if (!store) {
		throw new Error("useDemoStore must be used within DemoStoreProvider");
	}
	return store;
}
