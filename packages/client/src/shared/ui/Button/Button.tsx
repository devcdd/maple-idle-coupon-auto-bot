import type { ComponentProps } from 'react';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  const baseClasses =
    'font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors';

  const variantClasses = {
    primary:
      'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-600)] active:bg-[var(--color-primary-700)] focus:ring-[var(--color-primary-400)] disabled:bg-[var(--color-gray-400)]',
    secondary:
      'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-600)] active:bg-[var(--color-secondary-700)] focus:ring-[var(--color-secondary-400)] disabled:bg-[var(--color-gray-400)]',
    outline:
      'bg-transparent border border-[var(--color-gray-300)] text-[var(--color-gray-700)] hover:bg-[var(--color-gray-50)] active:bg-[var(--color-gray-100)] focus:ring-[var(--color-gray-500)] disabled:bg-[var(--color-gray-100)] disabled:text-[var(--color-gray-400)]',
  };

  const sizeClasses = {
    sm: 'px-[var(--spacing-md)] py-[var(--spacing-sm)] text-sm',
    md: 'px-[var(--spacing-lg)] py-[var(--spacing-md)] text-base',
    lg: 'px-[var(--spacing-xl)] py-[var(--spacing-lg)] text-lg min-h-[44px]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const classes = twMerge(
    clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClass,
      className,
    ),
  );

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
