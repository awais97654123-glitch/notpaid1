import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale: string = 'en'): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
    }).format(d);
  } catch {
    return String(date);
  }
}

export function formatTime(time: string, locale: string = 'en'): string {
  try {
    if (!time) return '';
    const [h, m] = time.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10), parseInt(m, 10));
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(d);
  } catch {
    return time;
  }
}

export function truncate(str: string, length: number = 40): string {
  if (!str) return '';
  return str.length > length ? str.slice(0, length) + '...' : str;
}
