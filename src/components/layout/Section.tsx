import React from 'react';

export interface SectionProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
}) => {
  return (
    <section className={`my-8 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
};
