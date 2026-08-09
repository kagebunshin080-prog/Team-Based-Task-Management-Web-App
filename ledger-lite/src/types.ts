export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface Member {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Team {
  id: string;
  name: string;
  prefix: string;
  memberIds: string[];
  inviteCode?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export type ColumnId = 'backlog' | 'in-progress' | 'review' | 'done';

export interface ColumnDef {
  id: ColumnId;
  name: string;
  description: string;
}

export interface Task {
  id: string;
  ticketNumber: number;
  teamId: string;
  columnId: ColumnId;
  title: string;
  description: string;
  assigneeId: string | null;
  priority: Priority;
  dueDate: string | null;
  tags: string[];
  order: number;
  createdAt: string;
}

export interface BoardState {
  members: Member[];
  teams: Team[];
  tasks: Task[];
  activeTeamId: string;
  nextTicket: Record<string, number>;
}
