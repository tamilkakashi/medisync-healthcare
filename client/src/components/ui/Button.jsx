import React from 'react';
import { cn } from '../../utils/helpers';

export const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    disabled,
    ...props
}, ref) => {
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md',
        secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
        outline: 'bg-transparent text-primary border border-primary hover:bg-primary/5',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5',
        lg: 'px-8 py-3.5 text-lg',
    };

    return (
        <button
            ref={ref}
            disabled={disabled || isLoading}
            className={cn(
                'btn-medical group overflow-hidden relative',
                variant === 'primary' && 'bg-primary-gradient text-white shadow-luminous hover:shadow-primary/40 hover:-translate-y-0.5',
                variant === 'secondary' && 'bg-white/80 backdrop-blur-md text-slate-700 border border-slate-200 hover:bg-white hover:shadow-md hover:-translate-y-0.5',
                variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600 shadow-md',
                variant === 'ghost' && 'bg-transparent text-slate-600 hover:bg-slate-100',
                variant === 'outline' && 'bg-transparent text-primary border-2 border-primary hover:bg-primary/5',
                sizes[size],
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                </div>
            ) : children}
        </button>
    );
});

Button.displayName = 'Button';
