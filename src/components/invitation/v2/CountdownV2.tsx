"use client";

import { useEffect, useRef, useState } from "react";

interface CountdownV2Props {
  targetDate: Date;
  kicker?: string;
  title?: string;
  dark?: boolean;
}

interface TimeLeft {
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
    hs:   Math.floor((totalSecs % 86400) / 3600),
    min:  Math.floor((totalSecs % 3600) / 60),
    seg:  totalSecs % 60,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownV2({
  targetDate,
  kicker = "Cuenta regresiva",
  title,
  dark = false,
}: CountdownV2Props) {
  const isPast = targetDate.getTime() < Date.now();
  const isToday = !isPast && (targetDate.getTime() - Date.now()) < 86400000;

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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [targetDate, isPast]);

  const sectionClass = `d-sec${dark ? " dark" : ""}`;

  const boxes: { label: string; value: string }[] = [
    { label: "Días", value: String(time.dias) },
    { label: "Hs",   value: pad(time.hs) },
    { label: "Min",  value: pad(time.min) },
    { label: "Seg",  value: pad(time.seg) },
  ];

  if (hasEnded || isPast) {
    return (
      <section className={sectionClass} id="countdown">
        <p className="t-kicker">{kicker}</p>
        <div className="cd-past">
          <span className="cd-past-emoji">🎉</span>
          <p className="cd-past-text">¡Ya fue una noche increíble!</p>
        </div>
      </section>
    );
  }

  if (isToday) {
    return (
      <section className={sectionClass} id="countdown">
        <p className="t-kicker">{kicker}</p>
        <div className="cd-past">
          <span className="cd-past-emoji">✨</span>
          <p className="cd-past-text">¡Hoy es el gran día!</p>
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClass} id="countdown">
      <p className="t-kicker">{kicker}</p>
      {title && <h2>{title}</h2>}

      <div className="t-cd" role="timer" aria-live="off" aria-label="Cuenta regresiva">
        {boxes.map(({ label, value }) => (
          <div key={label}>
            <b aria-label={`${value} ${label}`}>
              {value}
            </b>
            <span aria-hidden="true">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
