import clsx from 'clsx';
import {
  Activity,
  AlertTriangle,
  Box,
  CalendarDays,
  CircleDollarSign,
  FileText,
  HeartPulse,
  Mail,
  MessageCircle,
  Phone,
  ShoppingCart,
  StickyNote,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { formatDateTime } from '../../utils/format';

/** Activity type -> icon + tone. Extend as the backend introduces new event types. */
export const ACTIVITY_TYPES = {
  created: { icon: UserPlus, tone: 'brand' },
  invoice: { icon: FileText, tone: 'info' },
  purchase: { icon: ShoppingCart, tone: 'purple' },
  payment: { icon: CircleDollarSign, tone: 'success' },
  appointment: { icon: CalendarDays, tone: 'warning' },
  note: { icon: StickyNote, tone: 'neutral' },
  email: { icon: Mail, tone: 'info' },
  call: { icon: Phone, tone: 'success' },
  whatsapp: { icon: MessageCircle, tone: 'success' },
  medical_aid: { icon: HeartPulse, tone: 'brand' },
  claim: { icon: HeartPulse, tone: 'brand' },
  stock: { icon: Box, tone: 'purple' },
  warning: { icon: AlertTriangle, tone: 'warning' },
  error: { icon: XCircle, tone: 'danger' },
};

/** items: [{ id, type, title, description?, actorName?, occurredAt, actions? }] */
export function Timeline({ items = [], renderActions }) {
  return (
    <ol className="timeline">
      {items.map((item) => {
        const conf = ACTIVITY_TYPES[item.type] ?? { icon: Activity, tone: 'neutral' };
        const Icon = conf.icon;
        return (
          <li key={item.id} className="timeline-item">
            <span className={clsx('timeline-icon', `tone-${conf.tone}`)}>
              <Icon size={15} />
            </span>
            <div className="timeline-content">
              <div className="row-between">
                <div className="timeline-title">{item.title}</div>
                {renderActions && <div className="timeline-actions">{renderActions(item)}</div>}
              </div>
              <div className="timeline-meta">
                {formatDateTime(item.occurredAt)}
                {item.actorName && ` · ${item.actorName}`}
              </div>
              {item.description && <div className="timeline-desc">{item.description}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
