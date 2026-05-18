export function chunkDates(dates, size) {
	const chunks = [];

	for (let index = 0; index < dates.length; index += size) {
		chunks.push(dates.slice(index, index + size));
	}

	return chunks;
}
