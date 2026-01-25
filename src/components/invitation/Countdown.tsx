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
            <div className="container px-6 mx-auto max-w-3xl">
                <div className="text-center mb-8">
                    <span 
                        className="text-xs uppercase tracking-[0.25em] block mb-3"
                        style={{ color: 'var(--color-text-secondary)', fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Cuenta Regresiva
                    </span>
                    <h2 
                        className="text-2xl md:text-3xl"
                        style={{ color: 'var(--color-primary)', fontFamily: "'Parisienne', cursive" }}
                    >
                        Faltan
                    </h2>
                </div>
                
                <div className="flex justify-center gap-3 md:gap-6">
                    {Object.entries(timeLeft).map(([unit, value]) => (
                        <div key={unit} className="text-center flex flex-col items-center">
                            <div 
                                className="w-18 h-18 md:w-24 md:h-24 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100"
                                style={{ 
                                    width: '72px',
                                    height: '72px',
                                    fontFamily: "'Montserrat', sans-serif",
                                    fontSize: '28px',
                                    fontWeight: '600',
                                    color: 'var(--color-primary)',
                                }}
                            >
                                {String(value).padStart(2, '0')}
                            </div>
                            <span 
                                className="mt-3 block"
                                style={{
                                    fontFamily: "'Montserrat', sans-serif",
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    color: 'var(--color-text-secondary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.15em',
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
