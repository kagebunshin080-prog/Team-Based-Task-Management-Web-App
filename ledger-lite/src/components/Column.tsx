import { useRef, useState } from 'react';
import { IconPlus } from '../icons';
import { TaskCard } from './TaskCard';
import type { ColumnDef, ColumnId, Task } from '../types';

export function Column({
  column,
  tasks,
  draggingTaskId,
  onOpenTask,
  onAddTask,
  onDragStartTask,
  onDragEndTask,
  onDropTask,
}: {
  column: ColumnDef;
  tasks: Task[];
  draggingTaskId: string | null;
  onOpenTask: (task: Task) => void;
  onAddTask: (columnId: ColumnId) => void;
  onDragStartTask: (taskId: string) => void;
  onDragEndTask: () => void;
  onDropTask: (columnId: ColumnId, beforeTaskId: string | null) => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [isOver, setIsOver] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsOver(false);
    if (!draggingTaskId) return;

    const cards = Array.from(bodyRef.current?.querySelectorAll<HTMLElement>('[data-task-id]') ?? []).filter(
      (el) => el.dataset.taskId !== draggingTaskId,
    );

    let beforeTaskId: string | null = null;
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) {
        beforeTaskId = card.dataset.taskId ?? null;
        break;
      }
    }

    onDropTask(column.id, beforeTaskId);
  }

  return (
    <div className="column">
      <div className="column-head">
        <div className="column-head-row">
          <h2 className="column-name">{column.name}</h2>
          <span className="column-count">{tasks.length}</span>
        </div>
        <p className="column-desc">{column.description}</p>
      </div>

      <div
        ref={bodyRef}
        className={`column-body${isOver ? ' drag-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={handleDrop}
      >
        <div className="column-tasks">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isDragging={draggingTaskId === task.id}
              onOpen={onOpenTask}
              onDragStart={onDragStartTask}
              onDragEnd={onDragEndTask}
            />
          ))}
        </div>

        {tasks.length === 0 && <p className="column-empty">Nothing logged here yet</p>}

        <button className="add-task-btn" onClick={() => onAddTask(column.id)}>
          <IconPlus size={13} /> Add task
        </button>
      </div>
    </div>
  );
}
