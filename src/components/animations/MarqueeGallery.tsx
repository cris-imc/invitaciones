"use client";

import Image from "next/image";

interface MarqueeGalleryProps {
    images: string[];
    speed?: number; // duration in seconds
}

export function MarqueeGallery({ images, speed = 30 }: MarqueeGalleryProps) {
    // Generate unique ID for this instance
    const uniqueId = `marquee-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes ${uniqueId}-scroll {
                    0% { 
                        transform: translateX(0); 
                    }
                    100% { 
                        transform: translateX(-33.333%); 
                    }
                }
                
                .${uniqueId}-container {
                    animation: ${uniqueId}-scroll ${speed}s linear infinite;
                    display: flex;
                    gap: 1rem;
                    width: max-content;
                }
                
                .${uniqueId}-container:hover {
                    animation-play-state: paused;
                }
                
                .${uniqueId}-image {
                    transition: transform 0.3s ease-in-out;
                }
                
                .${uniqueId}-image:hover {
                    transform: scale(1.1);
                }
            `}} />

            <div className="w-full overflow-hidden py-8">
                <div className={`${uniqueId}-container`}>
                    {/* Render images 3 times for seamless loop */}
                    {[...Array(3)].map((_, setIndex) => (
                        <div key={`set-${setIndex}`} className="flex gap-4">
                            {images.map((src, i) => (
                                <div
                                    key={`${setIndex}-${i}`}
                                    className={`relative h-64 w-64 md:h-[420px] md:w-[420px] flex-shrink-0 overflow-hidden shadow-lg ${uniqueId}-image`}
                                >
                                    <Image
                                        src={src}
                                        alt={`Gallery ${i + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 256px, 420px"
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
