import type { ColumnDef } from '../types';

export const COLUMNS: ColumnDef[] = [
  { id: 'backlog', name: 'Backlog', description: 'Logged, not yet started' },
  { id: 'in-progress', name: 'In Progress', description: 'Being worked on' },
  { id: 'review', name: 'Review', description: 'Ready for a second pair of eyes' },
  { id: 'done', name: 'Done', description: 'Closed out' },
];
