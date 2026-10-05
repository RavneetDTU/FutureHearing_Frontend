import clsx from 'clsx';
import { Link } from 'react-router-dom';

export function StatCard({ label, value, hint, icon: Icon, tone = 'brand', to, loading }) {
  const Comp = to ? Link : 'div';
  return (
    <Comp to={to} className={clsx('card stat-card')}>
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        {Icon && (
          <span className={clsx('stat-icon', `tone-${tone}`)}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className="stat-value">{loading ? <div className="skeleton" style={{ width: 80, height: 26 }} /> : value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </Comp>
  );
}
