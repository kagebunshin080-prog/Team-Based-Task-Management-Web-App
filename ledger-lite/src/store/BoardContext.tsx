import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, ApiError } from '../lib/api';
import { useAuth } from './AuthContext';
import type { ColumnId, Member, Priority, Task, Team } from '../types';

const ACTIVE_TEAM_KEY = 'ledger-active-team-id-v1';

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
  loading: boolean;
  error: string | null;
  teams: Team[];
  activeTeam: Team | null;
  teamMembers: Member[];
  tasksForActiveTeam: Task[];
  setActiveTeam: (teamId: string) => void;
  addTask: (input: NewTaskInput) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, columnId: ColumnId, beforeTaskId: string | null) => void;
  addMember: (name: string) => Promise<void>;
  addTeam: (name: string, prefix: string) => Promise<void>;
  joinTeam: (inviteCode: string) => Promise<void>;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load teams + members once signed in.
  useEffect(() => {
    if (status !== 'signed-in') return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([api.get<Team[]>('/api/teams'), api.get<Member[]>('/api/members')])
      .then(([teamsRes, membersRes]) => {
        if (cancelled) return;
        setTeams(teamsRes);
        setMembers(membersRes);
        const stored = window.localStorage.getItem(ACTIVE_TEAM_KEY);
        const validStored = stored && teamsRes.some((t) => t.id === stored) ? stored : null;
        setActiveTeamId(validStored ?? teamsRes[0]?.id ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load your board.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const refetchTasks = useCallback(async (teamId: string) => {
    const res = await api.get<Task[]>(`/api/tasks?teamId=${encodeURIComponent(teamId)}`);
    setTasks(res);
  }, []);

  // Load tasks whenever the active team changes.
  useEffect(() => {
    if (!activeTeamId) {
      setTasks([]);
      return;
    }
    window.localStorage.setItem(ACTIVE_TEAM_KEY, activeTeamId);
    let cancelled = false;
    refetchTasks(activeTeamId).catch((err) => {
      if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load tasks.');
    });
    return () => {
      cancelled = true;
    };
  }, [activeTeamId, refetchTasks]);

  const activeTeam = useMemo(
    () => teams.find((t) => t.id === activeTeamId) ?? null,
    [teams, activeTeamId],
  );

  const teamMembers = useMemo(
    () => members.filter((m) => activeTeam?.memberIds.includes(m.id)),
    [members, activeTeam],
  );

  const tasksForActiveTeam = useMemo(() => [...tasks].sort((a, b) => a.order - b.order), [tasks]);

  const setActiveTeam = useCallback((teamId: string) => setActiveTeamId(teamId), []);

  const addTask = useCallback(
    async (input: NewTaskInput) => {
      if (!activeTeam) return;
      const created = await api.post<Task>('/api/tasks', { ...input, teamId: activeTeam.id });
      setTasks((prev) => [...prev, created]);
    },
    [activeTeam],
  );

  const updateTask = useCallback(async (id: string, patch: Partial<Task>) => {
    const updated = await api.patch<Task>(`/api/tasks/${id}`, patch);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await api.delete(`/api/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Optimistically reorders locally (for a snappy drag-and-drop feel), then
  // asks the server to persist the move. If the server call fails, the task
  // list is refetched so the UI falls back to the source of truth.
  const moveTask = useCallback(
    (id: string, columnId: ColumnId, beforeTaskId: string | null) => {
      setTasks((prev) => {
        const moving = prev.find((t) => t.id === id);
        if (!moving) return prev;

        const others = prev.filter((t) => t.id !== id);
        const destColumn = others.filter((t) => t.columnId === columnId).sort((a, b) => a.order - b.order);

        const insertAt = beforeTaskId ? destColumn.findIndex((t) => t.id === beforeTaskId) : -1;
        const movedTask = { ...moving, columnId };
        if (insertAt === -1) {
          destColumn.push(movedTask);
        } else {
          destColumn.splice(insertAt, 0, movedTask);
        }
        const reindexed = destColumn.map((t, i) => ({ ...t, order: i }));
        const rest = others.filter((t) => !(t.columnId === columnId));
        return [...rest, ...reindexed];
      });

      api.patch(`/api/tasks/${id}/move`, { columnId, beforeTaskId }).catch(() => {
        if (activeTeamId) refetchTasks(activeTeamId).catch(() => {});
      });
    },
    [activeTeamId, refetchTasks],
  );

  const addMember = useCallback(
    async (name: string) => {
      if (!activeTeam) return;
      const member = await api.post<Member>('/api/members', { name, teamId: activeTeam.id });
      setMembers((prev) => [...prev, member]);
      setTeams((prev) =>
        prev.map((t) => (t.id === activeTeam.id ? { ...t, memberIds: [...t.memberIds, member.id] } : t)),
      );
    },
    [activeTeam],
  );

  const addTeam = useCallback(async (name: string, prefix: string) => {
    const team = await api.post<Team>('/api/teams', { name, prefix });
    setTeams((prev) => [...prev, team]);
    setActiveTeamId(team.id);
  }, []);

  const joinTeam = useCallback(async (inviteCode: string) => {
    const team = await api.post<Team>('/api/teams/join', { inviteCode });
    setTeams((prev) => (prev.some((t) => t.id === team.id) ? prev : [...prev, team]));
    const membersRes = await api.get<Member[]>('/api/members');
    setMembers(membersRes);
    setActiveTeamId(team.id);
  }, []);

  const value: BoardContextValue = {
    loading,
    error,
    teams,
    activeTeam,
    teamMembers,
    tasksForActiveTeam,
    setActiveTeam,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addMember,
    addTeam,
    joinTeam,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used within BoardProvider');
  return ctx;
}
