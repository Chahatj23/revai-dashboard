import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]',
    outline: 'border-2 border-primary/20 bg-transparent hover:bg-primary/5 hover:border-primary/50 text-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-muted hover:text-muted-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  const sizes = {
    default: 'h-11 px-6 py-2',
    sm: 'h-9 px-4 py-1.5 text-xs font-bold',
    lg: 'h-14 px-10 py-3 text-lg',
    icon: 'h-10 w-10',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

Button.displayName = 'Button';
