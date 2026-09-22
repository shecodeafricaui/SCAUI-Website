export const TRACK_OPTIONS = [
  "Graphics Design",
  "UI/UX",
  "Frontend",
  "Backend",
  "Mobile",
  "Data Analysis",
  "Data Science",
  "AI/ML",
  "Product Management",
  "Project Management",
  "Marketing",
  "Cybersecurity",
  "Blockchain",
];

export const TEAM_OPTIONS = [
  "Programs Team",
  "Design Team",
  "Content Team",
  "Publicity Team",
  "Welfare Team",
  "Sponsorship Team",
  "Technical/Tracks Team",
  "Community Operations",
];

export const OPPORTUNITY_CATEGORIES = [
  "internship",
  "job",
  "scholarship",
  "fellowship",
  "hackathon",
  "competition",
  "grant",
  "conference",
  "course",
  "certification",
  "volunteer",
];

export const EVENT_CATEGORIES = ["meetup", "workshop", "lab", "hangout", "bootcamp", "webinar"];

export const PROGRAMME_CATEGORIES = ["training", "cohort", "mentorship", "career", "portfolio"];

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
