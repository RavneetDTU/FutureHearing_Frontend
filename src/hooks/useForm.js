import { useCallback, useState } from 'react';
import { validateValues } from '../utils/validation';

/**
 * Minimal form state. `fields` are field definitions ({ name, label, required, type, min, max, pattern, validate }).
 * Only UX validation lives here; the backend remains the source of truth (see `applyServerErrors`).
 */
export function useForm(initialValues = {}, fields = []) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const setValue = useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  }, []);

  const patch = useCallback((partial) => setValues((v) => ({ ...v, ...partial })), []);

  const validate = useCallback(
    (fieldList = fields) => {
      const next = validateValues(values, fieldList);
      setErrors(next);
      return Object.keys(next).length === 0;
    },
    [values, fields],
  );

  const applyServerErrors = useCallback((err) => {
    if (err?.fieldErrors && Object.keys(err.fieldErrors).length) {
      const mapped = Object.fromEntries(
        Object.entries(err.fieldErrors).map(([k, v]) => [k, Array.isArray(v) ? v.join(' ') : String(v)]),
      );
      setErrors(mapped);
    }
  }, []);

  const reset = useCallback((next = initialValues) => {
    setValues(next);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { values, errors, setValue, setValues, patch, validate, setErrors, applyServerErrors, reset };
}
