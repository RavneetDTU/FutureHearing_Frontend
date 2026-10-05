import { useOptions } from '../../hooks/useOptions';
import { Select } from './inputs';
import { MultiSelect } from './MultiSelect';

/**
 * Dropdown populated from `{resource}.lookup(params)`.
 * When `disabledReason` is set (e.g. parent not chosen yet) no request is made.
 */
export function ResourceSelect({ resource, params, multiple, value, onChange, disabledReason, placeholder, ...rest }) {
  const enabled = !disabledReason;
  const { options, loading, error } = useOptions(resource, params, { enabled });

  if (multiple) {
    return (
      <MultiSelect
        {...rest}
        options={options}
        loading={loading}
        value={value || []}
        onChange={onChange}
        disabled={!enabled || rest.disabled}
        placeholder={disabledReason || placeholder}
      />
    );
  }
  return (
    <Select
      {...rest}
      options={options}
      value={value}
      onChange={(e) => onChange(e.target.value, options.find((o) => String(o.value) === e.target.value)?.raw)}
      disabled={!enabled || loading || rest.disabled}
      placeholder={
        disabledReason || (loading ? 'Loading…' : error ? 'Unable to load options' : placeholder || 'Select…')
      }
    />
  );
}
