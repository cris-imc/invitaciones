import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    variant?: "light" | "dark";
}

export function GlassCard({ children, className = "", variant = "light" }: GlassCardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border backdrop-blur-md transition-all duration-300",
                variant === "light"
                    ? "bg-white/10 border-white/20 shadow-lg hover:shadow-xl"
                    : "bg-black/10 border-black/20 shadow-lg hover:shadow-xl",
                className
            )}
        >
            {children}
        </div>
    );
}

interface ModernButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "ghost";
    className?: string;
    disabled?: boolean;
    loading?: boolean;
}

export function ModernButton({
    children,
    onClick,
    variant = "primary",
    className = "",
    disabled = false,
    loading = false
}: ModernButtonProps) {
    const baseStyles = "px-8 py-4 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group";

    const variantStyles = {
        primary: "bg-gradient-to-r from-primary to-primary/80 text-white hover:shadow-lg hover:scale-105 active:scale-95",
        secondary: "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:shadow-lg",
        ghost: "hover:bg-white/10 hover:backdrop-blur-md"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                baseStyles,
                variantStyles[variant],
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            {/* Ripple effect background */}
            <span className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />

            <span className="relative z-10 flex items-center justify-center gap-2">
                {loading && (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {children}
            </span>
        </button>
    );
}

interface ModernInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    className?: string;
}

export function ModernInput({
    value,
    onChange,
    placeholder,
    label,
    error,
    className = ""
}: ModernInputProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <label className="block text-sm font-medium opacity-80">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border transition-all duration-300",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                        "placeholder:text-white/40",
                        error ? "border-red-500" : "border-white/20"
                    )}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500 animate-shake">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
