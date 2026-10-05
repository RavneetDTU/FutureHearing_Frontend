import clsx from 'clsx';
import { initials } from '../../utils/format';

export function Avatar({ name, size }) {
  return (
    <span className={clsx('avatar', size && `avatar-${size}`)} aria-hidden>
      {initials(name)}
    </span>
  );
}

/** Avatar + title + subtitle, used in table cells and headers. */
export function EntityCell({ name, subtitle, avatar = true, size }) {
  return (
    <div className="entity">
      {avatar && <Avatar name={name} size={size} />}
      <div style={{ minWidth: 0 }}>
        <div className="entity-title">{name || '—'}</div>
        {subtitle && <div className="entity-sub">{subtitle}</div>}
      </div>
    </div>
  );
}
