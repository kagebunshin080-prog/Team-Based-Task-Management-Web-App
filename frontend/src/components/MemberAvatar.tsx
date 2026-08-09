import type { Member } from '../types';

export function MemberAvatar({ member, size = 'md' }: { member: Member | null | undefined; size?: 'sm' | 'md' }) {
  if (!member) {
    return (
      <div className={`avatar ${size} unassigned`} title="Unassigned">
        —
      </div>
    );
  }

  return (
    <div className={`avatar ${size}`} style={{ backgroundColor: member.color }} title={member.name}>
      {member.initials}
    </div>
  );
}
