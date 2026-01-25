"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CountdownProps {
    targetDate: Date;
}

export function Countdown({ targetDate }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const labels: Record<string, string> = {
        days: "DÍAS",
        hours: "HS",
        minutes: "MIN",
        seconds: "SEG"
    };

    return (
        <div className="py-16 md:py-20" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="container px-6 mx-auto max-w-4xl">
                <div className="text-center mb-10">
                    <span
                        className="text-sm tracking-[0.3em] block mb-4 font-medium uppercase"
                        style={{ color: 'var(--color-text-secondary)', fontFamily: "'Montserrat', sans-serif" }}
                    >
                        FALTAN
                    </span>
                </div>

                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                    {Object.entries(timeLeft).map(([unit, value]) => (
                        <div key={unit} className="text-center flex flex-col items-center">
                            <div
                                className="w-20 h-24 md:w-32 md:h-40 flex items-center justify-center rounded-sm bg-white shadow-lg border-b-4 border-primary/20"
                                style={{
                                    fontFamily: "var(--font-ornamental)",
                                    color: 'var(--color-primary)',
                                }}
                            >
                                <span className="text-4xl md:text-6xl font-bold">
                                    {String(value).padStart(2, '0')}
                                </span>
                            </div>
                            <span
                                className="mt-4 block text-xs md:text-sm font-bold tracking-[0.2em] uppercase"
                                style={{
                                    fontFamily: "'Montserrat', sans-serif",
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                {labels[unit]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
