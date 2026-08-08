import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { seedState } from '../data/seed';
import type { BoardState, ColumnId, Member, Priority, Task, Team } from '../types';

interface NewTaskInput {
  title: string;
  description: string;
  assigneeId: string | null;
  priority: Priority;
  dueDate: string | null;
  tags: string[];
  columnId: ColumnId;
}

interface BoardContextValue {
  state: BoardState;
  activeTeam: Team;
  teamMembers: Member[];
  tasksForActiveTeam: Task[];
  setActiveTeam: (teamId: string) => void;
  addTask: (input: NewTaskInput) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, columnId: ColumnId, beforeTaskId: string | null) => void;
  addMember: (name: string) => void;
  addTeam: (name: string, prefix: string) => void;
}

const BoardContext = createContext<BoardContextValue | null>(null);

const PALETTE = ['#2F8F8B', '#C85A45', '#D89A34', '#3C5FDB', '#7A5FC0', '#4A9D5F'];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function BoardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useLocalStorage<BoardState>('ledger-board-state-v1', seedState);

  const activeTeam = useMemo(
    () => state.teams.find((t) => t.id === state.activeTeamId) ?? state.teams[0],
    [state.teams, state.activeTeamId],
  );

  const teamMembers = useMemo(
    () => state.members.filter((m) => activeTeam?.memberIds.includes(m.id)),
    [state.members, activeTeam],
  );

  const tasksForActiveTeam = useMemo(
    () => state.tasks.filter((t) => t.teamId === activeTeam?.id).sort((a, b) => a.order - b.order),
    [state.tasks, activeTeam],
  );

  const setActiveTeam = useCallback(
    (teamId: string) => setState((s) => ({ ...s, activeTeamId: teamId })),
    [setState],
  );

  const addTask = useCallback(
    (input: NewTaskInput) => {
      setState((s) => {
        const team = s.teams.find((t) => t.id === s.activeTeamId)!;
        const num = s.nextTicket[team.prefix] ?? 1;
        const columnTasks = s.tasks.filter((t) => t.teamId === team.id && t.columnId === input.columnId);
        const newTask: Task = {
          id: uid('task'),
          ticketNumber: num,
          teamId: team.id,
          columnId: input.columnId,
          title: input.title,
          description: input.description,
          assigneeId: input.assigneeId,
          priority: input.priority,
          dueDate: input.dueDate,
          tags: input.tags,
          order: columnTasks.length,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        return {
          ...s,
          tasks: [...s.tasks, newTask],
          nextTicket: { ...s.nextTicket, [team.prefix]: num + 1 },
        };
      });
    },
    [setState],
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<Task>) => {
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      }));
    },
    [setState],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
    },
    [setState],
  );

  // Moves `id` into `columnId`, placing it directly before `beforeTaskId`
  // (or at the end of the column when `beforeTaskId` is null).
  const moveTask = useCallback(
    (id: string, columnId: ColumnId, beforeTaskId: string | null) => {
      setState((s) => {
        const moving = s.tasks.find((t) => t.id === id);
        if (!moving) return s;

        const others = s.tasks.filter((t) => t.id !== id);
        const destColumn = others
          .filter((t) => t.teamId === moving.teamId && t.columnId === columnId)
          .sort((a, b) => a.order - b.order);

        const insertAt = beforeTaskId ? destColumn.findIndex((t) => t.id === beforeTaskId) : -1;
        const movedTask = { ...moving, columnId };
        if (insertAt === -1) {
          destColumn.push(movedTask);
        } else {
          destColumn.splice(insertAt, 0, movedTask);
        }
        const reindexed = destColumn.map((t, i) => ({ ...t, order: i }));

        const rest = others.filter((t) => !(t.teamId === moving.teamId && t.columnId === columnId));
        return { ...s, tasks: [...rest, ...reindexed] };
      });
    },
    [setState],
  );

  const addMember = useCallback(
    (name: string) => {
      setState((s) => {
        const id = uid('m');
        const color = PALETTE[s.members.length % PALETTE.length];
        const member: Member = { id, name, initials: initials(name), color };
        const teams = s.teams.map((t) =>
          t.id === s.activeTeamId ? { ...t, memberIds: [...t.memberIds, id] } : t,
        );
        return { ...s, members: [...s.members, member], teams };
      });
    },
    [setState],
  );

  const addTeam = useCallback(
    (name: string, prefix: string) => {
      setState((s) => {
        const id = uid('team');
        const team: Team = { id, name, prefix: prefix.toUpperCase(), memberIds: [] };
        return {
          ...s,
          teams: [...s.teams, team],
          activeTeamId: id,
          nextTicket: { ...s.nextTicket, [team.prefix]: 1 },
        };
      });
    },
    [setState],
  );

  const value: BoardContextValue = {
    state,
    activeTeam: activeTeam!,
    teamMembers,
    tasksForActiveTeam,
    setActiveTeam,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addMember,
    addTeam,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used within BoardProvider');
  return ctx;
}
