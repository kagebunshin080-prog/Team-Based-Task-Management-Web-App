import type { BoardState, Member, Task, Team } from '../types';

const members: Member[] = [
  { id: 'm1', name: 'Priya Nair', initials: 'PN', color: '#2F8F8B' },
  { id: 'm2', name: 'Marcus Reid', initials: 'MR', color: '#C85A45' },
  { id: 'm3', name: 'Sofia Alvarez', initials: 'SA', color: '#D89A34' },
  { id: 'm4', name: 'Kenji Watanabe', initials: 'KW', color: '#3C5FDB' },
  { id: 'm5', name: 'Ada Osei', initials: 'AO', color: '#7A5FC0' },
];

const teams: Team[] = [
  { id: 't1', name: 'Product Engineering', prefix: 'ENG', memberIds: ['m1', 'm2', 'm3', 'm4'] },
  { id: 't2', name: 'Marketing', prefix: 'MKT', memberIds: ['m3', 'm5'] },
];

function iso(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

const tasks: Task[] = [
  {
    id: 'task-1', ticketNumber: 12, teamId: 't1', columnId: 'in-progress',
    title: 'Rebuild onboarding checklist flow', description: 'Replace the modal-based flow with an inline stepper on the dashboard.',
    assigneeId: 'm1', priority: 'high', dueDate: iso(3), tags: ['frontend'], order: 0, createdAt: iso(-6),
  },
  {
    id: 'task-2', ticketNumber: 13, teamId: 't1', columnId: 'backlog',
    title: 'Investigate flaky checkout webhook tests', description: 'CI has failed intermittently on the payments suite for the past week.',
    assigneeId: 'm2', priority: 'urgent', dueDate: iso(1), tags: ['bug', 'ci'], order: 0, createdAt: iso(-2),
  },
  {
    id: 'task-3', ticketNumber: 14, teamId: 't1', columnId: 'backlog',
    title: 'Add dark mode token set', description: 'Extend the design tokens with a parallel dark palette for the settings page.',
    assigneeId: null, priority: 'low', dueDate: null, tags: ['design'], order: 1, createdAt: iso(-1),
  },
  {
    id: 'task-4', ticketNumber: 15, teamId: 't1', columnId: 'review',
    title: 'API rate limit headers', description: 'Add X-RateLimit-* headers to all public endpoints and document them.',
    assigneeId: 'm4', priority: 'normal', dueDate: iso(5), tags: ['api'], order: 0, createdAt: iso(-4),
  },
  {
    id: 'task-5', ticketNumber: 9, teamId: 't1', columnId: 'done',
    title: 'Migrate logging to structured JSON', description: 'All services now emit structured logs consumed by the new pipeline.',
    assigneeId: 'm4', priority: 'normal', dueDate: null, tags: ['infra'], order: 0, createdAt: iso(-10),
  },
  {
    id: 'task-6', ticketNumber: 4, teamId: 't2', columnId: 'in-progress',
    title: 'Draft Q3 launch newsletter', description: 'First pass copy for the September feature launch, needs a review pass.',
    assigneeId: 'm3', priority: 'high', dueDate: iso(2), tags: ['copy'], order: 0, createdAt: iso(-3),
  },
  {
    id: 'task-7', ticketNumber: 5, teamId: 't2', columnId: 'backlog',
    title: 'Refresh partner one-pager', description: 'Update the numbers and case studies in the partner deck.',
    assigneeId: 'm5', priority: 'low', dueDate: iso(10), tags: ['sales'], order: 0, createdAt: iso(-1),
  },
];

export const seedState: BoardState = {
  members,
  teams,
  tasks,
  activeTeamId: 't1',
  nextTicket: { ENG: 16, MKT: 6 },
};
