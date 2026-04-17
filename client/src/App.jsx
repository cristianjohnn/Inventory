import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { useTheme } from './hooks/useTheme.js';
import Layout from './components/layout/Layout.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import AssetsPage from './features/assets/AssetsPage.jsx';
import AssetDetailPage from './features/assets/AssetDetailPage.jsx';
import ReportsPage from './features/reports/ReportsPage.jsx';
import NotificationsPage from './features/notifications/NotificationsPage.jsx';
import ProfilePage from './features/profile/ProfilePage.jsx';
import ActivityLogsPage from './features/activity-logs/ActivityLogsPage.jsx';

// Loading screen while checking auth
function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-body)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #e86c30, #d45a20)' }}>
          IT
        </div>
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// Public route — redirect to dashboard if already logged in
function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <AuthLoading />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

function AppRoutes() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: isDark ? '#1a1a1a' : '#ffffff',
            color: isDark ? '#f5f5f5' : '#171717',
            border: `1px solid ${isDark ? '#2a2a2a' : '#e5e5e5'}`,
            fontSize: '13px',
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout isDark={isDark} onToggleTheme={toggleTheme} />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/assets/:id" element={<AssetDetailPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/activity-logs" element={<ActivityLogsPage />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
