import React from "react";
import { cn } from "../../utils/helpers";

const badgeVariants = {
    default: "bg-brand text-white hover:bg-brand/80",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "text-slate-950 border border-slate-200",
};

export function Badge({ className, variant = "default", ...props }) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
                badgeVariants[variant],
                className
            )}
            {...props}
        />
    );
}
