import React, { ButtonHTMLAttributes } from 'react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      variant = 'ghost',
      size = 'md',
      ariaLabel,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary: 'bg-brand hover:bg-brand-hover text-white shadow-md',
      secondary: 'bg-surface-elevated hover:bg-surface-hover text-text-primary border border-white/10',
      outline: 'border border-white/20 hover:border-white/40 text-text-primary bg-transparent hover:bg-white/10',
      ghost: 'bg-transparent hover:bg-white/10 text-text-primary',
    };

    const sizes = {
      sm: 'p-1.5 text-xs',
      md: 'p-2.5 text-sm',
      lg: 'p-3.5 text-base',
    };

    return (
      <button
        ref={ref}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
