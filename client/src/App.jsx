import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './hooks/useTheme.js';
import Layout from './components/layout/Layout.jsx';

import DashboardPage from './features/dashboard/DashboardPage.jsx';
import AssetsPage from './features/assets/AssetsPage.jsx';
import AssetDetailPage from './features/assets/AssetDetailPage.jsx';

export default function App() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout isDark={isDark} onToggleTheme={toggleTheme} />}>
          <Route index element={<DashboardPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="assets/:id" element={<AssetDetailPage />} />
        </Route>
      </Routes>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: isDark ? '#18181b' : '#ffffff',
            color: isDark ? '#fafafa' : '#09090b',
            border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7',
          }
        }}
      />
    </>
  );
}
