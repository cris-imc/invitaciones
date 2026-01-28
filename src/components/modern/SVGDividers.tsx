export function WaveDivider({ className = "", flip = false }: { className?: string; flip?: boolean }) {
    return (
        <div className={`w-full ${flip ? 'rotate-180' : ''} ${className}`}>
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-24">
                <path
                    d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                    opacity=".25"
                    className="fill-current"
                />
                <path
                    d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                    opacity=".5"
                    className="fill-current"
                />
                <path
                    d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                    className="fill-current"
                />
            </svg>
        </div>
    );
}

export function CurveDivider({ className = "", flip = false }: { className?: string; flip?: boolean }) {
    return (
        <div className={`w-full ${flip ? 'rotate-180' : ''} ${className}`}>
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-20">
                <path
                    d="M0,0V7.23C0,65.52,268.63,112.77,600,112.77S1200,65.52,1200,7.23V0Z"
                    className="fill-current"
                />
            </svg>
        </div>
    );
}

export function FloralDivider({ className = "" }: { className?: string }) {
    return (
        <div className={`w-full flex justify-center ${className}`}>
            <svg width="200" height="40" viewBox="0 0 200 40" className="opacity-60">
                <path
                    d="M100,20 Q90,10 80,20 T60,20 M100,20 Q110,10 120,20 T140,20"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />
                <circle cx="100" cy="20" r="4" fill="currentColor" />
                <circle cx="80" cy="20" r="3" fill="currentColor" opacity="0.7" />
                <circle cx="120" cy="20" r="3" fill="currentColor" opacity="0.7" />
            </svg>
        </div>
    );
}

export function GeometricDivider({ className = "" }: { className?: string }) {
    return (
        <div className={`w-full ${className}`}>
            <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-12">
                <polygon
                    points="0,0 600,60 1200,0 1200,60 0,60"
                    className="fill-current"
                />
            </svg>
        </div>
    );
}

// Decorative SVG icons
export function HeartIcon({ className = "" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );
}

export function StarIcon({ className = "" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    );
}

export function FlowerIcon({ className = "" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="6" r="2" opacity="0.8" />
            <circle cx="12" cy="18" r="2" opacity="0.8" />
            <circle cx="6" cy="12" r="2" opacity="0.8" />
            <circle cx="18" cy="12" r="2" opacity="0.8" />
            <circle cx="8" cy="8" r="1.5" opacity="0.6" />
            <circle cx="16" cy="8" r="1.5" opacity="0.6" />
            <circle cx="8" cy="16" r="1.5" opacity="0.6" />
            <circle cx="16" cy="16" r="1.5" opacity="0.6" />
        </svg>
    );
}
