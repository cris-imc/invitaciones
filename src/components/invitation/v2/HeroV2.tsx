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
      className="hero"
      style={{
        ...(backgroundImage ? {
          backgroundImage: `linear-gradient(180deg, rgba(18,32,25,.2) 0%, rgba(18,32,25,.78) 100%), url(${backgroundImage})`,
          backgroundSize: `${scale}%`,
          backgroundPosition: `${posX}% ${posY}%`,
        } : {}),
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

      <div className="seal" aria-hidden="true">
        <span>{monogram}</span>
      </div>

      <p className="eyebrow">{eyebrow}</p>

      <h1>{renderTitle()}</h1>

      <p className="date">
        {date}
        {location && ` — ${location}`}
      </p>

      <div className="scroll-cue" aria-hidden="true" />
    </section>
  );
}
