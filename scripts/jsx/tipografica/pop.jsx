  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre como título de cómic: dos renglones enormes, el segundo en el
  // amarillo y sangrado. Con una sola persona el nombre se parte en dos
  // (VALEN / TINA, como en el mockup); con dos, uno por renglón.
  const partirNombre = (n: string): [string, string] => {
    const limpio = n.trim();
    const partes = limpio.split(/\s+/);
    if (partes.length > 1) return [partes[0], partes.slice(1).join(" ")];
    const corte = Math.ceil(limpio.length / 2);
    return [limpio.slice(0, corte), limpio.slice(corte)];
  };
  const renglones: [string, string] = saludaAlInvitado ? partirNombre(nombreInvitado) : nombre2 ? [nombre1, nombre2] : partirNombre(nombre1);
  const renglonMasLargo = Math.max(4, ...renglones.map((n) => n.length));
  const totalLetras = Math.max(1, renglones.join("").replace(/\s/g, "").length);

  // La frase: el medio sobre un bloque amarillo y el cierre sobre el acento
  // con letras blancas.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.75)) return "pop-bloque-acento";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "pop-bloque-amarillo";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const esXV = invitation.tipo === "QUINCE_ANOS";
  const centroDelSello = esXV ? "XV" : nombre2 ? "&" : (nombre1.trim()[0] || "").toUpperCase();
  const firma = esXV ? nombre1.trim().split(/\s+/)[0].toUpperCase() : iniciales(nombre1, nombre2);
  // Los doce íconos del ticker de la tapa (corona, estrella, corazón, rayo,
  // nota, globo, taco, cámara, disco, cinta, copa, XV).
  const ICONOS = [
    "M27 8 L32 22 L47 22 L35 31 L40 46 L27 37 L14 46 L19 31 L7 22 L22 22 Z",
    "M8 40 L12 16 L22 28 L27 10 L32 28 L42 16 L46 40 Z M8 40 L46 40",
    "M27 46 C10 34 6 24 12 16 C18 10 25 13 27 19 C29 13 36 10 42 16 C48 24 44 34 27 46 Z",
    "M31 6 L14 30 L26 30 L22 48 L40 22 L28 22 Z",
    "M20 42 a6 6 0 1 0 0.1 0 M20 42 L20 12 L40 8 L40 36 a6 6 0 1 0 0.1 0",
    "M27 8 a14 16 0 1 1 -0.1 0 M27 40 L24 50 M27 40 L30 50",
    "M6 38 Q27 8 48 38 Z M14 38 L40 38",
    "M8 18 L46 18 L46 44 L8 44 Z M20 18 L24 10 L30 10 L34 18 M27 31 a6 6 0 1 0 0.1 0",
    "M27 27 a19 19 0 1 0 0.1 0 M27 27 a5 5 0 1 0 0.1 0",
    "M6 22 L48 22 L48 34 L6 34 Z M6 22 L10 14 L44 14 L48 22 M14 22 L14 34 M40 22 L40 34",
    "M14 8 L40 8 L36 24 Q27 32 18 24 Z M27 30 L27 44 M18 46 L36 46",
    "M8 12 L20 42 L27 24 L34 42 L46 12 M10 42 L26 12 L38 42",
  ];

  return (
    <div
      ref={raizRef}
      className={`${popSerif.variable} ${popSans.variable} pop-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_POP}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="pop-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            Inversión: el acento entero con la trama negra arriba, la
            fecha en Bangers con sombras planas y la foto torcida con el
            sticker "¡Guardala!". */}
        <section data-tone="dark" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="pop-section pop-std">
          <span className="pop-trama pop-trama--std" aria-hidden="true" />
          <div className="pop-spread">
            <div className="pop-pagina">
              <div className="pop-folio pop-folio--tinta">
                <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
                <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
              </div>
              <div className="pop-fecha">
                <span data-xin="1" data-dist="-160" className="pop-fecha-linea pop-fecha-linea--dia">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="pop-fecha-linea pop-fecha-linea--mes">{mesLargo}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="pop-fecha-linea pop-fecha-linea--anio">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="pop-fecha-pie">
                <span>{diaSemana} · {hora} H</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="pop-pildora pop-pildora--crema"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} ↗
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="pop-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only pop-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="14,14,16" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only pop-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="14,14,16" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --pop-punto. */}
                <span className="pop-foto-revelado" aria-hidden="true" />
                <span className="pop-foto-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
                <span className="pop-sticker pop-sticker--guardala">{tx("invitacion.saveTheDate.guardala")}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            Cuatro viñetas de color torcidas entre dos marquesinas
            inclinadas con borde negro. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="pop-section pop-countdown">
          <div className="pop-folio pop-folio--suave">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="pop-marquesina pop-marquesina--amarilla" aria-hidden="true">
            <div className="pop-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.cuentaRegresiva.dias").toUpperCase()} ★ {tx("invitacion.cuentaRegresiva.horas").toUpperCase()} ★ {tx("invitacion.cuentaRegresiva.minutos").toUpperCase()} ★ {tx("invitacion.cuentaRegresiva.segundos").toUpperCase()} ★ {diaNum} {tx("invitacion.evento.de").toUpperCase()} {mesLargo.toUpperCase()} ★&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="pop-spread">
            <div className="pop-pagina pop-pagina--entera">
              <CuentaPop targetDate={fechaHora} />
            </div>
          </div>
          <div className="pop-marquesina pop-marquesina--acento pop-marquesina--contraria" aria-hidden="true">
            <div className="pop-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, `${hora} h`, dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            Globo de historieta sobre crema: la frase en Bangers adentro
            del globo, y la onomatopeya que tiembla al costado. */}
        {hayFrase && (
          <section data-tone="light" data-screen-label={tx("invitacion.frase.etiqueta")} className="pop-section pop-frase-seccion">
            <span className="pop-trama pop-trama--celeste" aria-hidden="true" />
            <div className="pop-folio pop-folio--gris">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.frase.unasPalabras").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="pop-spread">
              <div className="pop-globo">
                <h2 ref={fraseRef} className="pop-frase">
                  {palabras.map((p, i) => (
                    // El espacio va fuera del span: el motor pone cada palabra
                    // en inline-block y un espacio adentro se colapsa a cero.
                    <span key={i}>
                      <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                    </span>
                  ))}
                </h2>
                <span className="pop-globo-cola" aria-hidden="true" /><span className="pop-globo-cola pop-globo-cola--blanca" aria-hidden="true" />
              </div>
              <div data-xin="1" data-delay="900" data-dist="60" className="pop-boom">
                <span className="pop-boom-titulo">{tx("invitacion.saveTheDate.boom")}</span>
                <span className="pop-boom-texto">{tx("invitacion.frase.conAmor")} · {titulo}</span>
              </div>
            </div>
            <div className="pop-folio pop-folio--gris pop-folio--pie">
              <span>{titulo.toUpperCase()}{esXV ? " · XV" : ""}</span>
              <span className="pop-barra" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Un panel por lugar: negro, acento y amarillo, con el título en
            Bangers a dos colores y la ficha blanca con borde negro. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="pop-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="pop-pan-fijo">
            <div data-strip="1" className="pop-tira">
              <div data-tone="dark" className="pop-panel pop-panel--negro">
                <div className="pop-folio">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="pop-spread">
                  <h2 className="pop-panel-titulo">
                    {(lugarNombre || tx("invitacion.ubicacion.elLugar")).split(" ")[0]}<br /><span className="pop-panel-sub">{(lugarNombre || "").split(" ").slice(1).join(" ") || ciudad}</span>
                  </h2>
                  <div className="pop-ficha">
                    <div className="pop-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="pop-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="pop-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="pop-cta">
                        {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}<span>→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="pop-folio pop-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="pop-panel pop-panel--acento">
                  <div className="pop-folio">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="pop-spread">
                    <h2 className="pop-panel-titulo">
                      {(ceremoniaNombre || ceremoniaTitulo).split(" ")[0]}<br /><span className="pop-panel-sub">{(ceremoniaNombre || "").split(" ").slice(1).join(" ") || ceremoniaTitulo}</span>
                    </h2>
                    <div className="pop-ficha">
                      {ceremoniaHora && <div className="pop-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="pop-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="pop-folio pop-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="dark" className="pop-panel pop-panel--negro pop-panel--celeste-sub">
                  <div className="pop-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="pop-spread">
                    <h2 className="pop-panel-titulo">
                      {tx("invitacion.ubicacion.comoLlegar").split(" ")[0]}<br /><span className="pop-panel-sub">{tx("invitacion.ubicacion.comoLlegar").split(" ").slice(1).join(" ")}</span>
                    </h2>
                    <div className="pop-ficha">
                      {embedMapUrl && (
                        <div className="pop-mapa">
                          <iframe
                            src={embedMapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0, display: "block" }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={tx("invitacion.ubicacion.tituloMapa", { lugar: lugarNombre })}
                          />
                        </div>
                      )}
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="pop-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas").toUpperCase()}<span>→</span>
                      </a>
                    </div>
                  </div>
                  <div className="pop-folio pop-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="light" className="pop-panel pop-panel--amarillo">
                  <div className="pop-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="pop-spread">
                    <h2 className="pop-panel-titulo">
                      {tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0].split(" ")[0]}<br /><span className="pop-panel-sub">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0].split(" ").slice(1).join(" ")}</span>
                    </h2>
                    <div className="pop-ficha">
                      {cronograma.map((item, i) => (
                        <div key={i} className="pop-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="pop-folio pop-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            El cupón: pliego amarillo, la tarjeta blanca con tijeras y
            línea de corte, botones píldora y la estrella "¡SÍ!". */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="light" data-screen-label={tx("invitacion.rsvp.confirmar")} className="pop-section pop-checkin">
            <span className="pop-trama pop-trama--checkin" aria-hidden="true" />
            <div className="pop-folio pop-folio--tinta">
              <span data-xin="1" data-dist="-40">{nCheckin} — CHECK-IN</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="pop-spread">
              <div className="pop-pagina">
                <h2 data-xin="1" data-dist="-80" className="pop-h2 pop-h2--sombra-blanca">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><span className="pop-acento-trazo">{tx("invitacion.rsvp.confirmaLinea2")}</span>
                </h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="pop-cupon">
                <span className="pop-corte" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M8.5 7.5 L20 18 M8.5 16.5 L20 6" /></svg>
                  <span />
                </span>
                <CheckinPop
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado}
                  pase={pase}
                  maxAdultos={guest?.expectedAdults ?? guest?.expectedCount ?? 1}
                  maxAdolescentes={guest?.expectedTeens ?? 0}
                  maxNinos={guest?.expectedChildren ?? 0}
                  estadoInicial={estadoInvitado}
                  adultosIniciales={guest?.attendingAdults}
                  adolescentesIniciales={guest?.attendingTeens}
                  ninosIniciales={guest?.attendingChildren}
                  restricciones={guest?.dietaryRestrictions ?? ""}
                  hayPago={pagoHabilitado}
                  monto={montoPago}
                  precioNino={invitation.precioNino ? Number(invitation.precioNino) : undefined}
                  precioAdolescente={invitation.precioAdolescente ? Number(invitation.precioAdolescente) : undefined}
                  exento={guest?.isExempt ?? false}
                  estadoDePago={guest?.paymentStatus ?? "PENDING"}
                  vistaDePago={guest?.paymentView ?? null}
                  confirmado={confirmado}
                  tarjetaRef={tarjetaCheckinRef}
                  selloRef={selloRef}
                  petalosRef={petalosRef}
                  estadoRef={estadoRef}
                  alConfirmar={alConfirmar}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 06 Álbum ───────────────────────────────────────────────────
            Hoja de contactos con las fotos en marco negro, esquinas
            redondas, sombra plana y apenas torcidas. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="pop-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="pop-pan-fijo pop-pan-fijo--album">
              <div data-strip="1" className="pop-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`pop-panel pop-panel--album${iHoja % 2 === 1 ? " pop-panel--album-b" : ""}`}>
                    <div className="pop-folio pop-folio--gris">
                      <span>{nAlbum} — {tx("invitacion.album.titulo").toUpperCase()}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="pop-h2 pop-h2--album">{tx("invitacion.album.titulo")} <span className="pop-acento-trazo">{tx("invitacion.album.deFotos")}</span></h2>
                    <div className="pop-hoja" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="pop-foto-hoja"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="pop-foto-hoja-img" />
                          <span data-colorwash="1" className={`pop-bano pop-bano--${(i % 5) + 1}`} aria-hidden="true" />
                          <span className="pop-foto-hoja-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pop-folio pop-folio--gris pop-folio--pie">
                      <span>{tx("invitacion.album.fotosSubidas", { n: todasLasFotos.length }).toUpperCase()}</span>
                      {!scrollVertical && hojasDeFotos.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                    </div>
                  </div>
                ))}
              </div>
              {!scrollVertical && hojasDeFotos.length > 1 && <Puntos cantidad={hojasDeFotos.length} />}
            </div>
          </div>
        )}

        {/* ── 07 Música ──────────────────────────────────────────────────
            El jukebox: pliego celeste, ecualizador de barras gordas y la
            lista en fichas blancas con borde. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="pop-section pop-musica">
            <span className="pop-trama pop-trama--musica" aria-hidden="true" />
            <div className="pop-folio pop-folio--tinta">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.musica.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="pop-spread">
              <div className="pop-pagina">
                <h2 data-xin="1" data-dist="-80" className="pop-h2 pop-h2--sombra-blanca">
                  {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "pop-acento-trazo")}
                </h2>
                <div data-xin="1" data-delay="120" className="pop-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              </div>
              <div className="pop-pagina">
                <CancionesPop
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Sobre negro, fichas blancas con sombra de color. */}
        {hayRegalos && (
          <section id="banco" data-tone="dark" data-screen-label={tx("invitacion.regalos.titulo")} className="pop-section pop-regalos">
            <div className="pop-folio pop-folio--suave">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="pop-spread">
              <div className="pop-pagina">
                <h2 data-xin="1" data-dist="-80" className="pop-h2 pop-h2--sombra-acento">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><span className="pop-amarillo">{tx("invitacion.regalos.siQueresLinea2")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="pop-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="pop-pagina">
                {regaloHabilitado && (
                  <TarjetaBancaria
                    titulo={String(invitation.regaloTitulo || tx("invitacion.regalos.tituloEvento"))}
                    alias={String(invitation.regaloAlias || "")}
                    cbu={String(invitation.regaloCbu || "")}
                    banco={String(invitation.regaloBanco || "")}
                    titular={String(invitation.regaloTitular || "")}
                    retraso={160}
                  />
                )}
                {pagoTarjetaHabilitado && (
                  <TarjetaBancaria
                    titulo={String(invitation.pagoTarjetaTitulo || tx("invitacion.regalos.pagoTarjetas"))}
                    mensaje={String(invitation.pagoTarjetaMensaje || "")}
                    alias={String(invitation.pagoTarjetaAlias || "")}
                    cbu={String(invitation.pagoTarjetaCbu || "")}
                    banco={String(invitation.pagoTarjetaBanco || "")}
                    titular={String(invitation.pagoTarjetaTitular || "")}
                    retraso={240}
                    inclinada
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── 09 Trivia ──────────────────────────────────────────────────
            Sobre crema: la etiqueta torcida, la pregunta en Bangers con
            sombra amarilla y las opciones con borde y sombra. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="light" data-screen-label="Quiz" className="pop-section pop-quiz">
            <div className="pop-folio pop-folio--gris">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="pop-spread">
              <TriviaPop
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            La contratapa: pliego del acento, el QR torcido con borde
            negro, el pase gigante y la estrella con la mesa. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="pop-section pop-pase">
          <span className="pop-trama pop-trama--pase" aria-hidden="true" />
          <div className="pop-folio pop-folio--tinta">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="pop-spread">
            <div data-xin="1" data-dist="-60" className="pop-pagina pop-pagina--qr">
              <div className="pop-qr">
                <QrDeIngreso guest={guest as never} />
                <span className="pop-qr-etq">{tx("invitacion.pase.tuPase").toUpperCase()}</span>
              </div>
            </div>
            <div className="pop-pagina">
              <div data-xin="1" data-delay="100" className="pop-pase-cabeza">
                <div className="pop-pase-numero">
                  <span className="pop-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                <Estrella texto={`${(nombreInvitado || titulo).toUpperCase()} · ${lugaresDelPase} ${tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas").toUpperCase()}${guest?.mesas?.length ? ` · ${tx("invitacion.pase.tuMesa").toUpperCase()} ${guest.mesas[0]}` : ""} · `} centro={guest?.mesas?.[0] ?? pase.replace(/^0+/, "") ?? pase} amarilla />
              </div>
              <div data-xin="1" data-delay="160" className="pop-caja">
                <div className="pop-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="pop-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="pop-linea"><span>Sector · {tx("invitacion.pase.tuMesa")}</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="pop-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="pop-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="pop-pase-pie">
            <span className="pop-despedida">{tx("invitacion.saveTheDate.nosVemosEnLaPista")} — {firma}</span>
            <div className="pop-folio pop-folio--tinta pop-folio--colofon">
              <span className="pop-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.bg} /></span>
              <span className="pop-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="pop-riel">
        <span ref={rielTopRef} className="pop-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="pop-riel-linea">
          <span ref={rielBarraRef} className="pop-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="pop-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          Tapa de cómic: trama del acento arriba a la derecha, un ticker
          de íconos que pasa detrás del nombre, el nombre en Bangers con
          sombra plana y trazo, el globo con el mensaje y el botón
          píldora. Es la bienvenida: dice de quién es la fiesta, cuándo,
          dónde y para cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="pop-portada">
        <div ref={escenaPortadaRef} className="pop-portada-hoja">
          <span className="pop-trama pop-trama--tapa" aria-hidden="true" />
          <div className="pop-ticker" aria-hidden="true">
            <div className="pop-ticker-tira">
              {[...ICONOS, ...ICONOS].map((d, i) => (
                <svg key={i} width="54" height="54" viewBox="0 0 54 54" className={`pop-ticker-icono pop-ticker-icono--${i % 4}`}><path d={d} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /></svg>
              ))}
            </div>
          </div>

          <div data-cl="1" className="pop-tapa-cabecera">
            <span className="pop-sticker pop-sticker--evento">{kickerDelEvento.toUpperCase()}</span>
            <span className="pop-tapa-numero">Nº 00 / {String(totalPliegos).padStart(2, "0")}<br /><span className="pop-amarillo">{tx("invitacion.saveTheDate.edicionUnica")}</span></span>
          </div>

          <div data-cl="2" className="pop-tapa-centro">
            <div className="pop-tapa-fila">
              <span className="pop-tapa-kicker">{diaSemana} {diaNum} · {mesLargo} · {anio}</span>
              <Estrella texto={`${kickerDelEvento.toUpperCase()} · ${String(fechaEvento.getDate()).padStart(2, "0")} · ${String(fechaEvento.getMonth() + 1).padStart(2, "0")} · ${anio} · `} centro={centroDelSello} />
            </div>
            <h1 ref={cartelRef} className="pop-tapa-nombres" style={{ "--largo": renglonMasLargo, "--n": totalLetras } as React.CSSProperties}>
              <span className="pop-tapa-linea"><span data-pieza="1"><Letras texto={renglones[0].toUpperCase()} desde={0} /></span></span>
              {renglones[1] && (
                <span className="pop-tapa-linea pop-tapa-linea--sangra"><span data-pieza="1" className="pop-amarillo"><Letras texto={renglones[1].toUpperCase()} desde={renglones[0].replace(/\s/g, "").length} /></span></span>
              )}
            </h1>
            <div className="pop-tapa-datos">
              <span>{lugarNombre || "—"}<br /><span className="pop-suave">{[direccion, ciudad].filter(Boolean).join(" · ")}</span></span>
              <span className="pop-tapa-datos-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase")} Nº {pase}<br /><span className="pop-suave">{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</span></>
                  : <>{hora} h<br /><span className="pop-suave">{fechaPuntos}</span></>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="pop-tapa-pie">
            <div className="pop-globo pop-globo--tapa">
              <p className="pop-tapa-mensaje">
                {saludaAlInvitado
                  ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}, ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                  : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
              </p>
              <span className="pop-globo-cola" aria-hidden="true" /><span className="pop-globo-cola pop-globo-cola--crema" aria-hidden="true" />
            </div>
            <button type="button" onClick={abrir} className="pop-tapa-btn">
              <span>{tx("invitacion.portada.abrirInvitacion").toUpperCase()}</span><span>→</span>
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="pop-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="pop-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="pop-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="pop-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {musicaHabilitada && audioDeFondo}
      {montado && isPersonalized && guest && portadaAbierta && (
        <BurbujaPase acento={PALETA.acc} guest={guest} />
      )}
      {montado && musicaHabilitada && portadaAbierta && createPortal(
        <MusicToggleButton isPlaying={musicaSonando} onToggle={alternarMusica} className="fixed top-3 left-3 z-[99998]" />,
        document.body
      )}
    </div>
  );
}

/** "V & T": las iniciales de la despedida. */
function iniciales(a: string, b: string): string {
  const i = (s: string) => (s.trim()[0] || "").toUpperCase();
  return b ? `${i(a)} & ${i(b)}` : i(a);
}

/**
 * El nombre letra por letra: cada tanto una salta 18 px con un giro y
 * vuelve rebotando. El CSS escalona el turno de cada letra.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="pop-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
      )}
    </>
  );
}

/**
 * El sello estrella de doce puntas con el texto en arco, girando, y algo
 * en el centro (XV, el & o la mesa). En la tapa va en el acento; en el
 * pase, en amarillo.
 */
function Estrella({ texto, centro, amarilla = false }: { texto: string; centro: string; amarilla?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`pop-estrella${amarilla ? " pop-estrella--amarilla" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <defs><path id={`arc-${id}`} d="M50 50 m -35 0 a 35 35 0 1 1 70 0 a 35 35 0 1 1 -70 0" fill="none" /></defs>
        <path d="M50 3 L58 14 L71 8 L73 22 L87 24 L82 37 L94 45 L84 55 L91 68 L77 71 L76 85 L63 80 L55 92 L46 81 L33 87 L31 73 L17 71 L22 58 L10 50 L20 40 L13 27 L27 24 L28 10 L41 15 Z" className="pop-estrella-forma" strokeWidth="3" strokeLinejoin="round" />
        <text><textPath href={`#arc-${id}`}>{texto.repeat(3).slice(0, 46)}</textPath></text>
      </svg>
      <span className="pop-estrella-centro">{centro}</span>
    </div>
  );
}
