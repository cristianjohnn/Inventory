import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

export default function Layout({ isDark, onToggleTheme, children }) {
  return (
    <div className="flex h-screen overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors duration-400">
      <Sidebar isDark={isDark} />
      <div className="flex-1 flex-col min-w-0">
        <Header isDark={isDark} onToggleTheme={onToggleTheme} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
