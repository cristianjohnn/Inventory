import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './hooks/useTheme.js';
import Layout from './components/layout/Layout.jsx';

import DashboardPage from './features/dashboard/DashboardPage.jsx';
import AssetsPage from './features/assets/AssetsPage.jsx';
import AssetDetailPage from './features/assets/AssetDetailPage.jsx';
import ReportsPage from './features/reports/ReportsPage.jsx';
import ProfilePage from './features/profile/ProfilePage.jsx';
import NotificationsPage from './features/notifications/NotificationsPage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';

export default function App() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      <Routes>
        {/* Full screen authentications routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Main application layout */}
        <Route path="/" element={<Layout isDark={isDark} onToggleTheme={toggleTheme} />}>
          <Route index element={<DashboardPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="assets/:id" element={<AssetDetailPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: isDark ? '#1a1a1a' : '#ffffff',
            color: isDark ? '#f5f5f5' : '#171717',
            border: isDark ? '1px solid #2a2a2a' : '1px solid #e5e5e5',
            fontSize: '13px',
            borderRadius: '8px',
          }
        }}
      />
    </>
  );
}
