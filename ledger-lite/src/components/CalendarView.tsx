import { useMemo, useState } from 'react';
import { IconChevronLeft, IconChevronRight, IconPlus } from '../icons';
import { useBoard } from '../store/BoardContext';
import { priorityBarClass } from './PriorityBadge';
import { MemberAvatar } from './MemberAvatar';
import { TaskModal } from './TaskModal';
import type { Task } from '../types';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildGrid(monthAnchor: Date): Date[] {
  const first = startOfMonth(monthAnchor);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

function formatSelectedHeading(key: string): string {
  const date = new Date(key + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function CalendarView({ search, memberFilter }: { search: string; memberFilter: string | null }) {
  const { activeTeam, teamMembers, tasksForActiveTeam } = useBoard();
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [selectedKey, setSelectedKey] = useState(() => toKey(new Date()));
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [addingForDate, setAddingForDate] = useState<string | null>(null);

  const filteredTasks = useMemo(
    () =>
      tasksForActiveTeam.filter((t) => {
        const matchesSearch =
          !search ||
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
        const matchesMember = !memberFilter || t.assigneeId === memberFilter;
        return matchesSearch && matchesMember;
      }),
    [tasksForActiveTeam, search, memberFilter],
  );

  // Only tasks that are still pending (not Done) and have a due date show up here.
  const pendingByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of filteredTasks) {
      if (!task.dueDate || task.columnId === 'done') continue;
      const list = map.get(task.dueDate) ?? [];
      list.push(task);
      map.set(task.dueDate, list);
    }
    return map;
  }, [filteredTasks]);

  const grid = useMemo(() => buildGrid(monthAnchor), [monthAnchor]);
  const todayKey = toKey(new Date());
  const monthLabel = monthAnchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const selectedTasks = (pendingByDate.get(selectedKey) ?? []).slice().sort((a, b) => a.order - b.order);

  function goToMonth(delta: number) {
    setMonthAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  function goToToday() {
    const now = new Date();
    setMonthAnchor(startOfMonth(now));
    setSelectedKey(toKey(now));
  }

  return (
    <div className="calendar-layout">
      <div className="calendar-panel">
        <div className="calendar-head">
          <h2 className="calendar-month">{monthLabel}</h2>
          <div className="calendar-nav">
            <button className="icon-btn" onClick={() => goToMonth(-1)} aria-label="Previous month">
              <IconChevronLeft />
            </button>
            <button className="calendar-today-btn" onClick={goToToday}>
              Today
            </button>
            <button className="icon-btn" onClick={() => goToMonth(1)} aria-label="Next month">
              <IconChevronRight />
            </button>
          </div>
        </div>

        <div className="calendar-weekdays">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {grid.map((date) => {
            const key = toKey(date);
            const inMonth = date.getMonth() === monthAnchor.getMonth();
            const dayTasks = pendingByDate.get(key) ?? [];
            const priorities = Array.from(new Set(dayTasks.map((t) => t.priority)));

            return (
              <button
                key={key}
                className={`calendar-cell${inMonth ? '' : ' outside'}${key === todayKey ? ' today' : ''}${
                  key === selectedKey ? ' selected' : ''
                }`}
                onClick={() => setSelectedKey(key)}
              >
                <span className="calendar-date">{date.getDate()}</span>
                {dayTasks.length > 0 && (
                  <span className="calendar-dots">
                    {priorities.slice(0, 4).map((p) => (
                      <span key={p} className={`calendar-dot ${priorityBarClass(p)}`} />
                    ))}
                  </span>
                )}
                {dayTasks.length > 0 && <span className="calendar-count">{dayTasks.length}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="calendar-side">
        <div className="calendar-side-head">
          <div>
            <h3 className="calendar-side-title">{formatSelectedHeading(selectedKey)}</h3>
            <p className="calendar-side-sub">
              {selectedTasks.length} pending {selectedTasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          <button className="add-task-btn calendar-add-btn" onClick={() => setAddingForDate(selectedKey)}>
            <IconPlus size={13} /> Add task
          </button>
        </div>

        {selectedTasks.length === 0 ? (
          <p className="column-empty" style={{ marginTop: 24 }}>
            Nothing due this day
          </p>
        ) : (
          <div className="calendar-task-list">
            {selectedTasks.map((task) => {
              const assignee = teamMembers.find((m) => m.id === task.assigneeId) ?? null;
              return (
                <div key={task.id} className="calendar-task-row" onClick={() => setEditingTask(task)}>
                  <span className={`bar ${priorityBarClass(task.priority)}`} />
                  <div className="calendar-task-info">
                    <span className="ticket-id">
                      {activeTeam?.prefix}-{task.ticketNumber}
                    </span>
                    <p className="calendar-task-title">{task.title}</p>
                  </div>
                  <MemberAvatar member={assignee} size="sm" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingTask && (
        <TaskModal task={editingTask} defaultColumn={editingTask.columnId} onClose={() => setEditingTask(null)} />
      )}
      {addingForDate && (
        <TaskModal
          task={null}
          defaultColumn="backlog"
          defaultDueDate={addingForDate}
          onClose={() => setAddingForDate(null)}
        />
      )}
    </div>
  );
}
