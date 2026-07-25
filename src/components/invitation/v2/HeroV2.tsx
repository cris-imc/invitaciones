"use client";

interface HeroV2Props {
  monogram: string;          // "M & G" | "V"
  eyebrow: string;           // "Nos casamos" | "Mis quince años"
  title: string;             // "Martina & Gonzalo"
  titleEm?: string;          // parte a resaltar en italic dorado, ej "& Gonzalo"
  date: string;              // "14 · 03 · 2027"
  location?: string;         // "Córdoba, Argentina"
  backgroundImage?: string;  // URL de imagen de portada
  posX?: number;             // 0-100
  posY?: number;             // 0-100
  scale?: number;            // 100 = normal
}

export function HeroV2({
  monogram,
  eyebrow,
  title,
  titleEm,
  date,
  location,
  backgroundImage,
  posX = 50,
  posY = 30,
  scale = 110,
}: HeroV2Props) {
  const bgStyle = backgroundImage
    ? {
        backgroundImage: `
          linear-gradient(180deg, rgba(18,32,25,.2) 0%, rgba(18,32,25,.78) 100%),
          url(${backgroundImage})
        `,
        backgroundSize: `${scale}%`,
        backgroundPosition: `${posX}% ${posY}%`,
      }
    : {
        background: `
          linear-gradient(180deg, rgba(18,32,25,.15) 0%, rgba(18,32,25,.75) 100%),
          radial-gradient(120% 90% at 30% 15%, var(--ink-2), var(--ink) 70%)
        `,
      };

  // Render del título con énfasis opcional
  const renderTitle = () => {
    if (!titleEm) {
      return <>{title}</>;
    }
    const idx = title.indexOf(titleEm);
    if (idx === -1) return <>{title}</>;
    return (
      <>
        {title.slice(0, idx)}
        <em>{titleEm}</em>
        {title.slice(idx + titleEm.length)}
      </>
    );
  };

  return (
    <section
      className="hero-v2"
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "28px 26px 100px", // 100px para dejar espacio al bottom nav
        color: "var(--on-ink)",
        overflow: "hidden",
        ...bgStyle,
        backgroundRepeat: "no-repeat",
      }}
      aria-label={`Portada: ${eyebrow} — ${title}`}
    >
      {/* Noise overlay sutil para textura */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,.05) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,.04) 0, transparent 45%)",
          pointerEvents: "none",
        }}
      />

      {/* Sello / monograma */}
      <div
        className="inv-seal animate-seal-in"
        aria-hidden="true"
      >
        <span>{monogram}</span>
      </div>

      {/* Eyebrow */}
      <p className="inv-eyebrow" style={{ marginBottom: "10px" }}>
        {eyebrow}
      </p>

      {/* Título display */}
      <h1
        className="inv-display"
        style={{ margin: "0 0 14px", color: "var(--on-ink)" }}
      >
        {renderTitle()}
      </h1>

      {/* Fecha + lugar */}
      <p
        className="inv-mono"
        style={{ margin: 0, opacity: 0.75 }}
      >
        {date}
        {location ? ` — ${location}` : ""}
      </p>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "76px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1px",
          height: "24px",
          background: "var(--c-accent)",
          opacity: 0.55,
        }}
      />
    </section>
  );
}
