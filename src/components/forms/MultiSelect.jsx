import clsx from 'clsx';
import { Check, X } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

/** value: array of option values. options: [{ value, label }] */
export function MultiSelect({ id, options = [], value = [], onChange, placeholder = 'Select…', loading, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  const selected = useMemo(() => {
    const set = new Set((value || []).map(String));
    return options.filter((o) => set.has(String(o.value)));
  }, [options, value]);

  const filtered = options.filter((o) => o.label?.toLowerCase().includes(query.toLowerCase()));
  const isSelected = (v) => (value || []).map(String).includes(String(v));
  const toggle = (v) => onChange(isSelected(v) ? value.filter((x) => String(x) !== String(v)) : [...(value || []), v]);

  return (
    <div className={clsx('multiselect', open && 'is-open')} ref={ref}>
      <div
        className="multiselect-control"
        onClick={() => !disabled && setOpen(true)}
        style={disabled ? { background: 'var(--gray-50)' } : undefined}
      >
        {selected.map((o) => (
          <span key={o.value} className="chip">
            {o.label}
            {!disabled && (
              <button
                type="button"
                aria-label={`Remove ${o.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(o.value);
                }}
              >
                <X size={12} />
              </button>
            )}
          </span>
        ))}
        <input
          id={id}
          className="multiselect-input"
          value={query}
          disabled={disabled}
          placeholder={selected.length ? '' : placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !query && selected.length) toggle(selected[selected.length - 1].value);
          }}
        />
      </div>
      {open && (
        <div className="popover" role="listbox" aria-multiselectable="true">
          {loading && <div className="option-empty">Loading…</div>}
          {!loading && !filtered.length && <div className="option-empty">No options</div>}
          {filtered.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={isSelected(o.value)}
              className={clsx('option', isSelected(o.value) && 'is-selected')}
              onClick={() => toggle(o.value)}
            >
              <span style={{ width: 16 }}>{isSelected(o.value) && <Check size={14} />}</span>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
