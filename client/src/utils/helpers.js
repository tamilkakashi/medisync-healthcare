import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatDate(date) {
    return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

export function truncate(str, length) {
    return str.length > length ? `${str.substring(0, length)}...` : str;
}
