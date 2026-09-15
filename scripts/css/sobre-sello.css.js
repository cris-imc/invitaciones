// ─── El registro de Papelería Viva, en CSS ──────────────────────────────────
// Lo escribe scripts/derivar-sobre-sello.js dentro de la plantilla. Vive
// aparte porque es la identidad entera de la sub-colección y así se lee de
// corrido, sin el ruido del script que lo inserta.
const CSS_SOBRE = `
  .ss-raiz { position: relative; color: ${TINTA}; font-family: ${SANS}; background: ${PAPEL}; }
  .ss-fondo { position: fixed; inset: 0; z-index: 0; pointer-events: none; background-color: ${PAPEL}; }
  .ss-escenario { position: relative; z-index: 1; background: transparent !important; }
  .ss-escenario.desktop-stage { background: transparent; }
  .ss-derecha { background: transparent; }
  .desktop-stage.ss-escenario .d-left.ss-izquierda { background: transparent; padding: 26px 22px; align-items: center; justify-content: center; }
  .ss-hoja-grande { width: 94%; aspect-ratio: 301/432; padding: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; text-align: center; overflow: hidden; }
  .ss-hoja-grande .ss-nombres { font-size: 44px; }
  .ss-nav-escritorio { margin-top: 18px; width: 100%; padding-bottom: 22px; }
  .ss-nav-lista { display: flex; flex-direction: column; align-items: center; gap: 2px; margin-top: 12px; }
  .ss-nav-lista a { background: none; border: none; padding: 5px 2px; font-family: ${SANS}; font-weight: 400; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: ${TINTA_SUAVE}; text-decoration: none; }
  .ss-nav-lista a:hover { color: ${ACENTO}; }

  /* La tarjeta: papel, un filete fino y la esquina doblada. Sin troquel ni
     relieve -- eso es de la otra sub-colección. */
  .ss-hoja { position: relative; padding: 26px 22px 24px; text-align: center; background: ${PAPEL};
    border: 1px solid rgba(0,0,0,.08); overflow: hidden; }
  .desktop-stage .ss-hoja { padding: 34px 40px 30px; }
  .ss-hoja::after { content: ""; position: absolute; right: 0; top: 0; width: 16px; height: 16px;
    background: linear-gradient(225deg, ${PAPEL2} 50%, rgba(0,0,0,.10) 50%); pointer-events: none; }
  .ss-filete { display: none; }
  /* La portada del celular no es una hoja con proporción de tarjeta: es un
     sobre que llena la pantalla, con el papel asomando abajo. Con la
     proporción 301:432 de Papel Prensado el sobre quedaba de 72 px y los
     nombres se salían por el borde. */
  .ss-hoja--portada { aspect-ratio: auto; min-height: min(86vh, 806px); display: flex; flex-direction: column;
    align-items: center; justify-content: flex-end; padding: 0; border: none; }
  .ss-hoja--portada::after { display: none; }
  .ss-seccion { position: relative; padding: 14px 3%; }
  .ss-seccion:nth-of-type(even) { background: ${PAPEL2}; }
  .ss-portada { padding: 0; }
  .ss-portada--sube { animation: ssPortadaSube .9s cubic-bezier(.22,.61,.36,1) both; }

  /* El sobre de la portada. */
  /* El papel que asoma abajo ocupa el 24 % de la portada (196 de 806 px en el
     mockup). Va en porcentaje y no en píxeles porque la misma portada se
     dibuja a 806 px en el celular y a la altura de la tarjeta en escritorio. */
  .ss-sobre { position: absolute; left: 0; right: 0; top: 0; bottom: 24%; overflow: hidden; pointer-events: none; }
  .ss-sobre-forro { position: absolute; inset: 0;
    background: repeating-linear-gradient(135deg, ${matiz(PAPEL2, -8)} 0 7px, ${matiz(PAPEL2, -14)} 7px 14px); }
  .ss-sobre-brillo { position: absolute; top: 0; bottom: 0; width: 130px; left: -130px;
    background: linear-gradient(90deg, transparent, rgba(255,244,228,.6), transparent); animation: ssBrillo 9s ease-in-out infinite; }
  .ss-sobre-filete { position: absolute; left: 18px; right: 18px; top: 18px; bottom: 18px; border: 1px solid rgba(244,235,226,.8); }
  .ss-sobre-filete--interno { left: 25px; right: 25px; top: 25px; bottom: 25px; border-color: rgba(244,235,226,.4); }
  /* Lo que va sobre el papel que asoma abajo del sobre: el saludo, los
     nombres y la fecha. Son bloques hermanos del sobre, así que cada uno se
     apoya en el papel y se pone por encima del forro. */
  .ss-hoja--portada > .ss-entra { position: relative; z-index: 1; align-self: stretch; box-sizing: border-box; background: ${PAPEL}; padding: 0 22px; }
  .ss-hoja--portada > .ss-entra:first-of-type { padding-top: 24px; }
  .ss-hoja--portada > .ss-entra:last-of-type { padding-bottom: 26px; }

  /* La cabecera de cada sección: el nombre, un filete que llega al borde y
     un punto dorado que lo cierra. */
  .ss-cabecera { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
  .ss-cabecera .ss-kicker { margin: 0; flex-shrink: 0; }
  .ss-cabecera-filete { flex: 1; height: 1px; background: ${ACENTO2}; opacity: .5; }
  .ss-cabecera-punto { width: 4px; height: 4px; border-radius: 50%; background: ${ACENTO2}; flex-shrink: 0; }

  /* Tipos */
  .ss-kicker { font-family: ${SANS}; font-weight: 400; font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: ${ACENTO}; margin: 0 0 10px; }
  .ss-dato { font-family: ${SANS}; font-weight: 400; font-size: 11px; letter-spacing: .3em; text-transform: uppercase; color: ${TINTA_SUAVE}; margin: 0 0 8px; }
  .ss-cuerpo { font-family: ${SANS}; font-weight: 300; font-size: 14px; line-height: 1.7; color: ${TINTA_SUAVE}; margin: 0 auto 16px; max-width: 46ch; }
  .ss-num { display: none; }
  .ss-titulo { font-family: ${SERIF}; font-weight: 300; font-size: 30px; line-height: 1.2; color: ${TINTA}; margin: 0 0 18px; letter-spacing: .04em; }
  .ss-script { font-family: ${SCRIPT}; font-weight: 400; font-size: 40px; line-height: 1.2; color: ${ACENTO}; margin: 0 0 8px; display: inline-block; }
  .ss-nombres { font-family: ${SERIF}; font-weight: 300; font-size: 42px; line-height: 1; letter-spacing: .07em; color: ${TINTA}; margin: 0;
    display: flex; flex-direction: column; align-items: center; text-transform: uppercase; }
  .ss-amp { font-family: ${SCRIPT}; font-weight: 400; font-size: 36px; line-height: .62; color: ${ACENTO}; text-transform: none; margin: 2px 0; }
  .ss-cifra { font-family: ${SERIF}; font-weight: 300; font-size: 62px; line-height: 1; color: ${TINTA}; margin: 4px 0 6px; }
  .ss-filete-corto { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 14px auto 16px; }
  .ss-filete-corto::before, .ss-filete-corto::after { content: ""; width: 46px; height: 1px; background: ${ACENTO2}; }
  .ss-hairline { height: 1px; background: rgba(0,0,0,.08); margin: 22px 0; }
  .ss-lugar { font-family: ${SERIF}; font-weight: 400; font-size: 26px; line-height: 1.2; color: ${TINTA}; margin: 0 0 8px; }
  .ss-link { display: inline-flex; align-items: center; min-height: 44px; font-family: ${SANS}; font-weight: 400; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: ${ACENTO}; border-bottom: 1px solid ${ACENTO2}; text-decoration: none; }
  .ss-btn-solido { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 26px; background: ${ACENTO}; color: ${PAPEL}; border: none; font-family: ${SANS}; font-weight: 400; font-size: 11.5px; letter-spacing: .24em; text-transform: uppercase; cursor: pointer; text-decoration: none; }
  .ss-btn-fantasma { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 22px; background: transparent; color: ${TINTA}; border: 1px solid ${ACENTO2}; font-family: ${SANS}; font-weight: 400; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; cursor: pointer; }
  .ss-frase-seccion { position: relative; padding: 64px 8%; text-align: center; background: ${PAPEL}; }
  .desktop-stage .ss-frase-seccion { padding: 76px 8%; }
  .ss-frase { font-family: ${SERIF}; font-weight: 300; font-style: italic; font-size: 27px; line-height: 1.45; color: ${TINTA}; margin: 0 auto 6px; max-width: 26ch; text-wrap: pretty; }
  .desktop-stage .ss-frase { font-size: 32px; }
  .ss-flota { animation: ssFlota 7s ease-in-out infinite; }

  /* La cabecera de cada sección: kicker, filete largo y un punto. */
  .ss-entra { opacity: 0; transform: translateY(14px);
    transition: opacity .9s cubic-bezier(.22,.61,.36,1), transform .9s cubic-bezier(.22,.61,.36,1); }
  .ss-entra--visto { opacity: 1; transform: none; }

  /* Cronograma */
  .ss-cronograma { position: relative; text-align: left; max-width: 380px; margin: 0 auto; }
  .ss-cronograma-eje { position: absolute; left: 74px; top: 10px; bottom: 10px; width: 1px; background: ${ACENTO2}; opacity: .45; }
  .ss-hito { display: flex; align-items: center; gap: 12px; padding: 11px 0; }
  .ss-hito-hora { font-family: ${SANS}; font-weight: 400; font-size: 12px; letter-spacing: .2em; color: ${TINTA_SUAVE}; width: 62px; text-align: right; flex-shrink: 0; }
  .ss-hito-punto { width: 4px; height: 4px; border-radius: 50%; background: ${ACENTO2}; flex-shrink: 0; }
  .ss-hito-titulo { font-family: ${SERIF}; font-weight: 400; font-size: 20px; color: ${TINTA}; }

  /* Cuenta regresiva: los días en un anillo que gira, el resto en cajitas. */
  .ss-cuenta { display: flex; flex-direction: column; align-items: center; gap: 22px; }
  .ss-cuenta-circulo { position: relative; width: 152px; height: 152px; display: flex; align-items: center; justify-content: center; text-align: center; }
  .ss-cuenta-anillo { position: absolute; inset: 0; border-radius: 50%; border: 1px solid ${ACENTO2};
    border-top-color: ${ACENTO}; border-right-color: transparent; animation: ssGira 60s linear infinite; }
  .ss-cuenta-dias { display: block; font-family: ${SERIF}; font-weight: 300; font-size: 62px; line-height: 1; color: ${TINTA}; font-variant-numeric: tabular-nums; }
  .ss-cuenta-grilla { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; max-width: 340px; }
  .ss-cuenta-caja { position: relative; background: ${PAPEL}; border: 1px solid rgba(0,0,0,.08); padding: 16px 8px 13px; text-align: center; overflow: hidden; }
  .ss-cuenta-caja::after { content: ""; position: absolute; right: 0; top: 0; width: 16px; height: 16px;
    background: linear-gradient(225deg, ${PAPEL2} 50%, rgba(0,0,0,.10) 50%); }
  .ss-cuenta-num { display: block; font-family: ${SERIF}; font-weight: 300; font-size: 32px; line-height: 1; color: ${TINTA}; font-variant-numeric: tabular-nums; }
  .ss-cuenta-etq { display: block; font-family: ${SANS}; font-weight: 400; font-size: 9px; letter-spacing: .26em; text-transform: uppercase; color: ${TINTA_SUAVE}; margin-top: 6px; }
  .ss-cuenta-aviso { text-align: center; }

  /* Mapa */
  .ss-mapa { height: 180px; display: flex; align-items: center; justify-content: center; overflow: hidden;
    background: ${PAPEL2}; border: 1px solid rgba(0,0,0,.08); margin-bottom: 18px; }
  .desktop-stage .ss-mapa { height: 250px; }

  /* Banco */
  .ss-banco-fila { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,.08); text-align: left; }
  .ss-banco-clave { display: block; font-family: ${SANS}; font-weight: 400; font-size: 9.5px; letter-spacing: .28em; text-transform: uppercase; color: ${ACENTO}; margin-bottom: 3px; }
  .ss-banco-valor { display: block; font-family: ${SANS}; font-weight: 300; font-size: 15px; color: ${TINTA}; overflow-wrap: anywhere; }
  .ss-hoja #banco .t-kicker, .ss-hoja h4 { font-family: ${SANS} !important; font-weight: 400 !important; font-size: 9.5px !important; letter-spacing: .28em !important; text-transform: uppercase !important; color: ${ACENTO} !important; }

  /* Quiz */
  .ss-quiz-opcion { display: block; width: 100%; max-width: 420px; margin: 0 auto 8px; min-height: 48px; padding: 12px 16px; cursor: pointer; text-align: left;
    font-family: ${SANS}; font-weight: 300; font-size: 15px; color: ${TINTA}; background: ${PAPEL}; border: 1px solid rgba(0,0,0,.08); transition: background .2s ease, color .2s ease, border-color .2s ease; }
  .ss-quiz-opcion[data-elegida] { background: ${ACENTO}; border-color: ${ACENTO}; color: ${PAPEL}; }
  .ss-quiz-opcion:disabled { cursor: default; }

  /* Monograma */
  .ss-monograma { position: relative; width: 78px; height: 78px; display: flex; align-items: center; justify-content: center; margin: 6px auto 18px;
    border: 1px solid ${ACENTO2}; border-radius: 50%; }
  .ss-monograma svg { display: none; }
  .ss-monograma span { position: relative; font-family: ${SERIF}; font-weight: 300; font-size: 22px; letter-spacing: .18em; color: ${ACENTO}; }

  /* Splash */
  .ss-splash { position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 16px 3%; background: ${PAPEL}; }
  .ss-splash--sale { animation: ssSplashSale .9s ease both; }
  .ss-splash-hoja { position: relative; width: 100%; max-width: 340px; aspect-ratio: 301/432; padding: 40px 28px 34px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .ss-splash-nombre { font-family: ${SCRIPT}; font-weight: 400; font-size: 52px; line-height: 1.1; color: ${ACENTO}; margin: 2px 0 4px; }
  @keyframes ssSplashSale { from { opacity: 1; } to { opacity: 0; } }
  @keyframes ssPortadaSube { from { transform: translateY(24px); } to { transform: translateY(0); } }
  @keyframes ssPrensado { from { transform: scale(.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes ssGira { to { transform: rotate(360deg); } }
  @keyframes ssFlota { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  @keyframes ssBrillo { 0% { left: -130px; } 60%, 100% { left: 120%; } }

  /* Pase (burbuja arriba) */
  .ss-pase-burbuja { position: fixed; top: 12px; left: 50%; transform: translateX(-50%); z-index: 99999; cursor: pointer; padding: 8px 14px;
    background: ${PAPEL}; border: 1px solid ${ACENTO2}; box-shadow: 0 2px 10px rgba(${SH},.16); transition: all .5s ease; }
  .ss-pase-burbuja--abierta { width: calc(100% - 32px); max-width: 360px; padding: 12px 16px; }

  /* Pastilla inferior */
  .ss-pastilla { transition: opacity .35s ease, transform .35s cubic-bezier(.22,.61,.36,1); }
  .ss-pastilla--oculta { opacity: 0; transform: translateY(26px); transition: opacity .3s ease, transform .3s cubic-bezier(.22,.61,.36,1); pointer-events: none; }
  .ss-raiz .bottom-nav, .desktop-stage.ss-escenario .bottom-nav { border-radius: 0 !important; background: ${PAPEL} !important; border: 1px solid ${ACENTO2} !important;
    box-shadow: 0 2px 10px rgba(${SH},.16) !important; backdrop-filter: none !important; padding: 5px !important; gap: 2px !important; }
  .ss-raiz .bottom-nav a { color: ${TINTA} !important; opacity: .55 !important; min-height: 48px; }
  .ss-raiz .bottom-nav a[aria-current="true"] { opacity: 1 !important; background: ${PAPEL2}; color: ${ACENTO} !important; }

  /* Componentes compartidos, vestidos con el registro */
  .ss-raiz .tpl h2, .ss-raiz .tpl h3, .ss-raiz .tpl h4 { font-family: ${SERIF}; color: ${TINTA}; }
  .ss-raiz .ss-script, .ss-raiz .ss-amp, .ss-raiz .ss-splash-nombre, .ss-raiz .ss-sinonimo { font-family: ${SCRIPT} !important; font-weight: 400 !important; font-style: normal !important; }
  .ss-raiz .tpl .t-kicker, .ss-raiz .tpl p.kicker { font-family: ${SANS} !important; color: ${ACENTO} !important; font-size: 10px !important; font-weight: 400 !important; letter-spacing: .28em !important; text-transform: uppercase !important; display: block; }
  .ss-raiz .tpl .t-kicker::before, .ss-raiz .tpl p.kicker::before { display: none !important; }
  .ss-raiz .tpl div:not(#countdown div), .ss-raiz .tpl section, .ss-raiz .tpl button, .ss-raiz .tpl input, .ss-raiz .tpl iframe, .ss-raiz .tpl .t-btn, .ss-raiz .tpl .album-btn { border-radius: 0 !important; }
  .ss-raiz .tpl .album-item { border-radius: 0 !important; border: 8px solid ${PAPEL}; border-bottom-width: 22px; background: ${PAPEL}; box-shadow: 0 2px 10px rgba(${SH},.16); }
  .ss-raiz .tpl .album-btn { color: ${ACENTO} !important; border: 1px solid ${ACENTO2} !important; background: transparent !important; }
  .ss-raiz .tpl .cascade-frame { box-shadow: 0 2px 10px rgba(${SH},.16) !important; background: ${PAPEL} !important; }

  /* Los íconos de los componentes compartidos no entran: el dibujo de esta
     sub-colección son los doodles pintados. */
  .ss-raiz #songs svg.lucide, .ss-raiz #rsvp svg.lucide, .ss-raiz .ia-icon-box svg.lucide { display: none !important; }
  .ss-raiz .ia-icon-box { display: none !important; }

  .ss-raiz #rsvp.section.dark { background: transparent !important; color: ${TINTA} !important; border: none !important; padding: 0 !important; display: flex; flex-direction: column; align-items: center; }
  .ss-raiz #rsvp.section.dark > p.t-kicker, .ss-raiz #rsvp.section.dark > h2, .ss-raiz #rsvp.section.dark > .d-rsvp-grid { width: 100% !important; max-width: 420px !important; text-align: left !important; }
  .ss-raiz #rsvp.section.dark h2 { display: none !important; }
  .ss-raiz #rsvp.section.dark b, .ss-raiz #rsvp.section.dark strong { color: ${TINTA} !important; }
  .ss-raiz #rsvp.section.dark label { text-transform: uppercase !important; font-size: 9.5px !important; font-family: ${SANS} !important; letter-spacing: .28em !important; color: ${ACENTO} !important; font-weight: 400 !important; }
  .ss-raiz #rsvp.section.dark input { background: ${PAPEL} !important; color: ${TINTA} !important; border: 1px solid rgba(0,0,0,.08) !important; border-radius: 0 !important; padding: 12px 14px !important; font-family: ${SANS} !important; font-weight: 300 !important; font-size: 15px !important; min-height: 48px; }
  .ss-raiz #rsvp.section.dark input::placeholder { color: ${TINTA_SUAVE} !important; opacity: .8 !important; }
  .ss-raiz #rsvp.section.dark .t-btn { border-radius: 0 !important; min-height: 48px; padding: 0 22px !important; flex: 1 !important; min-width: 130px !important; background: transparent !important; color: ${TINTA} !important; border: 1px solid ${ACENTO2} !important; font-family: ${SANS} !important; font-weight: 400 !important; text-transform: uppercase !important; letter-spacing: .24em !important; font-size: 11.5px !important; }
  .ss-raiz #rsvp.section.dark .t-btn.solid, .ss-raiz #rsvp.section.dark button[data-rsvp="confirmar"] { background: ${ACENTO} !important; color: ${PAPEL} !important; border-color: ${ACENTO} !important; }
  .ss-raiz #rsvp.section.dark div:has(> button[data-rsvp="confirmar"]) { flex-direction: row !important; gap: 12px !important; }
  .ss-raiz .tpl .d-rsvp-grid { display: flex !important; flex-direction: column !important; gap: 24px !important; align-items: flex-start !important; }
  .ss-raiz .tpl .d-rsvp-grid > div { width: 100% !important; }
  .ss-raiz #rsvp.section.dark .t-detail { background: transparent !important; border: none !important; border-top: 1px solid rgba(0,0,0,.08) !important; padding: 16px 0 0 !important; text-align: left !important; box-shadow: none !important; width: 100% !important; }
  .ss-raiz #rsvp.section.dark .t-detail h4 { color: ${ACENTO} !important; font-family: ${SANS} !important; text-transform: uppercase !important; font-size: 9.5px !important; letter-spacing: .28em !important; font-weight: 400 !important; margin-bottom: 6px !important; }
  .ss-raiz #rsvp.section.dark .t-detail p { color: ${TINTA_SUAVE} !important; font-size: 14px !important; }
  .ss-raiz #rsvp.section.dark .t-detail p b { font-family: ${SERIF} !important; font-weight: 300 !important; font-size: 26px !important; color: ${TINTA} !important; }
  /* Confirmado: la caligrafía de la familia, no un relieve. */
  .ss-raiz #rsvp.section.dark [class*="confirm"] h3, .ss-raiz #rsvp.section.dark h3 { font-family: ${SCRIPT} !important; font-weight: 400 !important; font-size: 46px !important; line-height: 1.1 !important; color: ${ACENTO} !important;
    animation: ssPrensado .5s cubic-bezier(.22,.61,.36,1) both; }

  .ss-raiz #songs.d-sec.dark, .ss-raiz #songs { background: transparent !important; padding: 0 !important; display: flex; flex-direction: column; align-items: center; color: ${TINTA}; }
  .ss-raiz #songs > p.t-kicker, .ss-raiz #songs > form, .ss-raiz #songs > div { width: 100% !important; max-width: 420px !important; text-align: left !important; }
  .ss-raiz #songs h2, .ss-raiz #songs p:not(.t-kicker) { font-family: ${SANS}; color: ${TINTA}; }
  .ss-raiz #songs .mod-input-row { display: flex !important; flex-direction: column !important; gap: 0 !important; width: 100% !important; }
  .ss-raiz #songs input { background: ${PAPEL} !important; color: ${TINTA} !important; border: 1px solid rgba(0,0,0,.08) !important; border-radius: 0 !important; min-height: 48px; padding: 0 14px !important; font-family: ${SANS} !important; font-weight: 300 !important; font-size: 15px !important; }
  .ss-raiz #songs button[type="submit"], .ss-raiz #songs .t-btn { background: ${ACENTO} !important; color: ${PAPEL} !important; border: none !important; border-radius: 0 !important; min-height: 48px; font-family: ${SANS} !important; font-weight: 400 !important; font-size: 11.5px !important; letter-spacing: .24em !important; text-transform: uppercase !important; }
  .ss-raiz #songs .mod-item, .ss-raiz #songs li { background: transparent !important; border: none !important; border-bottom: 1px solid rgba(0,0,0,.08) !important; border-radius: 0 !important; }

  .ss-raiz #info-adicional { background: transparent !important; }
  .ss-raiz #ia-trigger-btn { background: transparent !important; color: ${ACENTO} !important; border: 1px solid ${ACENTO2} !important; border-radius: 0 !important; font-family: ${SANS} !important; letter-spacing: .24em !important; text-transform: uppercase !important; font-size: 11px !important; }

  .ss-raiz .copy-btn { background: transparent !important; color: ${ACENTO} !important; border: 1px solid ${ACENTO2} !important; border-radius: 0 !important; font-family: ${SANS} !important; font-weight: 400 !important; font-size: 10px !important; letter-spacing: .24em !important; text-transform: uppercase !important; }
  .ss-raiz .copy-btn.copied { background: ${ACENTO} !important; color: ${PAPEL} !important; }

  /* Post-evento */
  .ss-post { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; padding: 48px 3% 24px; min-height: 100dvh; display: flex; align-items: center; }
  .ss-post-hoja { width: 100%; padding: 44px 30px 38px; }
  .ss-sinonimo { font-family: ${SCRIPT}; font-weight: 400; font-style: normal; color: ${ACENTO}; }

  @media (prefers-reduced-motion: reduce) {
    .ss-entra { opacity: 1; transform: none; transition: none; }
    .ss-splash--sale, .ss-portada--sube, .ss-flota, .ss-cuenta-anillo, .ss-sobre-brillo { animation: none; }
    .ss-pastilla, .ss-pastilla--oculta { transition: none; opacity: 1; transform: none; pointer-events: auto; }
  }
`;
