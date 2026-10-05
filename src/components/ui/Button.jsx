import clsx from 'clsx';
import { Link } from 'react-router-dom';

export function Spinner({ large = false }) {
  return <span className={clsx('spinner', large && 'spinner-lg')} role="status" aria-label="Loading" />;
}

/**
 * variant: primary | secondary | ghost | soft | danger
 * Pass `to` to render a router link styled as a button.
 */
export function Button({
  variant = 'secondary',
  size,
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  block = false,
  iconOnly = false,
  to,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}) {
  const classes = clsx(
    'btn',
    `btn-${variant}`,
    size === 'sm' && 'btn-sm',
    iconOnly && 'btn-icon',
    block && 'btn-block',
    className,
  );
  const iconSize = size === 'sm' ? 15 : 17;
  const content = (
    <>
      {loading ? <Spinner /> : Icon && <Icon size={iconSize} aria-hidden />}
      {children}
      {IconRight && <IconRight size={iconSize} aria-hidden />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} aria-disabled={disabled || undefined} {...rest}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}
