"use client";

import { useEffect, useState } from "react";

export function LiveCountdownLanding() {
    const [timeLeft, setTimeLeft] = useState({
        dias: 0,
        horas: 0,
        minutos: 0,
        segundos: 0,
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Arbitrary future date (e.g. 62 days from now)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 62);
        targetDate.setHours(targetDate.getHours() + 14);
        targetDate.setMinutes(targetDate.getMinutes() + 32);

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance < 0) {
                clearInterval(timer);
                return;
            }

            setTimeLeft({
                dias: Math.floor(distance / (1000 * 60 * 60 * 24)),
                horas: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutos: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                segundos: Math.floor((distance % (1000 * 60)) / 1000),
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!mounted) {
        return (
            <div className="cd">
                <div>
                    <b>62</b>
                    <span>días</span>
                </div>
                <div>
                    <b>14</b>
                    <span>hs</span>
                </div>
                <div>
                    <b>32</b>
                    <span>min</span>
                </div>
                <div>
                    <b>00</b>
                    <span>seg</span>
                </div>
            </div>
        );
    }

    return (
        <div className="cd">
            <div>
                <b>{timeLeft.dias}</b>
                <span>días</span>
            </div>
            <div>
                <b>{timeLeft.horas.toString().padStart(2, "0")}</b>
                <span>hs</span>
            </div>
            <div>
                <b>{timeLeft.minutos.toString().padStart(2, "0")}</b>
                <span>min</span>
            </div>
            <div>
                <b className="tabular-nums text-yellow-500 animate-pulse">{timeLeft.segundos.toString().padStart(2, "0")}</b>
                <span>seg</span>
            </div>
        </div>
    );
}
