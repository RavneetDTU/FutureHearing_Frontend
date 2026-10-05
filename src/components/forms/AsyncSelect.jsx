import clsx from 'clsx';
import { Search, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { resources } from '../../api';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

/**
 * Server-searched single select (patients, products, leads…). Calls `{resource}.lookup({ search, ...params })`.
 * `valueLabel` is the display text for the current value (backends usually return it alongside the id).
 */
export function AsyncSelect({
  id,
  resource,
  params = {},
  value,
  valueLabel,
  onChange,
  placeholder = 'Search…',
  renderOption,
  getLabel = (row) => row.name,
  getMeta,
  disabled,
  clearable = true,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 250);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  const { data, loading, error } = useApiQuery(
    () => resources[resource].lookup({ ...params, search: debounced }),
    [resource, debounced, JSON.stringify(params)],
    { enabled: open, initialData: [] },
  );

  return (
    <div className={clsx('multiselect', open && 'is-open')} ref={ref}>
      <div className="input-group">
        <Search size={16} className="input-icon" />
        <input
          id={id}
          className="input"
          disabled={disabled}
          value={open ? query : valueLabel || ''}
          placeholder={valueLabel || placeholder}
          onFocus={() => {
            setQuery('');
            setOpen(true);
          }}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        {clearable && value && !disabled && (
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon"
            style={{ position: 'absolute', right: 4 }}
            onClick={() => onChange(null, null)}
            aria-label="Clear selection"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {open && (
        <div className="popover" role="listbox">
          {loading && <div className="option-empty">Searching…</div>}
          {error && <div className="option-empty text-danger">Unable to load results.</div>}
          {!loading && !error && !data.length && <div className="option-empty">No matches</div>}
          {!loading &&
            data.map((row) => (
              <button
                key={row.id}
                type="button"
                role="option"
                aria-selected={row.id === value}
                className={clsx('option', row.id === value && 'is-selected')}
                onClick={() => {
                  onChange(row.id, row);
                  setOpen(false);
                }}
              >
                {renderOption ? renderOption(row) : getLabel(row)}
                {getMeta && <span className="option-meta">{getMeta(row)}</span>}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
