import { format, formatDistanceToNow } from "date-fns";

export function currency(value: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 2,
	}).format(value);
}

export function integer(value: number) {
	return new Intl.NumberFormat("en-US").format(value);
}

export function compactDate(value: Date | string) {
	return format(new Date(value), "MMM d");
}

export function clockTime(value: Date | string) {
	return format(new Date(value), "h:mm a");
}

export function longDateTime(value: Date | string) {
	return format(new Date(value), "PPP p");
}

export function relativeTime(value: Date | string) {
	return formatDistanceToNow(new Date(value), { addSuffix: true });
}
