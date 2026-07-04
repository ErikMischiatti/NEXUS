import type { PropsWithChildren, HTMLAttributes } from 'react';

type CardProps = PropsWithChildren<HTMLAttributes<HTMLElement>> & {
  title?: string;
  eyebrow?: string;
};

export const Card = ({ title, eyebrow, children, className = '', ...rest }: CardProps) => (
  <section className={`nexus-card ${className}`.trim()} {...rest}>
    {(eyebrow || title) && (
      <header className="nexus-card__header">
        {eyebrow ? <span className="nexus-card__eyebrow">{eyebrow}</span> : null}
        {title ? <h2 className="nexus-card__title">{title}</h2> : null}
      </header>
    )}
    <div className="nexus-card__body">{children}</div>
  </section>
);
