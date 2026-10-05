import clsx from 'clsx';

export function Card({ className, flush, children, ...rest }) {
  return (
    <section className={clsx('card', flush && 'card-flush', className)} {...rest}>
      {children}
    </section>
  );
}

export function CardHeader({ title, subtitle, actions, children }) {
  return (
    <header className="card-header">
      <div>
        {title && <h2 className="card-title">{title}</h2>}
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="row">{actions}</div>}
    </header>
  );
}

export function CardBody({ className, children }) {
  return <div className={clsx('card-body', className)}>{children}</div>;
}

export function CardFooter({ children }) {
  return <footer className="card-footer">{children}</footer>;
}
