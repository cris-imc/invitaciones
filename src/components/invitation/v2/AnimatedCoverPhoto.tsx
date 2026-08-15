"use client";

export type CoverPhotoEffect = "enfoque" | "shimmer" | "flash" | "geometric";

interface AnimatedCoverPhotoProps {
  photoSrc: string;
  // Sin tintColor1/2 (o con tint={false}) no se renderiza la capa de tinte
  // -- criterio: plantillas de paleta clara/pastel (Elegant, Editorial,
  // Seda...) van SIN tinte, solo blur (+ shimmer si corresponde); plantillas
  // de paleta más cargada/saturada (Moderno, Onix...) SÍ llevan tinte;
  // decisión por familia, no automática.
  tintColor1?: string;
  tintColor2?: string;
  tint?: boolean;
  effect?: CoverPhotoEffect;
  // Color base (formato "r,g,b") del degradé oscuro de legibilidad al pie
  // de la portada -- pasar el mismo tono de fondo que ya usa cada
  // plantilla para que el scrim se sienta parte del diseño, no pegado.
  scrimColorRgb?: string;
}

// Capas de fondo animado para la portada de bienvenida, reutilizable desde
// cualquier plantilla: foto en degradé de nitidez (Ken Burns + enfoque de
// apertura por default) + tinte "tinta en agua" con los colores propios de
// cada plantilla (mix-blend-mode:color, no tapa la foto, solo le cambia el
// matiz). "shimmer"/"flash" suman variantes para familias más delicadas o
// más extravagantes; "geometric" es la versión mínima (sin blur, sin loop)
// para familias sobrias. Nada de esto usa requestAnimationFrame ni lee
// layout en un loop -- todo es CSS (transform/opacity/clip-path), mismo
// cuidado que evitó el congelamiento viejo del AlbumCarousel (commit
// 82bcaff).
//
// Se renderiza como hijo directo de un contenedor position:relative|fixed
// con overflow:hidden (la portada de cada plantilla ya es así) -- no trae
// su propio wrapper posicionado.
export function AnimatedCoverPhoto({
  photoSrc,
  tintColor1,
  tintColor2,
  tint = true,
  effect = "enfoque",
  scrimColorRgb = "15,14,19",
}: AnimatedCoverPhotoProps) {
  const showTint = tint && Boolean(tintColor1) && Boolean(tintColor2);

  if (effect === "geometric") {
    return (
      <>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${photoSrc})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        {showTint && (
          <div className="acp-inktint" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 22%, ${tintColor1}, ${tintColor2} 140%)`, mixBlendMode: "color", opacity: 0.55 }} />
        )}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `linear-gradient(180deg, rgba(${scrimColorRgb},.15) 0%, rgba(${scrimColorRgb},.25) 40%, rgba(${scrimColorRgb},.55) 100%)` }} />
        <style>{`
          @keyframes acp-inkbleed { 0% { -webkit-clip-path: circle(0% at 50% 22%); clip-path: circle(0% at 50% 22%); } 100% { -webkit-clip-path: circle(145% at 50% 22%); clip-path: circle(145% at 50% 22%); } }
          .acp-inktint { animation: acp-inkbleed 1.6s cubic-bezier(.25,.8,.35,1) .2s both; }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className={`acp-kenburns${effect === "flash" ? " acp-flash-punch" : ""}`} style={{ position: "absolute", inset: "-40px", pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${photoSrc})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div
          className={effect === "enfoque" || effect === "shimmer" ? "acp-focuspull" : undefined}
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${photoSrc})`,
            backgroundSize: "cover", backgroundPosition: "center",
            filter: "blur(22px)",
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, transparent 28%, black 62%)",
            maskImage: "linear-gradient(180deg, transparent 0%, transparent 28%, black 62%)",
          }}
        />
      </div>

      {/* Tinte "tinta en agua" -- opcional (ver `tint`/`showTint`), con los
          colores propios de cada plantilla (principal/acento), nunca un
          color fijo. Se omite en plantillas de paleta clara/pastel. */}
      {showTint && (
        <div className="acp-inktint" style={{ position: "absolute", inset: "-40px", pointerEvents: "none", background: `radial-gradient(circle at 50% 22%, ${tintColor1}, ${tintColor2} 140%)`, mixBlendMode: "color", opacity: 0.75 }} />
      )}

      {effect === "shimmer" && (
        <>
          <div className="acp-shimmer-glow" style={{
            position: "absolute", width: 340, height: 340, borderRadius: "50%",
            top: "10%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none",
            background: "radial-gradient(circle, rgba(255,248,224,.95), rgba(255,255,255,.4) 45%, transparent 74%)",
            filter: "blur(2px)", mixBlendMode: "screen",
          }} />
          {[
            { top: "8%", left: "28%", delay: 0.6 },
            { top: "20%", left: "72%", delay: 1.0 },
            { top: "32%", left: "38%", delay: 1.4 },
            { top: "15%", left: "58%", delay: 1.8 },
          ].map((p, i) => (
            <div key={i} className="acp-shimmer-twinkle" style={{
              position: "absolute", top: p.top, left: p.left, width: 5, height: 5, borderRadius: "50%",
              background: "#FFF6DD", boxShadow: "0 0 8px 2px rgba(255,244,214,.9)", pointerEvents: "none",
              animationDelay: `${p.delay}s`,
            }} />
          ))}
        </>
      )}

      {/* "flash" es para familias alocadas/extravagantes -- siempre lleva
          colores (no depende de `tint`, es un efecto distinto al tinte de
          la foto en sí), con fallback dorado si por algún motivo no se
          pasaron. */}
      {effect === "flash" && (
        <>
          <div className="acp-flash-white" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "#FFFFFF" }} />
          <div className="acp-flash-strobe" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 30%, ${tintColor1 || "#C9A876"}, ${tintColor2 || "#8A7A63"} 55%, transparent 80%)`, mixBlendMode: "screen" }} />
        </>
      )}

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `linear-gradient(180deg, rgba(${scrimColorRgb},.1) 0%, rgba(${scrimColorRgb},.15) 28%, rgba(${scrimColorRgb},.35) 55%, rgba(${scrimColorRgb},.6) 100%)` }} />

      <style>{`
        @keyframes acp-kenburns { 0% { transform: scale(1) translate(0, 0); } 100% { transform: scale(1.12) translate(-1.5%, -1.5%); } }
        .acp-kenburns { animation: acp-kenburns 26s ease-in-out infinite alternate; transform-origin: center; }
        @keyframes acp-focuspull { 0% { opacity: 0; } 100% { opacity: 1; } }
        .acp-focuspull { animation: acp-focuspull 1.8s ease-out .2s both; }
        @keyframes acp-inkbleed { 0% { -webkit-clip-path: circle(0% at 50% 22%); clip-path: circle(0% at 50% 22%); } 100% { -webkit-clip-path: circle(145% at 50% 22%); clip-path: circle(145% at 50% 22%); } }
        .acp-inktint { animation: acp-inkbleed 2.2s cubic-bezier(.25,.8,.35,1) .3s both; }
        @keyframes acp-shimmerbloom { 0% { opacity: 0; transform: translateX(-50%) scale(.4); } 45% { opacity: .85; } 100% { opacity: 0; transform: translateX(-50%) scale(1.7); } }
        .acp-shimmer-glow { animation: acp-shimmerbloom 2s ease-out .3s both; }
        @keyframes acp-twinkle { 0%, 100% { opacity: 0; transform: scale(.4); } 50% { opacity: 1; transform: scale(1.3); } }
        .acp-shimmer-twinkle { animation: acp-twinkle 1.1s ease-in-out both; }
        @keyframes acp-flashpunch { 0% { transform: scale(1.22); } 55% { transform: scale(.97); } 100% { transform: scale(1); } }
        .acp-flash-punch { animation: acp-flashpunch .55s cubic-bezier(.2,1.6,.3,1) both; }
        @keyframes acp-flashwhite { 0% { opacity: 0; } 8% { opacity: .95; } 100% { opacity: 0; } }
        .acp-flash-white { animation: acp-flashwhite .45s ease-out both; }
        @keyframes acp-strobe { 0% { opacity: 0; } 20% { opacity: .7; } 100% { opacity: 0; } }
        .acp-flash-strobe { animation: acp-strobe .7s ease-out .1s both; }
      `}</style>
    </>
  );
}

// Transición cinemática de salida al tocar "abrir invitación" -- blur +
// zoom + fade, aplicable al wrapper de portada de cualquier plantilla.
// Ver uso: className={isClosing ? "acp-cover-exit" : ...}
export const COVER_EXIT_STYLE = `
  @keyframes acp-cover-exit {
    0% { opacity: 1; transform: scale(1); filter: blur(0px); }
    100% { opacity: 0; transform: scale(1.08); filter: blur(10px); }
  }
  .acp-cover-exit { animation: acp-cover-exit 0.7s cubic-bezier(.4,0,.2,1) forwards; pointer-events: none; }
`;

// El efecto (blur/Ken Burns/tinte) está pensado para el recorte vertical de
// una foto de celular -- en pantallas anchas se ve estirado/mal encuadrado.
// Estas clases hacen que <AnimatedCoverPhoto> solo se muestre en mobile, y
// el fondo "natural" de cada plantilla (el que ya tenía antes de esta
// feature) se siga viendo en desktop aunque haya foto cargada. Uso: envolvé
// <AnimatedCoverPhoto> en un <div className="acp-mobile-only"> y el
// decorado original de la plantilla en un <div className="acp-desktop-only">
// (solo cuando SÍ hay foto animada -- sin foto, el decorado original va sin
// envolver, en todos los tamaños).
export const COVER_RESPONSIVE_STYLE = `
  .acp-mobile-only { display: contents; }
  .acp-desktop-only { display: none; }
  @media (min-width: 768px) {
    .acp-mobile-only { display: none; }
    .acp-desktop-only { display: contents; }
  }
`;
