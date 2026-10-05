import { Input } from '../../components/ui';

const MAX_UNITS = 200;

/** One serial number input per unit. The array is resized to `quantity`. */
export function SerialNumberInputs({ quantity, value = [], onChange, showErrors, productName }) {
  const count = Math.min(Math.max(Number(quantity) || 0, 0), MAX_UNITS);
  const serials = Array.from({ length: count }, (_, i) => value[i] ?? '');
  const duplicates = new Set(serials.filter((s, i) => s && serials.indexOf(s) !== i));

  if (!count) return <span className="text-sm muted">Enter a quantity to capture serial numbers.</span>;

  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
        {serials.map((serial, i) => {
          const invalid = (showErrors && !serial) || duplicates.has(serial);
          return (
            <div key={i} className="input-group">
              <span className="input-addon mono" style={{ fontSize: 11 }}>
                #{i + 1}
              </span>
              <Input
                size="sm"
                className="has-addon"
                style={{ paddingLeft: 34, ...(invalid ? { borderColor: 'var(--tone-danger-fg)' } : {}) }}
                aria-label={`Serial number ${i + 1} for ${productName}`}
                placeholder="Serial number"
                value={serial}
                onChange={(e) => {
                  const next = [...serials];
                  next[i] = e.target.value.trim();
                  onChange(next);
                }}
              />
            </div>
          );
        })}
      </div>
      {duplicates.size > 0 && <div className="field-error" style={{ marginTop: 6 }}>Duplicate serial numbers: {[...duplicates].join(', ')}</div>}
      {Number(quantity) > MAX_UNITS && <div className="field-hint">Showing the first {MAX_UNITS} units.</div>}
    </div>
  );
}
