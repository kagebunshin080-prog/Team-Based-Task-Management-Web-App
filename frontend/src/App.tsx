import { useState } from 'react';
import { BoardProvider, useBoard } from './store/BoardContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Board } from './components/Board';
import { TaskModal } from './components/TaskModal';

function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState<string | null>(null);
  const [quickNew, setQuickNew] = useState(false);
  const { activeTeam } = useBoard();

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
        />

        <main className="main-scroll">
          <Board search={search} memberFilter={memberFilter} />
        </main>
      </div>

      {quickNew && <TaskModal task={null} defaultColumn="backlog" onClose={() => setQuickNew(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <BoardProvider>
      <Shell />
    </BoardProvider>
  );
}
