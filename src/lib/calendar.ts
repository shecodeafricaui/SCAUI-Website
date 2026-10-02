// Builds and downloads an .ics calendar invite (works with Google, Apple, Outlook).
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  is_online?: boolean;
  starts_at: string;
  ends_at?: string | null;
  registration_url?: string | null;
}

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

export function downloadCalendarInvite(e: CalendarEvent) {
  const start = new Date(e.starts_at);
  const end = e.ends_at ? new Date(e.ends_at) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const desc = [e.description ?? "", e.registration_url ? `Register: ${e.registration_url}` : ""]
    .filter(Boolean)
    .join("\n\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//She Code Africa UI//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.id}@scaui`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(e.title)}`,
    desc ? `DESCRIPTION:${esc(desc)}` : "",
    `LOCATION:${esc(e.is_online ? "Online" : (e.location ?? "Venue to be announced"))}`,
    e.registration_url ? `URL:${e.registration_url}` : "",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(e.title)} is tomorrow`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
