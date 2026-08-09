"use client";

import { useEffect, useRef, useState } from "react";

// Corrección 3 (docs/correcciones.md): lógica de cuenta regresiva compartida,
// extraída de DraftCountdown.tsx/CountdownV2.tsx (antes duplicada en ambos).
// Los componentes visuales solo consumen este estado y deciden el JSX.

export interface TimeLeft {
  dias: number;
  hs: number;
  min: number;
  seg: number;
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { dias: 0, hs: 0, min: 0, seg: 0 };
  const totalSecs = Math.floor(diff / 1000);
  return {
    dias: Math.floor(totalSecs / 86400),
    hs: Math.floor((totalSecs % 86400) / 3600),
    min: Math.floor((totalSecs % 3600) / 60),
    seg: totalSecs % 60,
  };
}

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export interface CountdownState {
  time: TimeLeft;
  isEventDay: boolean;
  isPast: boolean;
  hasEnded: boolean;
}

export function useCountdown(targetDate: Date): CountdownState {
  const now = new Date();
  const target = new Date(targetDate);
  const isEventDay =
    now.getFullYear() === target.getFullYear() &&
    now.getMonth() === target.getMonth() &&
    now.getDate() === target.getDate();

  const isPast = target.getTime() < now.getTime() && !isEventDay;

  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(targetDate));
  const [hasEnded, setHasEnded] = useState(isPast);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPast) return;
    const update = () => {
      const t = calcTimeLeft(targetDate);
      setTime(t);
      if (t.dias === 0 && t.hs === 0 && t.min === 0 && t.seg === 0) {
        setHasEnded(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    update();
    timerRef.current = setInterval(update, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [targetDate, isPast]);

  return { time, isEventDay, isPast, hasEnded };
}
