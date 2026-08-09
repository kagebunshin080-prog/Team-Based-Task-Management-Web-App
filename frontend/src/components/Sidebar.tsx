import { useState } from 'react';
import { IconClose, IconPlus, IconUserPlus } from '../icons';
import { useBoard } from '../store/BoardContext';

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, activeTeam, teamMembers, setActiveTeam, addMember, addTeam } = useBoard();
  const [addingTeam, setAddingTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [memberName, setMemberName] = useState('');

  function submitTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!teamName.trim()) return;
    const prefix = teamName.trim().slice(0, 3).toUpperCase();
    addTeam(teamName.trim(), prefix);
    setTeamName('');
    setAddingTeam(false);
  }

  function submitMember(e: React.FormEvent) {
    e.preventDefault();
    if (!memberName.trim()) return;
    addMember(memberName.trim());
    setMemberName('');
    setAddingMember(false);
  }

  return (
    <>
      <div className={`sidebar-overlay${open ? ' show' : ''}`} onClick={onClose} />

      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-mark">L</div>
          <div style={{ flex: 1 }}>
            <p className="sidebar-title">Ledger</p>
            <p className="sidebar-subtitle">Shared team logbook</p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close menu">
            <IconClose size={18} />
          </button>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-section-label">Teams</p>
          {state.teams.map((team) => (
            <button
              key={team.id}
              className={`team-row${team.id === activeTeam.id ? ' active' : ''}`}
              onClick={() => {
                setActiveTeam(team.id);
                onClose();
              }}
            >
              <span>{team.name}</span>
              <span className="prefix">{team.prefix}</span>
            </button>
          ))}

          {addingTeam ? (
            <form onSubmit={submitTeam} style={{ marginTop: 6 }}>
              <input
                autoFocus
                className="inline-input"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onBlur={() => !teamName && setAddingTeam(false)}
                placeholder="Team name"
              />
            </form>
          ) : (
            <button className="ghost-btn" onClick={() => setAddingTeam(true)}>
              <IconPlus size={13} /> New team
            </button>
          )}
        </div>

        <div className="sidebar-scroll">
          <div className="sidebar-section">
            <p className="sidebar-section-label">{activeTeam.name} members</p>
            {teamMembers.map((m) => (
              <div key={m.id} className="member-row">
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    background: m.color,
                    color: '#fff',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {m.initials}
                </span>
                <span className="member-name">{m.name}</span>
              </div>
            ))}

            {addingMember ? (
              <form onSubmit={submitMember} style={{ marginTop: 6 }}>
                <input
                  autoFocus
                  className="inline-input"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  onBlur={() => !memberName && setAddingMember(false)}
                  placeholder="Full name"
                />
              </form>
            ) : (
              <button className="ghost-btn" onClick={() => setAddingMember(true)}>
                <IconUserPlus size={13} /> Add member
              </button>
            )}
          </div>
        </div>

        <div className="sidebar-footer">Saved locally in this browser.</div>
      </aside>
    </>
  );
}
