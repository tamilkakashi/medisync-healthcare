import React from 'react';
import { cn } from '../../utils/helpers';

export const Card = ({ className, children, ...props }) => {
    return (
        <div className={cn('glass-card p-6', className)} {...props}>
            {children}
        </div>
    );
};

export const CardHeader = ({ className, children, ...props }) => (
    <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className, children, ...props }) => (
    <h3 className={cn('text-xl font-semibold leading-none tracking-tight text-slate-900', className)} {...props}>
        {children}
    </h3>
);

export const CardDescription = ({ className, children, ...props }) => (
    <p className={cn('text-sm text-slate-500', className)} {...props}>
        {children}
    </p>
);

export const CardContent = ({ className, children, ...props }) => (
    <div className={cn('pt-0', className)} {...props}>
        {children}
    </div>
);

export const CardFooter = ({ className, children, ...props }) => (
    <div className={cn('flex items-center pt-4 border-t border-slate-100 mt-4', className)} {...props}>
        {children}
    </div>
);
