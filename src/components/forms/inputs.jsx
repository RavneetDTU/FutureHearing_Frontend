import clsx from 'clsx';

export function Input({ className, size, ...props }) {
  return <input className={clsx('input', size === 'sm' && 'input-sm', className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return <textarea className={clsx('textarea', className)} {...props} />;
}

/** options: [{ value, label }] */
export function Select({ options = [], placeholder = 'Select…', className, size, value, allowEmpty = true, ...props }) {
  return (
    <select className={clsx('select', size === 'sm' && 'input-sm', className)} value={value ?? ''} {...props}>
      {allowEmpty && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={String(o.value)} value={o.value} disabled={o.disabled}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function DatePicker(props) {
  return <Input type="date" {...props} value={props.value ?? ''} />;
}

export function TimePicker(props) {
  return <Input type="time" step={300} {...props} value={props.value ?? ''} />;
}

export function CurrencyInput({ value, onChange, symbol = 'R', ...props }) {
  return (
    <div className="input-group">
      <span className="input-addon">{symbol}</span>
      <Input
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        className="has-addon"
        value={value ?? ''}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}

export function Checkbox({ label, checked, onChange, ...props }) {
  return (
    <label className="checkbox">
      <input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} {...props} />
      {label}
    </label>
  );
}

export function Switch({ label, checked, onChange, id }) {
  return (
    <label className="switch">
      <input id={id} type="checkbox" role="switch" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
      {label && <span>{label}</span>}
    </label>
  );
}

/** options: [{ value, label, icon? }] */
export function SegmentedControl({ options, value, onChange, ariaLabel }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={clsx(value === o.value && 'is-active')}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <o.icon size={15} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
