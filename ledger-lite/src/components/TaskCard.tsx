import { useBoard } from '../store/BoardContext';
import { priorityBarClass } from './PriorityBadge';
import { MemberAvatar } from './MemberAvatar';
import type { Task } from '../types';

function formatDue(dueDate: string | null): { label: string; overdue: boolean } | null {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  const overdue = diffDays < 0;
  let label: string;
  if (diffDays === 0) label = 'Today';
  else if (diffDays === 1) label = 'Tomorrow';
  else if (diffDays === -1) label = '1 day late';
  else if (diffDays < 0) label = `${Math.abs(diffDays)} days late`;
  else if (diffDays <= 6) label = `${diffDays}d`;
  else label = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return { label, overdue };
}

export function TaskCard({
  task,
  isDragging,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  isDragging: boolean;
  onOpen: (task: Task) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
}) {
  const { teamMembers, activeTeam } = useBoard();
  const assignee = teamMembers.find((m) => m.id === task.assigneeId) ?? null;
  const due = formatDue(task.dueDate);

  return (
    <div
      className={`task-card${isDragging ? ' dragging' : ''}`}
      draggable
      data-task-id={task.id}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(task.id);
      }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(task)}
    >
      <span className={`bar ${priorityBarClass(task.priority)}`} />

      <div className="task-card-head">
        <span className="ticket-id">
          {activeTeam?.prefix}-{task.ticketNumber}
        </span>
      </div>

      <h3 className="task-title">{task.title}</h3>

      {task.tags.length > 0 && (
        <div className="tag-row">
          {task.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="task-card-foot">
        {due ? <span className={`due-label${due.overdue ? ' overdue' : ''}`}>{due.label}</span> : <span />}
        <MemberAvatar member={assignee} size="sm" />
      </div>
    </div>
  );
}
