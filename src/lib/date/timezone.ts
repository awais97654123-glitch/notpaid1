import { fromZonedTime, toZonedTime, format as formatTz } from 'date-fns-tz';

export const DEFAULT_TIMEZONE = 'Asia/Karachi';

export const COMMON_TIMEZONES = [
  { value: 'Asia/Karachi', label: 'Pakistan Standard Time (PKT, UTC+5)', flag: '🇵🇰' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST, UTC+4)', flag: '🇦🇪' },
  { value: 'Asia/Riyadh', label: 'Arabia Standard Time (AST, UTC+3)', flag: '🇸🇦' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST, UTC+5:30)', flag: '🇮🇳' },
  { value: 'Asia/Dhaka', label: 'Bangladesh Standard Time (BST, UTC+6)', flag: '🇧🇩' },
  { value: 'Europe/London', label: 'Greenwich Mean Time / BST (London, UTC+0/+1)', flag: '🇬🇧' },
  { value: 'Europe/Berlin', label: 'Central European Time (Berlin, UTC+1/+2)', flag: '🇩🇪' },
  { value: 'America/New_York', label: 'Eastern Time (New York, UTC-5/-4)', flag: '🇺🇸' },
  { value: 'America/Chicago', label: 'Central Time (Chicago, UTC-6/-5)', flag: '🇺🇸' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles, UTC-8/-7)', flag: '🇺🇸' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (Tokyo, UTC+9)', flag: '🇯🇵' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)', flag: '🌐' },
];

/**
 * Resolves a reliable timezone string, falling back to Asia/Karachi
 */
export function resolveUserTimezone(tz?: string | null): string {
  if (tz && typeof tz === 'string' && tz.trim() !== '') {
    try {
      // Validate that Intl accepts the timezone
      Intl.DateTimeFormat(undefined, { timeZone: tz.trim() });
      return tz.trim();
    } catch {
      // Invalid timezone, fallback
    }
  }

  // Check if browser environment provides a timezone
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) return detected;
    } catch {
      // Fallback
    }
  }

  return DEFAULT_TIMEZONE;
}

/**
 * Normalizes a time string into HH:mm:ss format
 * Accepts: "19:30", "19:30:00", "7:30 PM", "5pm", etc.
 */
export function normalizeTimeString(timeStr?: string | null): string {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.trim()) {
    return '09:00:00';
  }

  const trimmed = timeStr.trim().toLowerCase();

  // Match 12-hour format with am/pm (e.g., "7:30 pm", "5pm", "11:45am")
  const ampmMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(am|pm)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const seconds = ampmMatch[3] ? parseInt(ampmMatch[3], 10) : 0;
    const isPm = ampmMatch[4].toLowerCase() === 'pm';

    if (isPm && hours < 12) hours += 12;
    if (!isPm && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Match 24-hour format (e.g., "19:30" or "19:30:00")
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    const seconds = parts[2] ? parseInt(parts[2], 10) || 0 : 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return '09:00:00';
}

/**
 * Calculates the canonical UTC ISO string for a task reminder given:
 * - dateStr: "YYYY-MM-DD"
 * - timeStr: "HH:mm" or "HH:mm:ss"
 * - timeZone: IANA timezone name (e.g. "Asia/Karachi")
 * - offsetMinutes: Minutes before task to trigger reminder (e.g., 0, 5, 15, 30, 60, 1440)
 */
export function calculateCanonicalScheduledUtc(
  dateStr: string,
  timeStr: string | null | undefined,
  timeZone: string,
  offsetMinutes: number = 0
): string {
  const normalizedTime = normalizeTimeString(timeStr);
  const tz = resolveUserTimezone(timeZone);

  // Clean date string (YYYY-MM-DD)
  const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;

  // Local date-time string in wall-clock time of the target timezone
  const localDateTimeStr = `${cleanDate} ${normalizedTime}`;

  // Convert wall-clock local time into canonical UTC Date object
  const canonicalUtcDate = fromZonedTime(localDateTimeStr, tz);

  // Apply reminder offset (subtract offset minutes)
  const finalScheduledMillis = canonicalUtcDate.getTime() - offsetMinutes * 60 * 1000;
  const finalScheduledDate = new Date(finalScheduledMillis);

  return finalScheduledDate.toISOString();
}

/**
 * Formats a canonical UTC ISO string for human display in a user's local timezone
 */
export function formatInUserTimezone(
  utcIso: string,
  timeZone: string,
  formatPattern: string = 'MMMM d, yyyy h:mm a'
): string {
  try {
    const tz = resolveUserTimezone(timeZone);
    const zonedDate = toZonedTime(new Date(utcIso), tz);
    return formatTz(zonedDate, formatPattern, { timeZone: tz });
  } catch {
    return utcIso;
  }
}
