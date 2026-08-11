"use client";

import { useCountdown, pad } from "./useCountdown";
import { Heart } from "lucide-react";

// Corrección 3 (docs/correcciones.md): componente de countdown unificado con
// 4 estilos visuales seleccionables desde el wizard (StepCountdownStyle).
// Reemplaza el uso de DraftCountdown/CountdownV2 en las plantillas (esos dos
// archivos quedan intactos pero sin uso, por si hace falta comparar).

export type CountdownStyleId = "clasico" | "minimalista" | "capsulas" | "flip";

interface CountdownProps {
  targetDate: Date;
  kicker?: string;
  title?: string;
  dark?: boolean;
  countdownStyle?: CountdownStyleId;
}

export function Countdown({
  targetDate,
  kicker = "Cuenta regresiva",
  dark = false,
  countdownStyle = "clasico",
}: CountdownProps) {
  const { time, isEventDay, isPast, hasEnded } = useCountdown(targetDate);
  const sectionClass = `d-sec${dark ? " dark" : ""}`;

  if (isEventDay || (!isPast && time.dias === 0 && time.hs === 0 && time.min === 0 && time.seg === 0)) {
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

  const boxes: { label: string; value: string }[] = [
    { label: "Días", value: String(time.dias) },
    { label: "Hs", value: pad(time.hs) },
    { label: "Min", value: pad(time.min) },
    { label: "Seg", value: pad(time.seg) },
  ];
  const kickerLabel = kicker.toUpperCase() === "CUENTA REGRESIVA" ? "CUENTA REGRESIVA EN VIVO" : kicker.toUpperCase();

  if (countdownStyle === "minimalista") {
    return (
      <section data-style="minimalista" className={`w-full py-16 px-6 flex flex-col items-center justify-center text-center ${dark ? "bg-transparent dark" : "bg-transparent"}`} id="countdown">
        <p className="t-kicker mb-4">{kickerLabel}</p>
        <p
          className={`text-5xl sm:text-6xl font-light ${dark ? "text-[#EDE9F4]" : "text-[#2C2C2C]"}`}
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          {time.dias}
        </p>
        <p className="text-xs sm:text-sm font-sans font-medium uppercase tracking-widest mt-2" style={{ color: "var(--t-acc)", opacity: 0.8 }}>
          {time.dias === 1 ? "día para el gran momento" : "días para el gran momento"}
        </p>
      </section>
    );
  }

  if (countdownStyle === "capsulas") {
    return (
      <section data-style="capsulas" className={`w-full py-20 px-6 md:px-12 flex flex-col items-center justify-center ${dark ? "bg-transparent dark" : "bg-transparent"}`} id="countdown">
        <div className="w-full max-w-[340px] sm:max-w-xl text-center mx-auto">
          <p className="t-kicker mb-8" style={{ display: "flex", justifyContent: "center" }}>{kickerLabel}</p>
          <div style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", justifyContent: "space-between", gap: "0.25rem", width: "100%" }}>
            {boxes.map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 12px",
                  borderRadius: "9999px",
                  background: "var(--t-acc)",
                  flex: "1 1 0",
                  minWidth: "0"
                }}
              >
                <b
                  aria-label={`${value} ${label}`}
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    lineHeight: 1,
                    color: "#ffffff",
                    fontFamily: "var(--font-cormorant), serif",
                  }}
                >
                  {value}
                </b>
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: "0.55rem",
                    fontFamily: "sans-serif",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginTop: "4px",
                    color: "#ffffff",
                    opacity: 0.9,
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (countdownStyle === "flip") {
    return (
      <section data-style="flip" className={`w-full py-20 px-6 md:px-12 flex flex-col items-center justify-center ${dark ? "bg-transparent dark" : "bg-transparent"}`} id="countdown">
        <div className="w-full max-w-[340px] sm:max-w-xl text-center mx-auto">
          <p className="t-kicker mb-8">{kickerLabel}</p>
          <div className="flex items-center justify-center gap-1 sm:gap-2 w-full">
            {boxes.map(({ label, value }, i) => (
              <div key={label} className="flex items-center">
                <div
                  className="flex flex-col items-center justify-center w-[3.6rem] h-[4.6rem] sm:w-[4.4rem] sm:h-[5.4rem] rounded-lg shadow-sm"
                  style={{ 
                      background: "color-mix(in srgb, var(--t-ink) 4%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--t-acc) 40%, transparent)" 
                  }}
                >
                  <b
                    aria-label={`${value} ${label}`}
                    className="text-xl sm:text-2xl font-semibold"
                    style={{ color: "var(--t-acc)", fontFamily: "var(--font-cormorant), serif" }}
                  >
                    {value}
                  </b>
                  <span aria-hidden="true" className="text-[0.55rem] sm:text-[0.6rem] font-sans font-medium uppercase tracking-widest mt-0.5" style={{ color: "var(--t-acc)", opacity: 0.8 }}>
                    {label}
                  </span>
                </div>
                {i < boxes.length - 1 && (
                  <span aria-hidden="true" className="mx-1 sm:mx-1.5 text-lg sm:text-xl font-light" style={{ color: "var(--t-acc)", opacity: 0.5 }}>
                    :
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // "clasico" (default)
  return (
    <section data-style="clasico" className={`w-full py-20 px-6 md:px-12 flex flex-col items-center justify-center ${dark ? "bg-black/20 dark" : "bg-white/40"}`} id="countdown">
      <div className="w-full max-w-[340px] sm:max-w-xl text-left mx-auto">
        <p className="t-kicker mb-8" style={{ display: "flex", justifyContent: "flex-start" }}>{kickerLabel}</p>
        <div style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", width: "100%" }}>
          {boxes.map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: "1 1 0",
                minWidth: "0",
                padding: "8px 0",
                borderRadius: "1rem",
                background: "color-mix(in srgb, var(--t-ink) 4%, transparent)",
                border: "1px solid color-mix(in srgb, var(--t-acc) 40%, transparent)",
              }}
            >
              <b
                aria-label={`${value} ${label}`}
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 300,
                  lineHeight: 1,
                  color: "var(--t-acc)",
                  fontFamily: "var(--font-cormorant), serif",
                }}
              >
                {value}
              </b>
              <span
                aria-hidden="true"
                style={{
                  fontSize: "0.65rem",
                  fontFamily: "sans-serif",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginTop: "8px",
                  color: "var(--t-acc)",
                  opacity: 0.8,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
