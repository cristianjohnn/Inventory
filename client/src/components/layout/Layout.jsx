import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

export default function Layout({ isDark, onToggleTheme }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Header isDark={isDark} onToggleTheme={onToggleTheme} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
