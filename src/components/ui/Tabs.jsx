import clsx from 'clsx';

/** tabs: [{ key, label, icon?, count? }] — variant: underline | pills */
export function Tabs({ tabs, value, onChange, variant = 'underline', className }) {
  return (
    <div className={clsx('tabs', variant === 'pills' && 'tabs-pills', className)} role="tablist">
      {tabs.map(({ key, label, icon: Icon, count }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={value === key}
          className={clsx('tab', value === key && 'is-active')}
          onClick={() => onChange(key)}
        >
          {Icon && <Icon size={16} />}
          {label}
          {count !== undefined && count !== null && <span className="tab-count">{count}</span>}
        </button>
      ))}
    </div>
  );
}
