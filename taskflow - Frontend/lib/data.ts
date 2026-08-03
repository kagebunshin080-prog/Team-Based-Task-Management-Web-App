export type Status = "todo" | "in_progress" | "review" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";

export type Member = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

export type Task = {
  id: string; // e.g. TSK-042
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: Member;
  dueDate: string; // ISO date
  project: string;
  labels: string[];
};

export const members: Member[] = [
  { id: "u1", name: "John Reyes", initials: "JR", color: "#5b5fef" },
  { id: "u2", name: "Rahul Mehta", initials: "RM", color: "#3fbf7f" },
  { id: "u3", name: "Sam Okafor", initials: "SO", color: "#f2a93b" },
  { id: "u4", name: "Priya Nair", initials: "PN", color: "#ef5b5b" },
];

export const currentUser = members[0];

export const statusMeta: Record<Status, { label: string; color: string }> = {
  todo: { label: "Todo", color: "var(--color-text-muted)" },
  in_progress: { label: "In Progress", color: "var(--color-accent)" },
  review: { label: "Review", color: "var(--color-amber)" },
  done: { label: "Done", color: "var(--color-green)" },
};

export const priorityMeta: Record<Priority, { label: string; color: string }> = {
  low: { label: "Low", color: "var(--color-text-muted)" },
  medium: { label: "Medium", color: "var(--color-accent)" },
  high: { label: "High", color: "var(--color-amber)" },
  urgent: { label: "Urgent", color: "var(--color-red)" },
};

export const tasks: Task[] = [
  {
    id: "TSK-041",
    title: "Set up JWT refresh token rotation",
    description: "Implement sliding refresh tokens with revocation on logout.",
    status: "in_progress",
    priority: "high",
    assignee: members[0],
    dueDate: "2026-08-06",
    project: "Auth Service",
    labels: ["backend", "security"],
  },
  {
    id: "TSK-042",
    title: "Design Kanban drag-and-drop interaction",
    description: "Column reflow, drop shadows, and keyboard-accessible reordering.",
    status: "todo",
    priority: "medium",
    assignee: members[2],
    dueDate: "2026-08-09",
    project: "Board UI",
    labels: ["frontend", "design"],
  },
  {
    id: "TSK-043",
    title: "Write onboarding email sequence",
    description: "Three-part email flow for new organization admins.",
    status: "todo",
    priority: "low",
    assignee: members[3],
    dueDate: "2026-08-14",
    project: "Growth",
    labels: ["content"],
  },
  {
    id: "TSK-044",
    title: "Fix timezone bug in due-date sorting",
    description: "Tasks due at midnight UTC display on the wrong day for GMT+ users.",
    status: "review",
    priority: "urgent",
    assignee: members[1],
    dueDate: "2026-08-04",
    project: "Board UI",
    labels: ["bug"],
  },
  {
    id: "TSK-045",
    title: "Add CSV export for reports",
    description: "Export completed and pending task reports as CSV.",
    status: "todo",
    priority: "medium",
    assignee: members[0],
    dueDate: "2026-08-12",
    project: "Reporting",
    labels: ["backend"],
  },
  {
    id: "TSK-046",
    title: "Audit color contrast across dark theme",
    description: "Run WCAG AA checks on all text/background pairs.",
    status: "in_progress",
    priority: "medium",
    assignee: members[2],
    dueDate: "2026-08-08",
    project: "Board UI",
    labels: ["design", "a11y"],
  },
  {
    id: "TSK-047",
    title: "Migrate file storage to S3",
    description: "Move attachment storage from local disk to S3 with signed URLs.",
    status: "done",
    priority: "high",
    assignee: members[1],
    dueDate: "2026-07-30",
    project: "Infra",
    labels: ["backend", "infra"],
  },
  {
    id: "TSK-048",
    title: "Build notification preferences panel",
    description: "Let users toggle email vs in-app notifications per event type.",
    status: "done",
    priority: "low",
    assignee: members[3],
    dueDate: "2026-07-28",
    project: "Settings",
    labels: ["frontend"],
  },
  {
    id: "TSK-049",
    title: "Load-test WebSocket connections",
    description: "Simulate 2,000 concurrent socket clients on staging.",
    status: "in_progress",
    priority: "high",
    assignee: members[0],
    dueDate: "2026-08-07",
    project: "Infra",
    labels: ["backend", "infra"],
  },
];

export const statusOrder: Status[] = ["todo", "in_progress", "review", "done"];

export function tasksByStatus(status: Status) {
  return tasks.filter((t) => t.status === status);
}

export function formatDueDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
