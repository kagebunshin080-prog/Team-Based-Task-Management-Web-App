import { useState } from 'react';
import { AuthProvider, useAuth } from './store/AuthContext';
import { BoardProvider, useBoard } from './store/BoardContext';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Board } from './components/Board';
import { CalendarView } from './components/CalendarView';
import { TaskModal } from './components/TaskModal';
import type { ViewMode } from './types';

function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState<string | null>(null);
  const [quickNew, setQuickNew] = useState(false);
  const [view, setView] = useState<ViewMode>('board');
  const { activeTeam, loading, error } = useBoard();

  if (loading) return <div className="auth-loading">Loading your board…</div>;
  if (error) return <div className="auth-loading">{error}</div>;
  if (!activeTeam) return null;

  return (
    <div className="app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <TopBar
          search={search}
          onSearch={setSearch}
          memberFilter={memberFilter}
          onMemberFilter={setMemberFilter}
          onMenuClick={() => setSidebarOpen(true)}
          onNewTask={() => setQuickNew(true)}
          view={view}
          onViewChange={setView}
        />

        <main className="main-scroll">
          {view === 'board' ? (
            <Board search={search} memberFilter={memberFilter} />
          ) : (
            <CalendarView search={search} memberFilter={memberFilter} />
          )}
        </main>
      </div>

      {quickNew && <TaskModal task={null} defaultColumn="backlog" onClose={() => setQuickNew(false)} />}
    </div>
  );
}

function Gate() {
  const { status } = useAuth();

  if (status === 'loading') return <div className="auth-loading">Loading…</div>;
  if (status === 'signed-out') return <AuthScreen />;

  return (
    <BoardProvider>
      <Shell />
    </BoardProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
