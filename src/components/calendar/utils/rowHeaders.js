import { CALENDAR_VIEWS } from "./views";

export function shouldRenderRowHeaders(showRowHeaders, ownerState) {
	if (typeof showRowHeaders === "function") {
		return Boolean(showRowHeaders(ownerState));
	}

	if (showRowHeaders !== undefined) {
		return Boolean(showRowHeaders);
	}

	return ownerState.view === CALENDAR_VIEWS.WEEK;
}
