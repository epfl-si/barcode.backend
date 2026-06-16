export function getFormattedDate(date: Date, split: String = '/') {
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = String(date.getFullYear());

	return `${day}${split}${month}${split}${year}`;
}
