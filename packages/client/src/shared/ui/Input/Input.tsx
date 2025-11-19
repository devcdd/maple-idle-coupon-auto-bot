import type { ComponentProps } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends ComponentProps<'input'> {}

export function Input({
  className,
  ...props
}: InputProps) {
  const classes = twMerge(
    clsx(
      'w-full px-[var(--spacing-md)] py-[var(--spacing-md)] text-base border border-[var(--color-gray-300)] rounded-lg',
      'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent',
      'disabled:bg-[var(--color-gray-100)] disabled:cursor-not-allowed',
      className,
    ),
  );

  return (
    <input
      className={classes}
      {...props}
    />
  );
}
