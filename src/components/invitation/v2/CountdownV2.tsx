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
  const diff = Math.max(0, target.getTime() - Date.now());
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
  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(targetDate));
  const [hasEnded, setHasEnded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
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
  }, [targetDate]);

  const sectionClass = `inv-section${dark ? " dark" : ""}`;

  const boxes: { label: string; value: string }[] = [
    { label: "Días", value: String(time.dias) },
    { label: "Hs",   value: pad(time.hs) },
    { label: "Min",  value: pad(time.min) },
  ];

  if (hasEnded) {
    return (
      <section className={sectionClass} id="countdown">
        <p className="inv-eyebrow">{kicker}</p>
        <h2 className="inv-h2">¡Hoy es el gran día! 🎉</h2>
      </section>
    );
  }

  return (
    <section className={sectionClass} id="countdown">
      <p className="inv-eyebrow">{kicker}</p>
      {title && <h2 className="inv-h2">{title}</h2>}

      <div className="inv-cd" role="timer" aria-live="off" aria-label="Cuenta regresiva">
        {boxes.map(({ label, value }) => (
          <div key={label} className="inv-cd-box">
            <span className="inv-cd-num" aria-label={`${value} ${label}`}>
              {value}
            </span>
            <span className="inv-cd-label" aria-hidden="true">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
