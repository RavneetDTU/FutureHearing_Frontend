import { resources } from '../api';
import { useApiQuery } from './useApiQuery';

/**
 * Loads dropdown options from a resource's lookup endpoint.
 *   useOptions('brands', { companyId })  ->  { options: [{ value, label, raw }], loading, error }
 */
export function useOptions(resourceKey, params = {}, { enabled = true, valueKey = 'id', labelKey = 'name' } = {}) {
  const key = JSON.stringify(params);
  const { data, loading, error, refetch } = useApiQuery(
    () => resources[resourceKey].lookup(params),
    [resourceKey, key],
    { enabled: enabled && Boolean(resourceKey), initialData: [] },
  );
  const options = (data || []).map((row) => ({ value: row[valueKey], label: row[labelKey], raw: row }));
  return { options, loading, error, refetch };
}
