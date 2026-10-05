import clsx from 'clsx';
import { OPTION_SETS, statusOptions } from '../../config/statuses';
import { AsyncSelect } from './AsyncSelect';
import { FormField } from './FormField';
import { Checkbox, CurrencyInput, DatePicker, Input, SegmentedControl, Select, Switch, Textarea, TimePicker } from './inputs';
import { MultiSelect } from './MultiSelect';
import { ResourceSelect } from './ResourceSelect';

/**
 * Field definition:
 * {
 *   name, label, type: text|email|tel|number|currency|textarea|select|multiselect|date|time|switch|checkbox|segmented|async|heading,
 *   required, placeholder, hint, span: 3|4|6|8|12, min, max, disabled,
 *   options: [{ value, label }] | 'optionSetKey' | { status: 'domain' } |
 *            { resource: 'brands', dependsOn: 'companyId', param: 'companyId', params: {} },
 *   labelField: (async) value key that stores the selected row's display label,
 *   onSelect: (row, values) => partial values to pre-fill from the selected option,
 *   visibleWhen: (values) => boolean,
 * }
 */
function staticOptions(options) {
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') return OPTION_SETS[options] ?? [];
  if (options?.status) return statusOptions(options.status);
  return null;
}

/** Clears dependent fields when a parent value changes (e.g. Company -> Brand -> Model). */
export function dependentsOf(fields, name) {
  const direct = fields.filter((f) => f.options?.dependsOn === name).map((f) => f.name);
  return direct.flatMap((child) => [child, ...dependentsOf(fields, child)]);
}

function FieldControl({ field, values, onChange, controlProps }) {
  const value = values[field.name];
  const common = { ...controlProps, disabled: field.disabled, placeholder: field.placeholder };
  const opts = staticOptions(field.options);

  switch (field.type) {
    case 'textarea':
      return <Textarea {...common} rows={field.rows ?? 4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'currency':
      return <CurrencyInput {...common} value={value} onChange={(e) => onChange(e.target.value)} />;
    case 'number':
      return (
        <Input {...common} type="number" min={field.min} max={field.max} step={field.step ?? 'any'} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      );
    case 'date':
      return <DatePicker {...common} value={value} onChange={(e) => onChange(e.target.value)} />;
    case 'time':
      return <TimePicker {...common} value={value} onChange={(e) => onChange(e.target.value)} />;
    case 'switch':
      return <Switch id={controlProps.id} checked={value} onChange={onChange} label={field.switchLabel} />;
    case 'checkbox':
      return <Checkbox id={controlProps.id} checked={value} onChange={onChange} label={field.checkboxLabel} />;
    case 'segmented':
      return <SegmentedControl options={opts} value={value} onChange={onChange} ariaLabel={field.label} />;
    case 'async':
      return (
        <AsyncSelect
          id={controlProps.id}
          resource={field.resource}
          params={typeof field.params === 'function' ? field.params(values) : field.params}
          value={value}
          valueLabel={field.labelField ? values[field.labelField] : undefined}
          onChange={(id, row) => onChange(id, row)}
          placeholder={field.placeholder}
          getMeta={field.getMeta}
          disabled={field.disabled}
        />
      );
    case 'select':
    case 'multiselect': {
      const multiple = field.type === 'multiselect';
      if (opts) {
        return multiple ? (
          <MultiSelect {...common} options={opts} value={value || []} onChange={onChange} />
        ) : (
          <Select {...common} options={opts} value={value} onChange={(e) => onChange(e.target.value)} />
        );
      }
      const { resource, dependsOn, param, params = {} } = field.options;
      const parentValue = dependsOn ? values[dependsOn] : undefined;
      const missingParent = dependsOn && (parentValue === undefined || parentValue === null || parentValue === '');
      return (
        <ResourceSelect
          {...common}
          resource={resource}
          multiple={multiple}
          params={dependsOn ? { ...params, [param ?? dependsOn]: parentValue } : params}
          disabledReason={missingParent ? field.dependsOnMessage || 'Select the parent option first' : null}
          value={value}
          onChange={(v, row) => onChange(v, row)}
        />
      );
    }
    default:
      return (
        <Input {...common} type={field.type || 'text'} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      );
  }
}

export function SchemaForm({ fields, form, onFieldChange }) {
  const { values, errors, setValue } = form;

  const handleChange = (field, value, row) => {
    setValue(field.name, value);
    dependentsOf(fields, field.name).forEach((child) => {
      const def = fields.find((f) => f.name === child);
      setValue(child, def?.type === 'multiselect' ? [] : '');
    });
    if (field.labelField) setValue(field.labelField, row ? row.name : '');
    if (field.onSelect) Object.entries(field.onSelect(row, values) ?? {}).forEach(([k, v]) => setValue(k, v));
    onFieldChange?.(field.name, value, row);
  };

  return (
    <div className="form-grid">
      {fields
        .filter((f) => !f.visibleWhen || f.visibleWhen(values))
        .map((field) => {
          if (field.type === 'heading') {
            return (
              <div key={field.name} className="span-12" style={{ marginTop: 8 }}>
                <div className="form-section-title">{field.label}</div>
                {field.hint && <div className="form-section-desc" style={{ marginBottom: 0 }}>{field.hint}</div>}
              </div>
            );
          }
          return (
            <FormField
              key={field.name}
              label={field.type === 'checkbox' ? undefined : field.label}
              required={field.required}
              hint={field.hint}
              error={errors[field.name]}
              className={clsx(field.span && `span-${field.span}`)}
            >
              {(controlProps) => (
                <FieldControl
                  field={field}
                  values={values}
                  controlProps={controlProps}
                  onChange={(v, row) => handleChange(field, v, row)}
                />
              )}
            </FormField>
          );
        })}
    </div>
  );
}
