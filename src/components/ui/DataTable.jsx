import clsx from 'clsx';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { ActionMenu } from './ActionMenu';
import { EmptyState, ErrorState } from './States';

/**
 * columns: [{ key, header, render?(row), sortable?, align?, width?, className? }]
 * rowActions?(row) -> ActionMenu actions
 */
export function DataTable({
  columns,
  rows = [],
  loading,
  error,
  onRetry,
  resource = 'records',
  emptyTitle,
  emptyMessage,
  emptyAction,
  sort,
  onSort,
  rowActions,
  onRowClick,
  getRowId = (row) => row.id,
  compact,
  footer,
  skeletonRows = 5,
}) {
  const colSpan = columns.length + (rowActions ? 1 : 0);

  const renderBody = () => {
    if (loading) {
      return Array.from({ length: skeletonRows }, (_, i) => (
        <tr key={`sk-${i}`} aria-hidden>
          {Array.from({ length: colSpan }, (__, j) => (
            <td key={j}>
              <div className="skeleton" style={{ width: `${50 + ((i + j) % 4) * 12}%` }} />
            </td>
          ))}
        </tr>
      ));
    }
    if (error) {
      return (
        <tr>
          <td colSpan={colSpan} className="table-state">
            <ErrorState
              compact
              title={`Unable to load ${resource}`}
              message={`Unable to load ${resource}. Please try again.`}
              onRetry={onRetry}
            />
          </td>
        </tr>
      );
    }
    if (!rows.length) {
      return (
        <tr>
          <td colSpan={colSpan} className="table-state">
            <EmptyState compact title={emptyTitle ?? `No ${resource} found.`} message={emptyMessage} action={emptyAction} />
          </td>
        </tr>
      );
    }
    return rows.map((row) => (
      <tr
        key={getRowId(row)}
        className={clsx(onRowClick && 'is-clickable')}
        onClick={onRowClick ? () => onRowClick(row) : undefined}
      >
        {columns.map((col) => (
          <td key={col.key} className={clsx(col.align === 'right' && 'text-right', col.className)}>
            {col.render ? col.render(row) : (row[col.key] ?? <span className="subtle">—</span>)}
          </td>
        ))}
        {rowActions && (
          <td className="col-actions">
            <ActionMenu actions={rowActions(row)} />
          </td>
        )}
      </tr>
    ));
  };

  return (
    <div className="table-scroll">
      <table className={clsx('table', compact && 'table-compact')} aria-busy={loading || undefined}>
        <thead>
          <tr>
            {columns.map((col) => {
              const active = sort?.sortBy === col.key;
              const SortIcon = active ? (sort.sortDir === 'desc' ? ArrowDown : ArrowUp) : ArrowUpDown;
              return (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={clsx(col.sortable && onSort && 'is-sortable', col.align === 'right' && 'text-right')}
                  onClick={col.sortable && onSort ? () => onSort(col.sortKey ?? col.key) : undefined}
                  aria-sort={active ? (sort.sortDir === 'desc' ? 'descending' : 'ascending') : undefined}
                >
                  <span className="th-inner">
                    {col.header}
                    {col.sortable && onSort && <SortIcon size={12} opacity={active ? 1 : 0.4} />}
                  </span>
                </th>
              );
            })}
            {rowActions && (
              <th className="col-actions">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>{renderBody()}</tbody>
        {footer && !loading && !error && rows.length > 0 && <tfoot>{footer}</tfoot>}
      </table>
    </div>
  );
}
