import type { Priority } from '../types';

const LABEL: Record<Priority, string> = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
};

export function priorityBarClass(priority: Priority): string {
  return `bar-${priority}`;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`priority-badge priority-${priority}`}>
      <span className="priority-dot" />
      {LABEL[priority]}
    </span>
  );
}
