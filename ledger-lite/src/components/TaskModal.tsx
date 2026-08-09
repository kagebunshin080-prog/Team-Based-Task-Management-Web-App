import { useState } from 'react';
import { IconClose, IconTrash } from '../icons';
import { useBoard } from '../store/BoardContext';
import { COLUMNS } from '../data/columns';
import type { ColumnId, Priority, Task } from '../types';

const PRIORITIES: Priority[] = ['low', 'normal', 'high', 'urgent'];

export function TaskModal({
  task,
  defaultColumn,
  defaultDueDate,
  onClose,
}: {
  task: Task | null;
  defaultColumn: ColumnId;
  defaultDueDate?: string | null;
  onClose: () => void;
}) {
  const { teamMembers, activeTeam, addTask, updateTask, deleteTask } = useBoard();
  const isEdit = !!task;

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [assigneeId, setAssigneeId] = useState<string>(task?.assigneeId ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'normal');
  const [dueDate, setDueDate] = useState(task?.dueDate ?? defaultDueDate ?? '');
  const [tags, setTags] = useState(task?.tags.join(', ') ?? '');
  const [columnId, setColumnId] = useState<ColumnId>(task?.columnId ?? defaultColumn);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (isEdit && task) {
      updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        assigneeId: assigneeId || null,
        priority,
        dueDate: dueDate || null,
        tags: parsedTags,
        columnId,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        assigneeId: assigneeId || null,
        priority,
        dueDate: dueDate || null,
        tags: parsedTags,
        columnId,
      });
    }
    onClose();
  }

  function handleDelete() {
    if (task) deleteTask(task.id);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="modal-eyebrow">
              {isEdit ? `${activeTeam?.prefix}-${task!.ticketNumber}` : `${activeTeam?.prefix}-new`}
            </p>
            <h2 className="modal-title">{isEdit ? 'Edit entry' : 'New entry'}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: 'var(--ink-faint)' }}>
            <IconClose size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="field">
            <label>Title</label>
            <input
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
            />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add context, links, or notes"
            />
          </div>

          <div className="field-grid">
            <div className="field">
              <label>Assignee</label>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p[0].toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Due date</label>
              <input type="date" value={dueDate ?? ''} onChange={(e) => setDueDate(e.target.value)} />
            </div>

            <div className="field">
              <label>Column</label>
              <select value={columnId} onChange={(e) => setColumnId(e.target.value as ColumnId)}>
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>
              Tags <span className="hint">(comma separated)</span>
            </label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="frontend, bug" />
          </div>

          <div className="modal-actions">
            {isEdit ? (
              <button type="button" onClick={handleDelete} className="delete-link">
                <IconTrash size={14} /> Delete entry
              </button>
            ) : (
              <span />
            )}
            <div className="btn-row">
              <button type="button" onClick={onClose} className="secondary-btn">
                Cancel
              </button>
              <button type="submit" className="primary-btn" style={{ marginLeft: 0 }}>
                {isEdit ? 'Save changes' : 'Log entry'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
