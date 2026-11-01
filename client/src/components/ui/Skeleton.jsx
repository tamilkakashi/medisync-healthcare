import React from 'react';
import { cn } from '../../utils/helpers';

export const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-slate-200", className)}
            {...props}
        />
    );
};
