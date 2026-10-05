import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAVIGATION } from '../../config/navigation';
import { useSession } from '../../context/SessionContext';
import { Logo } from './Logo';

const matches = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);

/** The most specific child matching the current path, so /invoices/new doesn't also highlight /invoices. */
function activeChildOf(item, pathname) {
  if (!item.children) return null;
  return item.children
    .filter((c) => matches(pathname, c.to))
    .sort((a, b) => b.to.length - a.to.length)[0];
}

function NavSection({ item, pathname, onNavigate, can }) {
  const children = item.children.filter((c) => can(c.permission));
  const activeChild = activeChildOf({ children }, pathname);
  const [open, setOpen] = useState(Boolean(activeChild));

  useEffect(() => {
    if (activeChild) setOpen(true);
  }, [activeChild]);

  if (!children.length) return null;
  const Icon = item.icon;
  return (
    <div>
      <button
        type="button"
        className={clsx('sidebar-link', open && 'is-open', activeChild && 'is-parent-active')}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title={item.label}
      >
        <Icon size={18} />
        <span className="sidebar-link-label">{item.label}</span>
        <ChevronDown size={16} className="chevron" />
      </button>
      {open && (
        <div className="sidebar-children">
          {children.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              className={clsx('sidebar-link', activeChild?.to === child.to && 'is-active')}
              onClick={onNavigate}
            >
              <span className="sidebar-link-label">{child.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ onNavigate }) {
  const { pathname } = useLocation();
  const { can } = useSession();

  return (
    <aside className="app-sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">
        <Logo />
        <div className="sidebar-brand-sub">Operations portal</div>
      </div>
      <nav className="sidebar-nav">
        {NAVIGATION.map((group) => {
          const items = group.items.filter((i) => can(i.permission));
          if (!items.length) return null;
          return (
            <div key={group.title} className="sidebar-group">
              <div className="sidebar-group-title">{group.title}</div>
              {items.map((item) =>
                item.children ? (
                  <NavSection key={item.label} item={item} pathname={pathname} onNavigate={onNavigate} can={can} />
                ) : (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={clsx('sidebar-link', matches(pathname, item.to) && 'is-active')}
                    onClick={onNavigate}
                    title={item.label}
                  >
                    <item.icon size={18} />
                    <span className="sidebar-link-label">{item.label}</span>
                  </Link>
                ),
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
