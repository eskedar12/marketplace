import React from 'react';

const VARIANTS = {
  primary: 'bg-juniper text-paper hover:bg-juniper-dark',
  accent: 'bg-mustard text-ink hover:bg-mustard-dark',
  outline: 'border border-ink text-ink hover:bg-ink hover:text-paper',
  danger: 'bg-clay text-paper hover:opacity-90',
  ghost: 'text-ink/60 hover:text-ink',
};

export default function Button({
  variant = 'primary',
  as: Component = 'button',
  className = '',
  disabled,
  children,
  ...props
}) {
  return (
    <Component
      className={`px-4 py-2 text-sm font-display font-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </Component>
  );
}
