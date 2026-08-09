import { IconMenu, IconPlus, IconSearch } from '../icons';
import { useBoard } from '../store/BoardContext';
import { MemberAvatar } from './MemberAvatar';

export function TopBar({
  search,
  onSearch,
  memberFilter,
  onMemberFilter,
  onMenuClick,
  onNewTask,
}: {
  search: string;
  onSearch: (v: string) => void;
  memberFilter: string | null;
  onMemberFilter: (id: string | null) => void;
  onMenuClick: () => void;
  onNewTask: () => void;
}) {
  const { activeTeam, teamMembers, tasksForActiveTeam } = useBoard();
  const openCount = tasksForActiveTeam.filter((t) => t.columnId !== 'done').length;

  return (
    <header className="topbar">
      <div className="topbar-row">
        <button className="menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <IconMenu size={20} />
        </button>
        <div style={{ minWidth: 0 }}>
          <h1 className="board-title">{activeTeam.name}</h1>
          <p className="board-subtitle">
            {openCount} open {openCount === 1 ? 'entry' : 'entries'} on the board
          </p>
        </div>
        <button className="primary-btn" onClick={onNewTask}>
          <IconPlus size={15} /> <span>New task</span>
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <IconSearch size={14} />
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search title or tag" />
        </div>

        <div className="member-filters">
          <button className={`chip${memberFilter === null ? ' active' : ''}`} onClick={() => onMemberFilter(null)}>
            Everyone
          </button>
          {teamMembers.map((m) => (
            <button
              key={m.id}
              className={`avatar-chip${memberFilter === m.id ? ' active' : ''}`}
              onClick={() => onMemberFilter(memberFilter === m.id ? null : m.id)}
              title={m.name}
            >
              <MemberAvatar member={m} size="sm" />
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
