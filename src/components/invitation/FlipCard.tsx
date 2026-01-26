"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FlipCardProps {
    value: number;
}

export function FlipCard({ value }: FlipCardProps) {
    const [previousValue, setPreviousValue] = useState(value);
    const [isFlipping, setIsFlipping] = useState(false);

    useEffect(() => {
        if (value !== previousValue) {
            setIsFlipping(true);
            const timeout = setTimeout(() => {
                setPreviousValue(value);
                setIsFlipping(false);
            }, 600);
            return () => clearTimeout(timeout);
        }
    }, [value, previousValue]);

    const formattedValue = String(value).padStart(2, '0');
    const formattedPrevious = String(previousValue).padStart(2, '0');

    return (
        <div className="relative w-20 h-24 md:w-32 md:h-40 perspective-1000">
            <div className="relative w-full h-full">
                {/* Current/Static Card */}
                <div
                    className="absolute inset-0 flex items-center justify-center rounded-sm bg-white shadow-lg border-b-4 border-primary/20"
                    style={{
                        fontFamily: "var(--font-ornamental)",
                        color: 'var(--color-primary)',
                    }}
                >
                    <span className="text-4xl md:text-6xl font-bold">
                        {formattedPrevious}
                    </span>
                </div>

                {/* Animated Flip Card */}
                <AnimatePresence>
                    {isFlipping && (
                        <>
                            {/* Top Half - Flipping Down */}
                            <motion.div
                                initial={{ rotateX: 0 }}
                                animate={{ rotateX: -90 }}
                                exit={{ rotateX: -90 }}
                                transition={{ duration: 0.3, ease: "easeIn" }}
                                className="absolute inset-0 origin-bottom"
                                style={{
                                    transformStyle: "preserve-3d",
                                    backfaceVisibility: "hidden",
                                }}
                            >
                                <div
                                    className="absolute inset-0 flex items-center justify-center rounded-sm bg-white shadow-lg border-b-4 border-primary/20 overflow-hidden"
                                    style={{
                                        fontFamily: "var(--font-ornamental)",
                                        color: 'var(--color-primary)',
                                    }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-4xl md:text-6xl font-bold">
                                            {formattedPrevious}
                                        </span>
                                    </div>
                                    <div 
                                        className="absolute inset-x-0 top-1/2 h-1/2 bg-gradient-to-b from-transparent to-black/10"
                                    />
                                </div>
                            </motion.div>

                            {/* Bottom Half - Flipping Up */}
                            <motion.div
                                initial={{ rotateX: 90 }}
                                animate={{ rotateX: 0 }}
                                exit={{ rotateX: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut", delay: 0.3 }}
                                className="absolute inset-0 origin-top"
                                style={{
                                    transformStyle: "preserve-3d",
                                    backfaceVisibility: "hidden",
                                }}
                            >
                                <div
                                    className="absolute inset-0 flex items-center justify-center rounded-sm bg-white shadow-lg border-b-4 border-primary/20 overflow-hidden"
                                    style={{
                                        fontFamily: "var(--font-ornamental)",
                                        color: 'var(--color-primary)',
                                    }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-4xl md:text-6xl font-bold">
                                            {formattedValue}
                                        </span>
                                    </div>
                                    <div 
                                        className="absolute inset-x-0 bottom-1/2 h-1/2 bg-gradient-to-t from-transparent to-black/10"
                                    />
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
