import clsx from 'clsx';
import { useId } from 'react';

/** Wraps any control with label, required marker, hint and error. Children receive the generated id. */
export function FormField({ label, required, hint, error, className, children, htmlFor }) {
  const autoId = useId();
  const id = htmlFor || autoId;
  return (
    <div className={clsx('field', error && 'has-error', className)}>
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
          {required && (
            <span className="field-required" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      {typeof children === 'function' ? children({ id, 'aria-invalid': Boolean(error) || undefined }) : children}
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : (
        hint && <span className="field-hint">{hint}</span>
      )}
    </div>
  );
}
