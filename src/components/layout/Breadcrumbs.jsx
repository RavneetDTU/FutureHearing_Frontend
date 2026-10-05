import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';
import { Link, useMatches } from 'react-router-dom';

/** Built from `handle.crumb` on route definitions (string or (match) => string). */
export function Breadcrumbs() {
  const crumbs = useMatches()
    .filter((m) => m.handle?.crumb)
    .map((m) => ({
      path: m.pathname,
      label: typeof m.handle.crumb === 'function' ? m.handle.crumb(m) : m.handle.crumb,
    }));

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/dashboard" aria-label="Dashboard">
        <Home size={15} />
      </Link>
      {crumbs.map((c, i) => (
        <Fragment key={c.path}>
          <ChevronRight size={14} />
          {i === crumbs.length - 1 ? (
            <span className="current" aria-current="page">
              {c.label}
            </span>
          ) : (
            <Link to={c.path}>{c.label}</Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
