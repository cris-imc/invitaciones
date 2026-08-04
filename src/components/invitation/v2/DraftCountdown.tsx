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

export function DraftCountdown({
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
          <span className="cd-past-emoji text-5xl mb-3 block">🎉</span>
          <h3 className="text-2xl sm:text-3xl font-bold font-serif mb-2 text-[var(--t-acc)]">
            ¡Llegó el día!
          </h3>
          <p className="cd-past-text text-base sm:text-lg font-medium opacity-90 leading-relaxed">
            ¡Hoy es el gran día! Prepárate para festejar, reír y disfrutar cada instante inolvidable. ✨🥳
          </p>
        </div>
      </section>
    );
  }

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

  return (
    <section className={`w-full py-20 px-6 md:px-12 flex flex-col items-center justify-center ${dark ? "bg-[#15131B] dark" : "bg-[#F9F7F1]"}`} id="countdown">
      <div className="w-full max-w-[340px] sm:max-w-xl text-left mx-auto">
        <p className="t-kicker mb-8">
          {kicker.toUpperCase() === "CUENTA REGRESIVA" ? "CUENTA REGRESIVA EN VIVO" : kicker.toUpperCase()}
        </p>

        <div className="flex flex-wrap items-center justify-between sm:justify-start sm:gap-6 w-full">
          {boxes.map(({ label, value }) => (
            <div key={label} className={`flex flex-col items-center justify-center w-[4.5rem] h-[5.5rem] sm:w-[5.5rem] sm:h-[6.5rem] rounded-2xl shadow-sm ${dark ? "bg-[#1C1926]" : "bg-transparent"}`} style={{ border: '1px solid color-mix(in srgb, var(--t-acc) 40%, transparent)' }}>
              <b aria-label={`${value} ${label}`} className={`text-[1.8rem] sm:text-4xl font-light ${dark ? "text-[#EDE9F4]" : "text-[#2C2C2C]"}`} style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                {value}
              </b>
              <span aria-hidden="true" className="text-[0.65rem] sm:text-xs font-sans font-medium uppercase tracking-widest mt-1 sm:mt-2" style={{ color: 'var(--t-acc)', opacity: 0.7 }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
