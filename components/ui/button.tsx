import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full text-sm font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mma-red focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-black',
  {
    variants: {
      variant: {
        primary: 'bg-mma-red text-white shadow-lg shadow-red-900/40 hover:bg-red-700',
        secondary:
          'bg-zinc-900 text-white border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800',
        outline:
          'border border-zinc-600 bg-transparent text-zinc-50 hover:bg-zinc-900 hover:border-zinc-400',
        ghost: 'bg-transparent text-zinc-100 hover:bg-zinc-900',
      },
      size: {
        sm: 'min-h-11 h-11 px-4 text-sm',
        md: 'min-h-11 h-11 px-5 text-sm',
        lg: 'min-h-11 h-11 px-6 text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
