"use client";

import { useState } from "react";
import { Task, Status, statusOrder, statusMeta, formatDueDate } from "@/lib/data";
import { Avatar, PriorityFlag, TaskId } from "./ui";
import { Plus } from "lucide-react";

export function Board({ initialTasks }: { initialTasks: Task[] }) {
  const [items, setItems] = useState(initialTasks);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<Status | null>(null);

  function moveTask(id: string, status: Status) {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  return (
    <div className="flex gap-4 overflow-x-auto thin-scroll pb-4 px-8 pt-6">
      {statusOrder.map((status) => {
        const lane = items.filter((t) => t.status === status);
        const isOver = overStatus === status;
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStatus(status);
            }}
            onDragLeave={() => setOverStatus((s) => (s === status ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              if (dragId) moveTask(dragId, status);
              setDragId(null);
              setOverStatus(null);
            }}
            className={`w-[300px] shrink-0 rounded-lg border bg-[var(--color-surface)] flex flex-col max-h-[calc(100vh-140px)] transition-colors ${
              isOver ? "border-[var(--color-accent)]" : "border-[var(--color-border)]"
            }`}
          >
            <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: statusMeta[status].color }}
                />
                <h2 className="text-sm font-medium">{statusMeta[status].label}</h2>
              </div>
              <span className="font-mono-data text-[11px] text-[var(--color-text-faint)]">
                [{String(lane.length).padStart(2, "0")}]
              </span>
            </div>

            <div className="flex-1 overflow-y-auto thin-scroll p-3 space-y-2.5">
              {lane.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => setDragId(t.id)}
                  onDragEnd={() => setDragId(null)}
                  className={`rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3.5 cursor-grab active:cursor-grabbing hover:border-[var(--color-text-faint)] transition-colors ${
                    dragId === t.id ? "opacity-40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <TaskId id={t.id} />
                    <PriorityFlag priority={t.priority} />
                  </div>
                  <p className="text-sm leading-snug">{t.title}</p>
                  {t.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {t.labels.map((l) => (
                        <span
                          key={l}
                          className="text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[11px] text-[var(--color-text-faint)] font-mono-data">
                      Due {formatDueDate(t.dueDate)}
                    </span>
                    <Avatar member={t.assignee} size={22} />
                  </div>
                </div>
              ))}

              <button className="w-full flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] hover:bg-white/[0.03] transition-colors">
                <Plus size={14} />
                Add task
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
