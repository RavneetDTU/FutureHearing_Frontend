import clsx from 'clsx';
import { getStatus } from '../../config/statuses';

export function Badge({ tone = 'neutral', dot, children, className }) {
  return <span className={clsx('badge', `tone-${tone}`, dot && 'badge-dot', className)}>{children}</span>;
}

/** Looks the status up in config/statuses.js so labels/tones are configured centrally. */
export function StatusBadge({ domain = 'record', value, dot = true }) {
  if (value === null || value === undefined || value === '') return <span className="subtle">—</span>;
  const status = getStatus(domain, value);
  return (
    <Badge tone={status.tone} dot={dot}>
      {status.label}
    </Badge>
  );
}
