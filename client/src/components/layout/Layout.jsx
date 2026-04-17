import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

export default function Layout({ isDark, onToggleTheme, children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header isDark={isDark} onToggleTheme={onToggleTheme} />
        <main className="app-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
