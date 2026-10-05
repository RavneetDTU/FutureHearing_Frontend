import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
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

  if (loading) {
    return (
      <div className="auth-page">
        <LoadingState message="Signing you in…" />
      </div>
    );
  }

  if (!user && error && error.status !== 401) {
    return (
      <div className="auth-page">
        <LoadingState message="Unable to reach the server." />
        <button type="button" className="btn btn-primary" onClick={refetch} style={{ marginTop: 16 }}>
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={clsx('app-shell', collapsed && 'is-collapsed', mobileOpen && 'is-mobile-open')}>
      <Sidebar onNavigate={() => setMobileOpen(false)} />
      <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      <div className="app-main">
        <Header onToggleSidebar={toggle} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  );
}
