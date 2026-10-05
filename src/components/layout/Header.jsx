import { Bell, Building, LogOut, Menu, Settings, User } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationsApi } from '../../api';
import { useSession } from '../../context/SessionContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useOptions } from '../../hooks/useOptions';
import { formatRelative } from '../../utils/format';
import { Avatar, Button, SearchBar, Select } from '../ui';
import { Breadcrumbs } from './Breadcrumbs';

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);
  return { open, setOpen, ref, close };
}

function Notifications() {
  const dd = useDropdown();
  const { data = [], loading, error } = useApiQuery(() => notificationsApi.list(), [], { initialData: [] });
  const unread = (data || []).filter((n) => !n.read).length;

  return (
    <div className="dropdown" ref={dd.ref}>
      <Button
        variant="ghost"
        iconOnly
        icon={Bell}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        onClick={() => dd.setOpen((o) => !o)}
      />
      {unread > 0 && <span className="notif-dot" />}
      {dd.open && (
        <div className="popover popover-right" style={{ width: 340 }}>
          <div className="row-between" style={{ padding: '6px 10px' }}>
            <strong>Notifications</strong>
            {unread > 0 && <span className="text-sm muted">{unread} unread</span>}
          </div>
          {loading && <div className="option-empty">Loading notifications…</div>}
          {error && <div className="option-empty text-danger">Unable to load notifications.</div>}
          {!loading && !error && !data.length && <div className="option-empty">You're all caught up.</div>}
          {data.map((n) => (
            <Link
              key={n.id}
              to={n.link || '#'}
              className="option"
              onClick={() => {
                if (!n.read) notificationsApi.markRead(n.id).catch(() => {});
                dd.close();
              }}
              style={{ alignItems: 'flex-start' }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  marginTop: 6,
                  borderRadius: 4,
                  flexShrink: 0,
                  background: n.read ? 'transparent' : 'var(--color-primary)',
                }}
              />
              <span style={{ flex: 1 }}>
                <span className="strong" style={{ display: 'block' }}>
                  {n.title}
                </span>
                <span className="text-sm muted">{n.description}</span>
                <span className="text-sm subtle" style={{ display: 'block' }}>
                  {formatRelative(n.occurredAt)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const dd = useDropdown();
  const { user, signOut } = useSession();
  const navigate = useNavigate();

  const onSignOut = async () => {
    dd.close();
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dropdown" ref={dd.ref}>
      <button className="header-user" onClick={() => dd.setOpen((o) => !o)} aria-expanded={dd.open}>
        <Avatar name={user?.fullName} size="sm" />
        <span className="header-user-meta">
          <span className="header-user-name" style={{ display: 'block' }}>
            {user?.fullName ?? '…'}
          </span>
          <span className="header-user-role">{user?.roleName}</span>
        </span>
      </button>
      {dd.open && (
        <div className="popover popover-right">
          <Link className="option" to="/settings/profile" onClick={dd.close}>
            <User size={16} /> My profile
          </Link>
          <Link className="option" to="/settings" onClick={dd.close}>
            <Settings size={16} /> Settings
          </Link>
          <div className="menu-divider" />
          <button className="option is-danger" onClick={onSignOut}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function BranchSwitcher() {
  const { branchId, setBranchId } = useSession();
  const { options, loading } = useOptions('branches', { status: 'active' });
  return (
    <div className="input-group" style={{ width: 200 }}>
      <Building size={16} className="input-icon" />
      <Select
        aria-label="Viewing branch"
        options={options}
        value={branchId}
        placeholder={loading ? 'Loading…' : 'All branches'}
        onChange={(e) => setBranchId(e.target.value)}
        style={{ paddingLeft: 36, borderRadius: 999 }}
      />
    </div>
  );
}

export function Header({ onToggleSidebar }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <Button variant="ghost" iconOnly icon={Menu} onClick={onToggleSidebar} aria-label="Toggle navigation" />
      <Breadcrumbs />
      <div className="header-spacer" />
      <SearchBar
        className="header-search"
        label="global"
        value={query}
        onChange={setQuery}
        placeholder="Search patients…"
        onSubmit={(q) => q && navigate(`/patients?search=${encodeURIComponent(q)}`)}
      />
      <BranchSwitcher />
      <Notifications />
      <UserMenu />
    </header>
  );
}
