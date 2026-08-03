import { Member, Priority, priorityMeta } from "@/lib/data";

export function Avatar({ member, size = 28 }: { member: Member; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-mono-data font-medium shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        backgroundColor: `${member.color}26`,
        color: member.color,
        border: `1px solid ${member.color}4d`,
      }}
      title={member.name}
    >
      {member.initials}
    </div>
  );
}

export function PriorityFlag({ priority }: { priority: Priority }) {
  const meta = priorityMeta[priority];
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono-data text-[11px] uppercase tracking-wide"
      style={{ color: meta.color }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
}

export function TaskId({ id }: { id: string }) {
  return (
    <span className="font-mono-data text-[11px] text-[var(--color-text-faint)] tracking-wide">
      {id}
    </span>
  );
}
