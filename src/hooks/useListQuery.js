import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '../api/config';
import { useApiQuery } from './useApiQuery';
import { useDebouncedValue } from './useDebouncedValue';

/**
 * Server-side list state: page, pageSize, search, filters, sort.
 * Only the current page is ever held in memory.
 *
 *   const list = useListQuery(patientsApi.list, { filters: { status: '' } });
 *   list.items, list.total, list.setSearch(...), list.setFilter('status', 'active')
 */
export function useListQuery(fetchList, options = {}) {
  const {
    filters: initialFilters = {},
    search: initialSearch = '',
    pageSize: initialPageSize = DEFAULT_PAGE_SIZE,
    sortBy: initialSortBy,
    sortDir: initialSortDir = 'asc',
    baseParams = {},
    enabled = true,
  } = options;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [search, setSearchState] = useState(initialSearch);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState({ sortBy: initialSortBy, sortDir: initialSortDir });
  const debouncedSearch = useDebouncedValue(search, 300);

  const params = useMemo(
    () => ({ ...baseParams, ...filters, search: debouncedSearch, page, pageSize, ...sort }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(baseParams), filters, debouncedSearch, page, pageSize, sort],
  );

  const query = useApiQuery(() => fetchList(params), [params], { enabled });

  const setSearch = useCallback((value) => {
    setSearchState(value);
    setPage(1);
  }, []);
  const setFilter = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }, []);
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchState('');
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const setPageSize = useCallback((size) => {
    setPageSizeState(size);
    setPage(1);
  }, []);
  const toggleSort = useCallback((key) => {
    setSort((s) => ({ sortBy: key, sortDir: s.sortBy === key && s.sortDir === 'asc' ? 'desc' : 'asc' }));
  }, []);

  return {
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    page,
    pageSize,
    search,
    filters,
    sort,
    setPage,
    setPageSize,
    setSearch,
    setFilter,
    resetFilters,
    toggleSort,
  };
}
