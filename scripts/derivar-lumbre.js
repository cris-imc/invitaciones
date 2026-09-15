#!/usr/bin/env node
/**
 * Deriva LumbreTemplate.tsx de PrensaTemplate.tsx.
 *
 * Las cinco familias de Papel Prensado son el MISMO registro: la hoja, el
 * relieve que gira con el scroll, la entrada de sección, la pastilla que se
 * repliega, el CONFIRMADO hueco. En el mockup, Lumbre y Prensa se diferencian
 * en 87 líneas de 1.037: el papel es más cálido y la portada es a sangre --
 * una foto a pantalla completa con los nombres en Final Parade encima, en vez
 * de la hoja con el ícono.
 *
 * Por eso Lumbre se deriva en vez de escribirse de nuevo: un arreglo en el
 * registro (el relieve, la pastilla, el álbum) se hace una vez en Prensa y
 * llega a Lumbre con volver a correr esto. Lo que es propio de Lumbre está
 * todo acá abajo, a la vista.
 *
 * Uso:  node scripts/derivar-lumbre.js
 */
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(__dirname, "..", "src", "components", "templates");
let s = fs.readFileSync(path.join(DIR, "PrensaTemplate.tsx"), "utf8");
const faltantes = [];
function rep(a, b, etiqueta) {
  if (!s.includes(a)) { faltantes.push(etiqueta); return; }
  s = s.split(a).join(b);
}

// ── 1. Identidad del archivo ──────────────────────────────────────────────
s = s.replace(/\bpr-/g, "lu-")
  .replace(/prCormorant/g, "luCormorant")
  .replace(/prJost/g, "luJost")
  .replace(/prSplashSale/g, "luSplashSale")
  .replace(/prPortadaSube/g, "luPortadaSube")
  .replace(/prPrensado/g, "luPrensado")
  .replace(/CSS_PRENSA/g, "CSS_LUMBRE")
  .replace(/PrensaTemplate/g, "LumbreTemplate");

// ── 2. La cabecera cuenta qué es esta familia ─────────────────────────────
const cabeceraVieja = s.slice(s.indexOf("/**"), s.indexOf(" */") + 3);
s = s.replace(cabeceraVieja, [
  "/**",
  " * LumbreTemplate.tsx — Colección Paper · Papel Prensado · Familia 06 \"Lumbre\"",
  " * Variante: Topo (base). Las otras cuatro (Tostado, Arcilla, Ceniza, Sombra)",
  " * se generan con scripts/gen-papel-prensado-variants.js.",
  " *",
  " * GENERADO por scripts/derivar-lumbre.js a partir de PrensaTemplate.tsx —",
  " * no editar a mano: lo que sea del registro se arregla en Prensa y se vuelve",
  " * a derivar; lo que sea de Lumbre se cambia en el script.",
  " *",
  " * Portado desde mockup/Paper/Lumbre - Panoramica.dc.html. Es la misma",
  " * imprenta que Prensa -- hoja con grano, relieve que gira con el scroll,",
  " * entrada de sección, pastilla que se repliega, CONFIRMADO hueco -- con dos",
  " * diferencias, que son toda la familia:",
  " *",
  " *  - EL PAPEL ES MÁS OSCURO Y MÁS CÁLIDO (topo #E9DFD3, tinta #3A322B). La",
  " *    colección sigue siendo monocroma: las cinco variantes cambian el tono",
  " *    del papel y nada más.",
  " *  - LA PORTADA ES A SANGRE: la foto del anfitrión ocupa la pantalla entera,",
  " *    con un velo de legibilidad que va de rgba(28,24,20,.15) arriba a .78",
  " *    abajo, y los nombres en Final Parade en blanco sobre ella. Sin foto",
  " *    cargada el velo cae sobre el papel prensado, así que la portada sigue",
  " *    siendo una portada y no un rectángulo vacío.",
  " */",
].join("\n"));

// ── 3. El papel de Lumbre ─────────────────────────────────────────────────
rep('const PAPEL = "#F4ECE2";', 'const PAPEL = "#E9DFD3";', "PAPEL");
rep('const PAPEL2 = "#EFE5D9";', 'const PAPEL2 = "#E1D5C7";', "PAPEL2");
rep('const TINTA = "#514842";', 'const TINTA = "#3A322B";', "TINTA");
rep('const TINTA_SUAVE = "#8A756D";', 'const TINTA_SUAVE = "#857868";', "TINTA_SUAVE");
rep('const SH = "120,103,86";', 'const SH = "104,88,70";', "SH");

// ── 4. La portada a sangre (celular: splash) ──────────────────────────────
rep([
  '          {portadaFondoAnimado && (',
  '            <div className="acp-mobile-only">',
  '              <AnimatedCoverPhoto',
  '                photoSrc={portadaImagenFondoDesktopRaw as string}',
  '                tintColor1={PAPEL}',
  '                tintColor2={TINTA_SUAVE}',
  '                effect="enfoque"',
  '                scrimColorRgb="244,236,226"',
  '              />',
  '            </div>',
  '          )}',
  '          <Hoja className="lu-splash-hoja">',
  '            <p className="lu-kicker">{saludaAlInvitado ? portadaKicker : kickerDelEvento}</p>',
  '            <p className="lu-splash-nombre">{guestNameDisplay}</p>',
  '            <div className="lu-filete-corto" aria-hidden="true" />',
].join("\n"), [
  '          {portadaFondoAnimado && (',
  '            <AnimatedCoverPhoto',
  '              photoSrc={portadaImagenFondoDesktopRaw as string}',
  '              tint={false}',
  '              effect="enfoque"',
  '              scrimColorRgb="28,24,20"',
  '            />',
  '          )}',
  '          <div className="lu-velo lu-velo--splash" aria-hidden="true" />',
  '          <div className="lu-sangre-texto">',
  '            <p className="lu-kicker lu-kicker--claro">{saludaAlInvitado ? portadaKicker : kickerDelEvento}</p>',
  '            <p className="lu-splash-nombre">{guestNameDisplay}</p>',
  '            <div className="lu-filete-corto lu-filete-corto--claro" aria-hidden="true" />',
].join("\n"), "splash a sangre (apertura)");

rep([
  '            {saludaAlInvitado && <p className="lu-dato">{nombresLinea}</p>}',
  '            <p className="lu-dato" style={{ color: TINTA_SUAVE }}>{fechaCorta}{ciudad ? ` · ${ciudad}` : ""}</p>',
  '            {Boolean(activeDressCode) && <p className="lu-kicker" style={{ marginTop: 6 }}>{tx("invitacion.ubicacion.dressCode")} {activeDressCode}</p>}',
  '            <button type="button" onClick={openInvitation} className="lu-btn-solido" style={{ marginTop: 26 }}>',
  '              {tx("invitacion.portada.abrirInvitacion")}',
  '            </button>',
  '          </Hoja>',
].join("\n"), [
  '            {saludaAlInvitado && <p className="lu-dato lu-dato--claro">{nombresLinea}</p>}',
  '            <p className="lu-dato lu-dato--claro">{fechaCorta}{ciudad ? ` · ${ciudad}` : ""}</p>',
  '            {Boolean(activeDressCode) && <p className="lu-kicker lu-kicker--claro" style={{ marginTop: 6 }}>{tx("invitacion.ubicacion.dressCode")} {activeDressCode}</p>}',
  '            <button type="button" onClick={openInvitation} className="lu-btn-claro" style={{ marginTop: 26 }}>',
  '              {tx("invitacion.portada.abrirInvitacion")}',
  '            </button>',
  '          </div>',
].join("\n"), "splash a sangre (cierre)");

// ── 5. La columna izquierda de escritorio, también a sangre ───────────────
rep([
  '        <aside className="d-left hide-mobile lu-izquierda">',
  '          <Hoja portada className="lu-hoja-grande">',
  '            <IconoLinea nombre={esXV ? "torta" : "anillos"} ancho={esXV ? "18%" : "22%"} tope={76} />',
  '            <p className="lu-kicker">{kickerDelEvento}</p>',
  '            <h1 className="lu-nombres">',
  '              <span>{nombre1}</span>',
  '              {nombre2 && <span className="lu-amp">&amp;</span>}',
  '              {nombre2 && <span>{nombre2}</span>}',
  '            </h1>',
  '            <div className="lu-filete-corto" aria-hidden="true" />',
  '            <p className="lu-dato">{fechaLarga}</p>',
  '            {ciudad && <p className="lu-dato">{ciudad}</p>}',
  '            <div className="lu-nav-escritorio">',
].join("\n"), [
  '        <aside className="d-left hide-mobile lu-izquierda lu-izquierda--sangre">',
  '          {portadaFondoAnimado && (',
  '            <AnimatedCoverPhoto',
  '              photoSrc={portadaImagenFondoDesktopRaw as string}',
  '              tint={false}',
  '              effect="enfoque"',
  '              scrimColorRgb="28,24,20"',
  '            />',
  '          )}',
  '          <div className="lu-velo" aria-hidden="true" />',
  '          <div className="lu-sangre-texto lu-sangre-texto--desk">',
  '            <p className="lu-kicker lu-kicker--claro">{kickerDelEvento}</p>',
  '            <h1 className="lu-nombres lu-nombres--sangre">',
  '              <span>{nombre1}</span>',
  '              {nombre2 && <span className="lu-amp lu-amp--claro">&amp;</span>}',
  '              {nombre2 && <span>{nombre2}</span>}',
  '            </h1>',
  '            <div className="lu-filete-corto lu-filete-corto--claro" aria-hidden="true" />',
  '            <p className="lu-dato lu-dato--claro">{fechaLarga}</p>',
  '            {ciudad && <p className="lu-dato lu-dato--claro">{ciudad}</p>}',
  '            <div className="lu-nav-escritorio lu-nav-escritorio--claro">',
].join("\n"), "columna de escritorio a sangre (apertura)");

rep([
  '              </nav>',
  '            </div>',
  '          </Hoja>',
  '        </aside>',
].join("\n"), [
  '              </nav>',
  '            </div>',
  '          </div>',
  '        </aside>',
].join("\n"), "columna de escritorio a sangre (cierre)");

// ── 6. La portada del celular, dentro del scroll ──────────────────────────
rep([
  '          <section className="hide-desktop lu-seccion lu-portada" data-sec="00">',
  '            <Hoja portada className={isCoverOpen ? "lu-portada--sube" : ""}>',
  '              <Entra>',
  '                <IconoLinea nombre={esXV ? "torta" : "anillos"} ancho={esXV ? "18%" : "22%"} tope={76} />',
  '                <p className="lu-kicker">{kickerDelEvento}</p>',
  '              </Entra>',
  '              <Entra retraso={120}>',
  '                <h1 className="lu-nombres">',
  '                  <span>{nombre1}</span>',
  '                  {nombre2 && <span className="lu-amp">&amp;</span>}',
  '                  {nombre2 && <span>{nombre2}</span>}',
  '                </h1>',
  '              </Entra>',
  '              <Entra retraso={240}>',
  '                <div className="lu-filete-corto" aria-hidden="true" />',
  '                <p className="lu-dato">{fechaLarga}</p>',
  '                {ciudad && <p className="lu-dato">{ciudad}</p>}',
  '                <AddToCalendarLink eventName={nombresLinea} targetDate={fechaEvento} location={[lugarNombre, direccion].filter(Boolean).join(", ")} className="lu-link" showIcon={false}>',
  '                  {tx("invitacion.saveTheDate.agregarAlCalendario")}',
  '                </AddToCalendarLink>',
  '              </Entra>',
  '            </Hoja>',
].join("\n"), [
  '          <section className={`hide-desktop lu-portada-sangre ${isCoverOpen ? "lu-portada--sube" : ""}`} data-sec="00">',
  '            {portadaFondoAnimado && (',
  '              <AnimatedCoverPhoto',
  '                photoSrc={portadaImagenFondoDesktopRaw as string}',
  '                tint={false}',
  '                effect="enfoque"',
  '                scrimColorRgb="28,24,20"',
  '              />',
  '            )}',
  '            <div className="lu-velo" aria-hidden="true" />',
  '            <div className="lu-sangre-texto">',
  '              <Entra>',
  '                <p className="lu-kicker lu-kicker--claro">{kickerDelEvento}</p>',
  '              </Entra>',
  '              <Entra retraso={120}>',
  '                <h1 className="lu-nombres lu-nombres--sangre">',
  '                  <span>{nombre1}</span>',
  '                  {nombre2 && <span className="lu-amp lu-amp--claro">&amp;</span>}',
  '                  {nombre2 && <span>{nombre2}</span>}',
  '                </h1>',
  '              </Entra>',
  '              <Entra retraso={240}>',
  '                <div className="lu-filete-corto lu-filete-corto--claro" aria-hidden="true" />',
  '                <p className="lu-dato lu-dato--claro">{fechaLarga}</p>',
  '                {ciudad && <p className="lu-dato lu-dato--claro">{ciudad}</p>}',
  '                <AddToCalendarLink eventName={nombresLinea} targetDate={fechaEvento} location={[lugarNombre, direccion].filter(Boolean).join(", ")} className="lu-link lu-link--claro" showIcon={false}>',
  '                  {tx("invitacion.saveTheDate.agregarAlCalendario")}',
  '                </AddToCalendarLink>',
  '              </Entra>',
  '            </div>',
].join("\n"), "portada del celular a sangre");

// ── 7. El vestuario de la portada a sangre ────────────────────────────────
rep("  /* Splash */", [
  "  /* La portada a sangre: la foto tapa la pantalla y el velo la hace legible.",
  "     Sin foto cargada el velo cae sobre el papel prensado, así que la portada",
  "     sigue siendo una portada y no un rectángulo vacío. */",
  "  .lu-portada-sangre { position: relative; min-height: 100dvh; display: flex; align-items: flex-end; overflow: hidden;",
  "    background-color: #6E6257; background-image: repeating-linear-gradient(135deg, rgba(255,255,255,.10) 0 1px, transparent 1px 8px); }",
  "  .lu-izquierda--sangre { position: relative; overflow: hidden; padding: 0 !important; align-items: flex-end !important; justify-content: center !important;",
  "    background-color: #6E6257 !important; background-image: repeating-linear-gradient(135deg, rgba(255,255,255,.10) 0 1px, transparent 1px 8px) !important; }",
  "  .lu-velo { position: absolute; inset: 0; pointer-events: none; z-index: 1;",
  "    background: linear-gradient(180deg, rgba(28,24,20,.15) 0%, rgba(28,24,20,.20) 45%, rgba(28,24,20,.78) 100%); }",
  "  .lu-velo--splash { background: linear-gradient(180deg, rgba(28,24,20,.25) 0%, rgba(28,24,20,.35) 40%, rgba(28,24,20,.80) 100%); }",
  "  .lu-sangre-texto { position: relative; z-index: 2; width: 100%; padding: 0 26px 34px; text-align: center; }",
  "  .lu-sangre-texto--desk { padding: 0 34px 34px; }",
  "  .lu-kicker--claro, .lu-dato--claro { color: #FFFFFF; }",
  "  .lu-filete-corto--claro { background: rgba(255,255,255,.8); }",
  "  .lu-link--claro { color: #FFFFFF; border-bottom-color: rgba(255,255,255,.7); }",
  "  .lu-amp--claro { color: rgba(255,255,255,.9); font-family: ${SERIF}; font-weight: 300; font-size: 28px; }",
  "  .lu-nombres--sangre { font-family: ${SCRIPT}; font-weight: 400; font-size: 44px; line-height: 1.12; color: #FFFFFF; text-shadow: none; margin: 0 auto 2px; max-width: 88%; }",
  "  .desktop-stage .lu-nombres--sangre { font-size: 66px; line-height: 1.02; }",
  "  .lu-nav-escritorio--claro a { color: rgba(255,255,255,.72); }",
  "  .lu-nav-escritorio--claro a:hover { color: #FFFFFF; }",
  "  .lu-btn-claro { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 26px; background: #FFFFFF; color: #1C1814;",
  "    border: none; font-family: ${SANS}; font-weight: 400; font-size: 11.5px; letter-spacing: .24em; text-transform: uppercase; cursor: pointer; }",
  "",
  "  /* Splash */",
].join("\n"), "CSS de la portada a sangre");

rep(
  "  .lu-splash { position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 16px 3%;",
  "  .lu-splash { position: fixed; inset: 0; z-index: 99999; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; padding: 0;",
  "splash a pantalla completa"
);

rep(
  "  .lu-splash-nombre { font-family: ${SCRIPT}; font-weight: 400; font-size: 56px; line-height: 1.06; color: ${TINTA}; margin: 2px 0 4px; }",
  "  .lu-splash-nombre { font-family: ${SCRIPT}; font-weight: 400; font-size: 62px; line-height: 1.04; color: #FFFFFF; margin: 2px 0 4px; }",
  "nombre del splash"
);

rep(
  ".lu-raiz .lu-splash-nombre, .lu-raiz .lu-sinonimo {",
  ".lu-raiz .lu-splash-nombre, .lu-raiz .lu-sinonimo, .lu-raiz .lu-nombres--sangre {",
  "script en los nombres a sangre"
);

if (faltantes.length) {
  console.error("No encontré estos anclajes en PrensaTemplate.tsx (¿cambió?):\n  - " + faltantes.join("\n  - "));
  process.exit(1);
}

fs.writeFileSync(path.join(DIR, "LumbreTemplate.tsx"), s);
console.log("LumbreTemplate.tsx (" + (s.length / 1024).toFixed(0) + " KB) derivado de PrensaTemplate.tsx");
