"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface MarqueeGalleryProps {
    images: string[];
    speed?: number; // pixels per second
}

export function MarqueeGallery({ images, speed = 50 }: MarqueeGalleryProps) {
    const [offset, setOffset] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number | null>(null);
    const previousTimeRef = useRef<number | null>(null);

    // Duplicate images directly to ensure no gaps ever
    // We tripple them to be safe for wide screens
    const allImages = [...images, ...images, ...images, ...images];

    const animate = (time: number) => {
        if (previousTimeRef.current !== null) {
            const deltaTime = time - previousTimeRef.current;
            // Move offset: speed (px/s) * deltaTime (ms) / 1000
            setOffset(prevOffset => {
                const newOffset = prevOffset + (speed * deltaTime / 1000);
                return newOffset;
            });
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
        };
    }, [speed]);

    // We can just translate a long strip
    // If offset exceeds the width of the first set of images, we subtact that width to loop seamlessly
    // But we need to know that width. 
    // Easier CSS approach:

    return (
        <div className="w-full overflow-hidden bg-background py-8">
            <div
                className="flex gap-4 w-max animate-marquee hover:pause"
                style={{
                    // Use CSS animation for smoother performance usually, but let's try a simple CSS class approach first
                    // or just use this one.
                }}
            >
                {/* We render 2 sets of images for seamless loop */}
                <div className="flex gap-4 animate-scroll-left">
                    {images.map((src, i) => (
                        <div key={`set1-${i}`} className="relative h-64 w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                            <Image
                                src={src}
                                alt={`Gallery ${i}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                    {images.map((src, i) => (
                        <div key={`set2-${i}`} className="relative h-64 w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                            <Image
                                src={src}
                                alt={`Gallery ${i}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                    {images.map((src, i) => (
                        <div key={`set3-${i}`} className="relative h-64 w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                            <Image
                                src={src}
                                alt={`Gallery ${i}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
            <style jsx global>{`
                @keyframes scroll-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
                .animate-scroll-left {
                    animation: scroll-left ${Math.max(20, images.length * 5)}s linear infinite;
                    display: flex;
                    gap: 1rem;
                    width: max-content;
                }
                .animate-marquee:hover .animate-scroll-left {
                    animation-play-state: paused;
                }
            `}</style>
        </div >
    );
}
