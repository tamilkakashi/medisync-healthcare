import React from 'react';
import { cn } from '../../utils/helpers';

export const Input = ({ label, error, className, ...props }) => {
    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label className="text-sm font-bold text-slate-700 ml-1">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    'input-medical',
                    error && 'border-red-500 focus:ring-200 focus:border-red-500',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{error}</p>}
        </div>
    );
};

Input.displayName = 'Input';
