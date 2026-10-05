import { FilterX } from 'lucide-react';
import { OPTION_SETS, statusOptions } from '../../config/statuses';
import { Select } from '../forms/inputs';
import { ResourceSelect } from '../forms/ResourceSelect';
import { Button } from './Button';
import { SearchBar } from './SearchBar';

function resolveOptions(options) {
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') return OPTION_SETS[options] ?? [];
  if (options?.status) return statusOptions(options.status);
  return null;
}

/**
 * Search + filter dropdowns bound to a `useListQuery` instance.
 * filters: [{ key, label, options: [...] | 'optionSet' | { status } | { resource, dependsOn?, param? } }]
 */
export function FilterBar({ list, filters = [], searchPlaceholder = 'Search…', children }) {
  const hasActive = Boolean(list.search) || filters.some((f) => list.filters[f.key]);

  return (
    <div className="toolbar no-print">
      <SearchBar value={list.search} onChange={list.setSearch} placeholder={searchPlaceholder} />
      {filters.map((filter) => {
        const value = list.filters[filter.key] ?? '';
        const onChange = (v) => {
          list.setFilter(filter.key, v);
          filters.filter((f) => f.options?.dependsOn === filter.key).forEach((child) => list.setFilter(child.key, ''));
        };
        const opts = resolveOptions(filter.options);
        const placeholder = `All ${filter.label.toLowerCase()}`;
        return (
          <div className="filter" key={filter.key}>
            <label className="sr-only" htmlFor={`filter-${filter.key}`}>
              {filter.label}
            </label>
            {opts ? (
              <Select
                id={`filter-${filter.key}`}
                options={opts}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
              />
            ) : (
              <ResourceSelect
                id={`filter-${filter.key}`}
                resource={filter.options.resource}
                params={
                  filter.options.dependsOn
                    ? { [filter.options.param ?? filter.options.dependsOn]: list.filters[filter.options.dependsOn] }
                    : filter.options.params
                }
                value={value}
                placeholder={placeholder}
                onChange={(v) => onChange(v)}
              />
            )}
          </div>
        );
      })}
      {children}
      {hasActive && (
        <Button variant="ghost" size="sm" icon={FilterX} onClick={list.resetFilters}>
          Clear
        </Button>
      )}
    </div>
  );
}
