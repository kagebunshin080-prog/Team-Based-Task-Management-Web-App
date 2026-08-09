import { useMemo, useState } from 'react';
import { COLUMNS } from '../data/columns';
import { useBoard } from '../store/BoardContext';
import { Column } from './Column';
import { TaskModal } from './TaskModal';
import type { ColumnId, Task } from '../types';

export function Board({ search, memberFilter }: { search: string; memberFilter: string | null }) {
  const { tasksForActiveTeam, moveTask } = useBoard();
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [modalTask, setModalTask] = useState<Task | null | 'new'>(null);
  const [newTaskColumn, setNewTaskColumn] = useState<ColumnId>('backlog');

  const filtered = useMemo(() => {
    return tasksForActiveTeam.filter((t) => {
      const matchesSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      const matchesMember = !memberFilter || t.assigneeId === memberFilter;
      return matchesSearch && matchesMember;
    });
  }, [tasksForActiveTeam, search, memberFilter]);

  function tasksInColumn(columnId: ColumnId) {
    return filtered.filter((t) => t.columnId === columnId).sort((a, b) => a.order - b.order);
  }

  function openNewTask(columnId: ColumnId) {
    setNewTaskColumn(columnId);
    setModalTask('new');
  }

  return (
    <>
      <div className="board">
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            tasks={tasksInColumn(column.id)}
            draggingTaskId={draggingTaskId}
            onOpenTask={(task) => setModalTask(task)}
            onAddTask={openNewTask}
            onDragStartTask={setDraggingTaskId}
            onDragEndTask={() => setDraggingTaskId(null)}
            onDropTask={(columnId, beforeTaskId) => {
              if (draggingTaskId) moveTask(draggingTaskId, columnId, beforeTaskId);
              setDraggingTaskId(null);
            }}
          />
        ))}
      </div>

      {modalTask && (
        <TaskModal
          task={modalTask === 'new' ? null : modalTask}
          defaultColumn={newTaskColumn}
          onClose={() => setModalTask(null)}
        />
      )}
    </>
  );
}
