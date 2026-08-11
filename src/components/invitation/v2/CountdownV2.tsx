"use client";

import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";

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
  const now = new Date();
  const target = new Date(targetDate);
  const isEventDay =
    now.getFullYear() === target.getFullYear() &&
    now.getMonth() === target.getMonth() &&
    now.getDate() === target.getDate();

  const isPast = target.getTime() < now.getTime() && !isEventDay;
  const isToday = isEventDay || (!isPast && (target.getTime() - now.getTime()) < 86400000);

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

  if (isEventDay || (isToday && (time.dias === 0 && time.hs === 0))) {
    return (
      <section className={sectionClass} id="countdown">
        <p className="t-kicker">{kicker}</p>
        <div className="cd-past p-8 rounded-2xl bg-[color-mix(in_srgb,var(--t-acc)_15%,transparent)] border border-[var(--t-acc)] text-center shadow-lg">
          <Heart className="w-12 h-12 mx-auto mb-3 text-[var(--t-acc)] opacity-90" strokeWidth={1.5} />
          <h3 className="text-2xl sm:text-3xl font-bold font-serif mb-2 text-[var(--t-acc)]">
            ¡Llegó el día!
          </h3>
          <p className="cd-past-text text-base sm:text-lg font-medium opacity-90 leading-relaxed">
            ¡Hoy es el gran día! Prepárate para festejar, reír y disfrutar cada instante inolvidable.
          </p>
        </div>
      </section>
    );
  }

  if (hasEnded || isPast) {
    return (
      <section className={sectionClass} id="countdown">
        <p className="t-kicker">{kicker}</p>
        <div className="cd-past text-center">
          <Heart className="w-10 h-10 mx-auto mb-2 text-[var(--t-acc)] opacity-90" strokeWidth={1.5} />
          <p className="cd-past-text">¡Ya fue una noche increíble!</p>
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClass} id="countdown">
      <p className="t-kicker">{kicker}</p>
      {title && <h2>{title}</h2>}

      <div style={{ display: "flex", alignItems: "center", gap: "2rem", margin: "3.5rem 0" }}>
        <div style={{ fontSize: "6.5rem", fontFamily: "var(--t-font-d)", color: "var(--t-acc)", lineHeight: 0.75, letterSpacing: "-0.04em" }}>
          {targetDate.getDate()}
        </div>
        <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid color-mix(in srgb, var(--t-acc) 40%, transparent)", paddingLeft: "2rem", gap: "0.4rem" }}>
          <span style={{ fontSize: "1.2rem", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", lineHeight: 1 }}>
            {targetDate.toLocaleDateString('es-AR', { month: 'long' })}
          </span>
          <span style={{ fontSize: "1.1rem", letterSpacing: "0.25em", opacity: 0.6, lineHeight: 1 }}>
            {targetDate.getFullYear()}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "4rem", flexWrap: "wrap", margin: "0" }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "1.3rem", fontWeight: 600, letterSpacing: "0.15em", color: "var(--t-acc)", opacity: 0.9, lineHeight: 1 }}>
            LOADING
          </span>
          <div className="flex gap-1 items-center opacity-80 h-[1.3rem]">
            <span className="block w-1.5 h-1.5 rounded-full bg-[var(--t-acc)] animate-pulse" style={{ animationDelay: "0ms" }}></span>
            <span className="block w-1.5 h-1.5 rounded-full bg-[var(--t-acc)] animate-pulse" style={{ animationDelay: "150ms" }}></span>
            <span className="block w-1.5 h-1.5 rounded-full bg-[var(--t-acc)] animate-pulse" style={{ animationDelay: "300ms" }}></span>
          </div>
        </div>
        <div className="t-cd" role="timer" aria-live="off" aria-label="Cuenta regresiva" style={{ margin: 0, flex: 1 }}>
          {boxes.map(({ label, value }) => (
            <div key={label}>
              <b aria-label={`${value} ${label}`}>
                {value}
              </b>
              <span aria-hidden="true">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
