import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface GlitchTextProps {
    children: React.ReactNode;
    className?: string;
}

export function GlitchText({ children, className = "" }: GlitchTextProps) {
    const [glitching, setGlitching] = useState(false);
    const childText = typeof children === 'string' ? children : '';

    useEffect(() => {
        const interval = setInterval(() => {
            setGlitching(true);
            setTimeout(() => setGlitching(false), 200);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`relative inline-block ${className}`}>
            <span className="relative z-10">{children}</span>
            {glitching && childText && (
                <>
                    <span
                        className="absolute top-0 left-0 text-[#00F3FF] opacity-70 animate-glitch-1"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)' }}
                    >
                        {childText}
                    </span>
                    <span
                        className="absolute top-0 left-0 text-[#FF00FF] opacity-70 animate-glitch-2"
                        style={{ clipPath: 'polygon(0 60%, 100% 60%, 100% 100%, 0 100%)' }}
                    >
                        {childText}
                    </span>
                </>
            )}
        </div>
    );
}

export function ScanlineOverlay() {
    return (
        <div
            className="fixed inset-0 pointer-events-none z-50 opacity-10"
            style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                animation: 'scanline 8s linear infinite'
            }}
        />
    );
}

export function NeonBorder({ children, color = "#00F3FF", className = "" }: { children: React.ReactNode; color?: string; className?: string }) {
    return (
        <div className={`relative ${className}`}>
            <div
                className="absolute inset-0 rounded-xl opacity-50 blur-sm"
                style={{
                    boxShadow: `0 0 10px ${color}, 0 0 20px ${color}, inset 0 0 10px ${color}`
                }}
            />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
