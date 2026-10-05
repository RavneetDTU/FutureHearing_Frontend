import clsx from 'clsx';

/** items: [{ label, value, span? }] — empty values render as an em dash. */
export function DetailList({ items, columns = 2 }) {
  return (
    <dl className={clsx('detail-list', columns !== 2 && `cols-${columns}`)} style={{ margin: 0 }}>
      {items
        .filter((item) => !item.hidden)
        .map((item) => (
          <div key={item.label} style={item.span ? { gridColumn: '1 / -1' } : undefined}>
            <dt className="detail-label">{item.label}</dt>
            <dd className="detail-value" style={{ margin: 0 }}>
              {item.value === null || item.value === undefined || item.value === '' ? <span className="subtle">—</span> : item.value}
            </dd>
          </div>
        ))}
    </dl>
  );
}
