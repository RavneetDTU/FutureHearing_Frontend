import clsx from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Inbox, RefreshCw } from 'lucide-react';
import { Button, Spinner } from './Button';

export function LoadingState({ message = 'Loading…', compact }) {
  return (
    <div className={clsx('state', compact && 'state-compact')} aria-busy="true">
      <Spinner large />
      <div>{message}</div>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message, action, compact }) {
  return (
    <div className={clsx('state', compact && 'state-compact')}>
      <div className="state-icon">
        <Icon size={24} />
      </div>
      <div className="state-title">{title}</div>
      {message && <div>{message}</div>}
      {action}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, error, onRetry, compact }) {
  return (
    <div className={clsx('state state-error', compact && 'state-compact')} role="alert">
      <div className="state-icon">
        <AlertCircle size={24} />
      </div>
      <div className="state-title">{title}</div>
      <div>{message || error?.message || 'Please try again.'}</div>
      {onRetry && (
        <Button size="sm" icon={RefreshCw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

const ALERT_ICONS = { danger: AlertCircle, warning: AlertTriangle, info: Info, success: CheckCircle2 };

export function Alert({ tone = 'info', title, children, action }) {
  const Icon = ALERT_ICONS[tone] ?? Info;
  return (
    <div className={clsx('alert', `tone-${tone}`)} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon size={18} />
      <div style={{ flex: 1 }}>
        {title && <div className="alert-title">{title}</div>}
        {children}
      </div>
      {action}
    </div>
  );
}

/**
 * Renders loading / error / empty / content for a single API-backed region.
 *   <QueryState loading={q.loading} error={q.error} onRetry={q.refetch} isEmpty={!q.data?.length} resource="patients">
 */
export function QueryState({ loading, error, onRetry, isEmpty, resource = 'records', empty, compact, children }) {
  if (loading) return <LoadingState message={`Loading ${resource}…`} compact={compact} />;
  if (error)
    return (
      <ErrorState
        title={`Unable to load ${resource}`}
        message={error.status === 404 ? 'This record could not be found.' : `Unable to load ${resource}. Please try again.`}
        onRetry={onRetry}
        compact={compact}
      />
    );
  if (isEmpty) return empty ?? <EmptyState title={`No ${resource} found.`} compact={compact} />;
  return children;
}
