const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,}$/;

const isEmpty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

/** Basic UX validation only. Returns { fieldName: message }. */
export function validateValues(values, fields) {
  const errors = {};
  fields.forEach((field) => {
    if (!field?.name || field.type === 'heading') return;
    if (field.visibleWhen && !field.visibleWhen(values)) return;
    const value = values[field.name];
    const label = field.label || field.name;

    if (field.required && isEmpty(value)) {
      errors[field.name] = `${label} is required.`;
      return;
    }
    if (isEmpty(value)) return;

    if (field.type === 'email' && !EMAIL_RE.test(value)) errors[field.name] = 'Enter a valid email address.';
    else if (field.type === 'tel' && !PHONE_RE.test(value)) errors[field.name] = 'Enter a valid phone number.';
    else if (['number', 'currency'].includes(field.type)) {
      const n = Number(value);
      if (Number.isNaN(n)) errors[field.name] = `${label} must be a number.`;
      else if (field.min !== undefined && n < field.min) errors[field.name] = `${label} must be at least ${field.min}.`;
      else if (field.max !== undefined && n > field.max) errors[field.name] = `${label} must be at most ${field.max}.`;
    } else if (field.pattern && !new RegExp(field.pattern).test(value)) {
      errors[field.name] = field.patternMessage || `${label} is not in the expected format.`;
    }

    if (!errors[field.name] && field.validate) {
      const message = field.validate(value, values);
      if (message) errors[field.name] = message;
    }
  });
  return errors;
}
