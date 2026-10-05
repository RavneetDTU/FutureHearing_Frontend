import { resources } from '../../api';
import { useListQuery } from '../../hooks/useListQuery';
import { DataTable, Pagination } from '../ui';

/** Paginated list of a resource filtered by owner, e.g. a patient's invoices. */
export function RelatedTable({ resource, params, columns, label, onRowClick, rowActions, emptyAction }) {
  const list = useListQuery(resources[resource].list, { baseParams: params, pageSize: 10 });
  return (
    <>
      <DataTable
        resource={label ?? resource}
        columns={columns}
        rows={list.items}
        loading={list.loading}
        error={list.error}
        onRetry={list.refetch}
        sort={list.sort}
        onSort={list.toggleSort}
        onRowClick={onRowClick}
        rowActions={rowActions}
        emptyAction={emptyAction}
      />
      {!list.error && list.total > list.pageSize && (
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onPageChange={list.setPage} />
      )}
    </>
  );
}
