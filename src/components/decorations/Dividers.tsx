export function FloralDivider({ className = "", style = "elegant" }: { className?: string; style?: "elegant" | "minimal" | "romantic" }) {
    if (style === "minimal") {
        return (
            <svg 
                className={className}
                width="200" 
                height="40" 
                viewBox="0 0 200 40" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <path 
                    d="M0 20 L80 20 M120 20 L200 20" 
                    stroke="currentColor" 
                    strokeWidth="1"
                    opacity="0.3"
                />
                <circle cx="100" cy="20" r="4" fill="currentColor" opacity="0.5"/>
            </svg>
        );
    }

    if (style === "romantic") {
        return (
            <svg 
                className={className}
                width="300" 
                height="60" 
                viewBox="0 0 300 60" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <path 
                    d="M150 30 C140 20, 130 15, 120 20 C110 25, 110 35, 120 40 C130 45, 140 40, 150 30 Z" 
                    fill="currentColor" 
                    opacity="0.2"
                />
                <path 
                    d="M150 30 C160 20, 170 15, 180 20 C190 25, 190 35, 180 40 C170 45, 160 40, 150 30 Z" 
                    fill="currentColor" 
                    opacity="0.2"
                />
                <path 
                    d="M20 30 L130 30 M170 30 L280 30" 
                    stroke="currentColor" 
                    strokeWidth="1"
                    opacity="0.3"
                />
            </svg>
        );
    }

    // elegant (default)
    return (
        <svg 
            className={className}
            width="400" 
            height="80" 
            viewBox="0 0 400 80" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Center ornament */}
            <path 
                d="M200 40 L210 30 L215 35 L220 30 L230 40 L220 50 L215 45 L210 50 Z" 
                fill="currentColor" 
                opacity="0.3"
            />
            <path 
                d="M200 40 L190 30 L185 35 L180 30 L170 40 L180 50 L185 45 L190 50 Z" 
                fill="currentColor" 
                opacity="0.3"
            />
            {/* Lines */}
            <path 
                d="M50 40 L165 40" 
                stroke="currentColor" 
                strokeWidth="1"
                opacity="0.3"
            />
            <path 
                d="M235 40 L350 40" 
                stroke="currentColor" 
                strokeWidth="1"
                opacity="0.3"
            />
            {/* Decorative dots */}
            <circle cx="160" cy="40" r="2" fill="currentColor" opacity="0.4"/>
            <circle cx="240" cy="40" r="2" fill="currentColor" opacity="0.4"/>
        </svg>
    );
}

export function CornerFlourish({ className = "", position = "top-left" }: { className?: string; position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
    const rotation = {
        "top-left": "0",
        "top-right": "90",
        "bottom-right": "180",
        "bottom-left": "270"
    }[position];

    return (
        <svg 
            className={className}
            width="120" 
            height="120" 
            viewBox="0 0 120 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            {/* Main curve */}
            <path 
                d="M10 10 Q10 60, 60 60 Q110 60, 110 10" 
                stroke="currentColor" 
                strokeWidth="1.5"
                fill="none"
                opacity="0.4"
            />
            {/* Inner decorative curve */}
            <path 
                d="M20 20 Q20 50, 50 50 Q80 50, 80 20" 
                stroke="currentColor" 
                strokeWidth="1"
                fill="none"
                opacity="0.3"
            />
            {/* Small leaves */}
            <path 
                d="M30 30 Q35 35, 40 30 Q35 25, 30 30" 
                fill="currentColor" 
                opacity="0.2"
            />
            <path 
                d="M50 35 Q55 40, 60 35 Q55 30, 50 35" 
                fill="currentColor" 
                opacity="0.2"
            />
        </svg>
    );
}

export function HeartDivider({ className = "" }: { className?: string }) {
    return (
        <svg 
            className={className}
            width="80" 
            height="80" 
            viewBox="0 0 80 80" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path 
                d="M40 60 C40 60, 20 45, 20 32 C20 24, 26 20, 32 20 C36 20, 40 22, 40 26 C40 22, 44 20, 48 20 C54 20, 60 24, 60 32 C60 45, 40 60, 40 60 Z" 
                fill="currentColor" 
                opacity="0.15"
            />
            <path 
                d="M20 40 L60 40" 
                stroke="currentColor" 
                strokeWidth="1"
                opacity="0.3"
            />
        </svg>
    );
}

export function RingsDivider({ className = "" }: { className?: string }) {
    return (
        <svg 
            className={className}
            width="120" 
            height="60" 
            viewBox="0 0 120 60" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Left ring */}
            <circle 
                cx="40" 
                cy="30" 
                r="15" 
                stroke="currentColor" 
                strokeWidth="2"
                fill="none"
                opacity="0.4"
            />
            <circle 
                cx="40" 
                cy="30" 
                r="18" 
                stroke="currentColor" 
                strokeWidth="1"
                fill="none"
                opacity="0.2"
            />
            {/* Right ring */}
            <circle 
                cx="80" 
                cy="30" 
                r="15" 
                stroke="currentColor" 
                strokeWidth="2"
                fill="none"
                opacity="0.4"
            />
            <circle 
                cx="80" 
                cy="30" 
                r="18" 
                stroke="currentColor" 
                strokeWidth="1"
                fill="none"
                opacity="0.2"
            />
            {/* Connecting element */}
            <path 
                d="M55 25 L65 25" 
                stroke="currentColor" 
                strokeWidth="1"
                opacity="0.3"
            />
        </svg>
    );
}

export function CrownDivider({ className = "" }: { className?: string }) {
    return (
        <svg 
            className={className}
            width="100" 
            height="60" 
            viewBox="0 0 100 60" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path 
                d="M10 40 L20 20 L30 35 L40 15 L50 30 L60 15 L70 35 L80 20 L90 40" 
                stroke="currentColor" 
                strokeWidth="2"
                fill="none"
                opacity="0.4"
            />
            <path 
                d="M10 40 L90 40" 
                stroke="currentColor" 
                strokeWidth="2"
                opacity="0.4"
            />
            {/* Decorative circles at peaks */}
            <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.5"/>
            <circle cx="40" cy="15" r="4" fill="currentColor" opacity="0.5"/>
            <circle cx="60" cy="15" r="4" fill="currentColor" opacity="0.5"/>
            <circle cx="80" cy="20" r="3" fill="currentColor" opacity="0.5"/>
        </svg>
    );
}

export function BalloonsDivider({ className = "" }: { className?: string }) {
    return (
        <svg 
            className={className}
            width="120" 
            height="80" 
            viewBox="0 0 120 80" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Balloons */}
            <ellipse cx="30" cy="25" rx="12" ry="15" fill="currentColor" opacity="0.2"/>
            <path d="M30 40 L30 55" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
            
            <ellipse cx="60" cy="20" rx="14" ry="18" fill="currentColor" opacity="0.25"/>
            <path d="M60 38 L60 55" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
            
            <ellipse cx="90" cy="25" rx="12" ry="15" fill="currentColor" opacity="0.2"/>
            <path d="M90 40 L90 55" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
        </svg>
    );
}

export function StarDivider({ className = "" }: { className?: string }) {
    return (
        <svg 
            className={className}
            width="200" 
            height="60" 
            viewBox="0 0 200 60" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Center star */}
            <path 
                d="M100 10 L105 25 L120 25 L108 35 L113 50 L100 40 L87 50 L92 35 L80 25 L95 25 Z" 
                fill="currentColor" 
                opacity="0.3"
            />
            {/* Side stars */}
            <path 
                d="M50 20 L53 28 L62 28 L55 33 L58 42 L50 36 L42 42 L45 33 L38 28 L47 28 Z" 
                fill="currentColor" 
                opacity="0.2"
            />
            <path 
                d="M150 20 L153 28 L162 28 L155 33 L158 42 L150 36 L142 42 L145 33 L138 28 L147 28 Z" 
                fill="currentColor" 
                opacity="0.2"
            />
            {/* Lines */}
            <path d="M10 30 L35 30" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
            <path d="M165 30 L190 30" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
        </svg>
    );
}
