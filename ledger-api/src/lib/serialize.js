function toDateString(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export function serializeTeam(row) {
  return {
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    memberIds: row.member_ids ?? [],
    inviteCode: row.invite_code,
  };
}

export function serializeUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
  };
}

export function serializeMember(row) {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    color: row.color,
  };
}

export function serializeTask(row) {
  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    teamId: row.team_id,
    columnId: row.column_id,
    title: row.title,
    description: row.description,
    assigneeId: row.assignee_id,
    priority: row.priority,
    dueDate: toDateString(row.due_date),
    tags: row.tags ?? [],
    order: row.position,
    createdAt: toDateString(row.created_at),
  };
}
