import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    card: 'aspect-[2/3] rounded-lg',
  };

  const inlineStyles: React.CSSProperties = {
    width,
    height,
    ...style,
  };

  return (
    <div
      className={`animate-pulse bg-white/10 ${variantStyles[variant]} ${className}`}
      style={inlineStyles}
      {...props}
    />
  );
};
