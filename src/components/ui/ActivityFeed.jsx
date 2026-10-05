import clsx from 'clsx';
import { Activity } from 'lucide-react';
import { formatRelative } from '../../utils/format';
import { ACTIVITY_TYPES } from './Timeline';

/** Compact activity list for dashboards / sidebars. */
export function ActivityFeed({ items = [] }) {
  return (
    <ul className="list-plain">
      {items.map((item) => {
        const conf = ACTIVITY_TYPES[item.type] ?? { icon: Activity, tone: 'neutral' };
        const Icon = conf.icon;
        return (
          <li key={item.id} className="list-row">
            <div className="entity">
              <span className={clsx('timeline-icon', `tone-${conf.tone}`)}>
                <Icon size={15} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div className="entity-title">{item.title}</div>
                <div className="entity-sub">
                  {item.description}
                  {item.actorName && ` · ${item.actorName}`}
                </div>
              </div>
            </div>
            <span className="text-sm subtle nowrap">{formatRelative(item.occurredAt)}</span>
          </li>
        );
      })}
    </ul>
  );
}
