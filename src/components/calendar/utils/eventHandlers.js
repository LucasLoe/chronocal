export function composeCalendarEventHandlers(packageHandler, consumerHandler) {
	if (!packageHandler) {
		return consumerHandler;
	}
	if (!consumerHandler) {
		return packageHandler;
	}

	return (event) => {
		packageHandler(event);
		consumerHandler(event);
	};
}
