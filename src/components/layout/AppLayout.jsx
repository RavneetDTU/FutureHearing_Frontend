import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { USE_MOCK_API } from '../../api/config';
import { useSession } from '../../context/SessionContext';
import { LoadingState } from '../ui';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, loading, error, refetch } = useSession();

  useEffect(() => setMobileOpen(false), [pathname]);

  const toggle = () => {
    if (window.matchMedia('(max-width: 960px)').matches) setMobileOpen((o) => !o);
    else setCollapsed((c) => !c);
  };

  if (!USE_MOCK_API && loading) {
    return (
      <div className="auth-page">
        <LoadingState message="Signing you in…" />
      </div>
    );
  }

  if (!USE_MOCK_API && !user && error && error.status !== 401) {
    return (
      <div className="auth-page">
        <LoadingState message="Unable to reach the server." />
        <button type="button" className="btn btn-primary" onClick={refetch} style={{ marginTop: 16 }}>
          Retry
        </button>
      </div>
    );
  }

  if (!USE_MOCK_API && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={clsx('app-shell', collapsed && 'is-collapsed', mobileOpen && 'is-mobile-open')}>
      <Sidebar onNavigate={() => setMobileOpen(false)} />
      <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      <div className="app-main">
        {USE_MOCK_API && (
          <div className="mock-banner no-print">
            Development preview — showing temporary mock data. Changes are not saved. Set VITE_API_BASE_URL to connect the
            backend.
          </div>
        )}
        <Header onToggleSidebar={toggle} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  );
}
