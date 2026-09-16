  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre dentro del marco real: un renglón en Cinzel Decorative; con
  // dos personas, uno por renglón y el cuerpo baja a .7em (como en el
  // mockup con nombres largos).
  const renglones = saludaAlInvitado ? [nombreInvitado] : [nombre1, ...(nombre2 ? [nombre2] : [])];
  const renglonMasLargo = Math.max(4, ...renglones.map((n) => n.length));
  const nombreLargo = renglones.length > 1 || renglonMasLargo > 11;
  const totalLetras = Math.max(1, renglones.join("").replace(/\s/g, "").length);

  // La frase: una palabra del medio en el acento y el cierre en oro viejo.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.8)) return "rei-oro-viejo";
    if (i === Math.min(desdeAcento, n - 1) || i === Math.floor(n * 0.3)) return "rei-acento";
    return undefined;
  };

  const esXV = invitation.tipo === "QUINCE_ANOS";
  const esBoda = invitation.tipo === "CASAMIENTO";
  const kickerDelEvento = tx(esBoda ? "invitacion.evento.nosCasamos" : esXV ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const nombreDelReino = esXV || !nombre2 ? nombre1.trim().split(/\s+/)[0] : iniciales(nombre1, nombre2);
  const firma = esXV ? nombre1.trim().split(/\s+/)[0] : iniciales(nombre1, nombre2);
  const inicial = (nombreInvitado || nombre1).trim().charAt(0).toUpperCase() || "✦";
  // Cada reino lleva su número romano según el orden real de los paneles.
  const ROMANOS = ["I", "II", "III", "IV"];
  const reino = (clave: string) => `${tx("invitacion.saveTheDate.reino")} ${ROMANOS[Math.max(0, panelesLugar.indexOf(clave))]}`;
  // Las doce estrellas del cielo: posición, tamaño, color y ritmo, como en
  // el mockup.
  const ESTRELLAS = [[6, 10, 22], [88, 6, 30], [70, 18, 14], [14, 30, 18], [92, 36, 16], [30, 44, 12], [80, 52, 24], [10, 62, 16], [56, 70, 14], [40, 8, 12], [22, 20, 10], [64, 40, 18]];
  const Estrellas = ({ blancas = false }: { blancas?: boolean }) => (
    <div className={`rei-estrellas${blancas ? " rei-estrellas--blancas" : ""}`} aria-hidden="true">
      {ESTRELLAS.map(([x, y, s], i) => (
        <svg key={i} viewBox="0 0 40 40" className={`rei-estrella rei-estrella--${i % 4}`} style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDuration: `${(1.8 + (i % 4) * 0.45).toFixed(2)}s`, animationDelay: `${(i * 0.37).toFixed(2)}s` }}><path d="M20 2 C22 14 26 18 38 20 C26 22 22 26 20 38 C18 26 14 22 2 20 C14 18 18 14 20 2 Z" fill="currentColor" /></svg>
      ))}
    </div>
  );

  return (
    <div
      ref={raizRef}
      className={`${reiSerif.variable} ${reiSans.variable} rei-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_REI}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="rei-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            El pergamino: sobre crema con puntitos del acento, la fecha en
            Cinzel centrada y la foto como ventana de arco con marco de oro
            y una gema arriba. */}
        <section data-tone="light" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="rei-section rei-std">
          <span className="rei-puntos-fondo rei-puntos-fondo--arriba" aria-hidden="true" />
          <div className="rei-folio rei-folio--acento">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha")}</span>
            <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
          </div>
          <div className="rei-spread">
            <div className="rei-pagina rei-pagina--centrada">
              <div className="rei-fecha">
                <span data-xin="1" data-dist="-160" className="rei-fecha-linea rei-fecha-linea--dia">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="rei-fecha-linea rei-fecha-linea--mes">{mesLargo}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="rei-fecha-linea rei-fecha-linea--anio">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="rei-fecha-pie">
                <span>{diaSemana} · {hora} h</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="rei-pildora rei-pildora--noche"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario")} ✦
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="rei-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only rei-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="43,27,78" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only rei-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="43,27,78" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --rei-punto. */}
                <span className="rei-foto-revelado" aria-hidden="true" />
                <span className="rei-foto-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
                <span className="rei-gema rei-gema--foto" aria-hidden="true" />
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            El reloj de la torre: cuatro ventanas de arco con una gema
            arriba, entre una marquesina del acento y un filete de oro. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="rei-section rei-countdown">
          <div className="rei-folio rei-folio--oro">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.saveTheDate.antesDeMedianoche")}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="rei-marquesina rei-marquesina--acento" aria-hidden="true">
            <div className="rei-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.cuentaRegresiva.dias")} ✦ {tx("invitacion.cuentaRegresiva.horas")} ✦ {tx("invitacion.cuentaRegresiva.minutos")} ✦ {tx("invitacion.cuentaRegresiva.segundos")} ✦ {diaNum} {tx("invitacion.evento.de")} {mesLargo} ✦&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="rei-spread">
            <div className="rei-pagina rei-pagina--entera">
              <CuentaReino targetDate={fechaHora} />
            </div>
          </div>
          <div className="rei-marquesina rei-marquesina--filete rei-marquesina--contraria" aria-hidden="true">
            <div className="rei-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, `${hora} h`, dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            El estandarte: sobre el acento con estrellas blancas, la frase
            en un pendón crema con punta y borde de oro, y una pastilla de
            noche con la gema que flota. */}
        {hayFrase && (
          <section data-tone="dark" data-screen-label={tx("invitacion.frase.etiqueta")} className="rei-section rei-frase-seccion">
            <Estrellas blancas />
            <div className="rei-folio">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.frase.unasPalabras")}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="rei-spread rei-spread--centrado">
              <div className="rei-estandarte">
                <h2 ref={fraseRef} className="rei-frase">
                  {palabras.map((p, i) => (
                    // El espacio va fuera del span: el motor pone cada palabra
                    // en inline-block y un espacio adentro se colapsa a cero.
                    <span key={i}>
                      <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                    </span>
                  ))}
                </h2>
              </div>
              <div data-xin="1" data-delay="900" data-dist="60" className="rei-pastilla">
                <span className="rei-gema rei-gema--chica" aria-hidden="true" />
                <span>{tx("invitacion.frase.conAmor")} · {titulo}</span>
              </div>
            </div>
            <div className="rei-tres-estrellas" aria-hidden="true"><span>✦</span><span className="rei-oro">✦</span><span>✦</span></div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Los reinos: el castillo sobre la noche, la ceremonia sobre el
            acento y el cronograma sobre el castillo, con el título
            centrado y el naipe de arco con su gema. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="rei-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="rei-pan-fijo">
            <div data-strip="1" className="rei-tira">
              <div data-tone="dark" className="rei-panel rei-panel--castillo">
                <div className="rei-folio">
                  <span>{nCuando} — {reino("recepcion")}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="rei-spread">
                  <div className="rei-pagina rei-pagina--titulo">
                    <span className="rei-panel-sub">{tx("invitacion.saveTheDate.elCastillo")}</span>
                    <h2 className="rei-panel-titulo">{lugarNombre || tx("invitacion.ubicacion.elLugar")}</h2>
                  </div>
                  <div className="rei-naipe">
                    <span className="rei-gema rei-gema--naipe" aria-hidden="true" />
                    <div className="rei-linea"><span>{tx("invitacion.ubicacion.recepcion")}</span><span>{hora} h</span></div>
                    {direccion && <div className="rei-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="rei-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="rei-cta">
                        {tx("invitacion.ubicacion.comoLlegar")} ✦
                      </a>
                    )}
                  </div>
                </div>
                <div className="rei-folio rei-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ")}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza")} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="rei-panel rei-panel--ceremonia">
                  <div className="rei-folio">
                    <span>{nCuando} — {reino("ceremonia")}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="rei-spread">
                    <div className="rei-pagina rei-pagina--titulo">
                      <span className="rei-panel-sub">{ceremoniaTitulo}</span>
                      <h2 className="rei-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <div className="rei-naipe">
                      <span className="rei-gema rei-gema--naipe" aria-hidden="true" />
                      {ceremoniaHora && <div className="rei-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="rei-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="rei-folio rei-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil")}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza")} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="dark" className="rei-panel rei-panel--mapa">
                  <div className="rei-folio">
                    <span>{nCuando} — {reino("llegar")}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="rei-spread">
                    <div className="rei-pagina rei-pagina--titulo">
                      <span className="rei-panel-sub">{tx("invitacion.ubicacion.tuUbicacion")}</span>
                      <h2 className="rei-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="rei-naipe">
                      <span className="rei-gema rei-gema--naipe" aria-hidden="true" />
                      {embedMapUrl && (
                        <div className="rei-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="rei-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas")} ✦
                      </a>
                    </div>
                  </div>
                  <div className="rei-folio rei-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ")}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza")} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="dark" className="rei-panel rei-panel--cronograma">
                  <div className="rei-folio">
                    <span>{nCuando} — {reino("cronograma")}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="rei-spread">
                    <div className="rei-pagina rei-pagina--titulo">
                      <span className="rei-panel-sub">{tx("invitacion.ubicacion.cronograma")}</span>
                      <h2 className="rei-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="rei-naipe">
                      <span className="rei-gema rei-gema--naipe" aria-hidden="true" />
                      {cronograma.map((item, i) => (
                        <div key={i} className="rei-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="rei-folio rei-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            La invitación real: sobre crema, la tarjeta blanca con doble
            filete de oro, el nombre en Cinzel y el sello de lacre con la
            inicial al confirmar. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="light" data-screen-label={tx("invitacion.rsvp.confirmar")} className="rei-section rei-checkin">
            <span className="rei-puntos-fondo rei-puntos-fondo--abajo" aria-hidden="true" />
            <div className="rei-folio rei-folio--acento">
              <span data-xin="1" data-dist="-40">{nCheckin} — {tx("invitacion.saveTheDate.invitacionReal")}</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="rei-spread">
              <div className="rei-pagina rei-pagina--centrada">
                <h2 data-xin="1" data-dist="-80" className="rei-h2">
                  {tx("invitacion.saveTheDate.venis")}<br /><span className="rei-acento">{tx("invitacion.saveTheDate.alBaile")}</span>
                </h2>
                <p data-xin="1" data-delay="120" className="rei-parrafo">{tx("invitacion.rsvp.kicker")}.</p>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="rei-cupon" style={{ "--rei-inicial": `"${inicial}"` } as React.CSSProperties}>
                <CheckinReino
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
            Galería de retratos: marcos de oro, algunos con arco y uno
            redondo, sobre el papel neutro. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="rei-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="rei-pan-fijo rei-pan-fijo--album">
              <div data-strip="1" className="rei-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`rei-panel rei-panel--album${iHoja % 2 === 1 ? " rei-panel--album-b" : ""}`}>
                    <div className="rei-folio rei-folio--gris">
                      <span>{nAlbum} — {tx("invitacion.saveTheDate.galeriaDeRetratos")}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") })} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="rei-h2 rei-h2--album">{tx("invitacion.saveTheDate.retratos")}</h2>
                    <div className="rei-hoja" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="rei-foto-hoja"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="rei-foto-hoja-img" />
                          <span data-colorwash="1" className={`rei-bano rei-bano--${(i % 5) + 1}`} aria-hidden="true" />
                          <span className="rei-foto-hoja-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rei-folio rei-folio--gris rei-folio--pie">
                      <span>{tx("invitacion.album.fotosSubidas", { n: todasLasFotos.length })}</span>
                      {!scrollVertical && hojasDeFotos.length > 1 && <span>{tx("invitacion.portada.desliza")} →</span>}
                    </div>
                  </div>
                ))}
              </div>
              {!scrollVertical && hojasDeFotos.length > 1 && <Puntos cantidad={hojasDeFotos.length} />}
            </div>
          </div>
        )}

        {/* ── 07 Música ──────────────────────────────────────────────────
            El baile: sobre el castillo, el título con la segunda línea en
            oro, el ecualizador y la lista en fichas de noche con gema. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="rei-section rei-musica">
            <div className="rei-folio rei-folio--oro">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.saveTheDate.elBaile")}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="rei-spread">
              <div className="rei-pagina rei-pagina--centrada">
                <h2 data-xin="1" data-dist="-80" className="rei-h2">
                  {tituloEnDosLineas(tx("invitacion.saveTheDate.preguntaTemaAbreBaile"), "rei-oro")}
                </h2>
                <div data-xin="1" data-delay="120" className="rei-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              </div>
              <div className="rei-pagina">
                <CancionesReino
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            El cofre: sobre crema, fichas blancas con arco y borde de
            color. */}
        {hayRegalos && (
          <section id="banco" data-tone="light" data-screen-label={tx("invitacion.regalos.titulo")} className="rei-section rei-regalos">
            <div className="rei-folio rei-folio--acento">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.saveTheDate.elCofre")}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="rei-spread">
              <div className="rei-pagina rei-pagina--centrada">
                <h2 data-xin="1" data-dist="-80" className="rei-h2">
                  {tx("invitacion.saveTheDate.tuRegalo")}<br /><span className="rei-acento">{tx("invitacion.saveTheDate.esVenir")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="rei-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="rei-pagina">
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
            Espejo, espejo: sobre la gema celeste, chip de noche y opciones
            en píldoras blancas. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="light" data-screen-label={triviaTitulo} className="rei-section rei-quiz">
            <div className="rei-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {tx("invitacion.saveTheDate.espejoEspejo")}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="rei-spread">
              <TriviaReino
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            La llave: sobre la noche con estrellas, el QR en ventana de
            arco con doble filete, el pase en oro, la mesa en el acento y
            "Y vivieron felices". */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="rei-section rei-pase">
          <Estrellas />
          <div className="rei-folio rei-folio--oro">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.saveTheDate.laLlave")}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="rei-spread">
            <div data-xin="1" data-dist="-60" className="rei-pagina rei-pagina--qr">
              <div className="rei-qr">
                <span className="rei-gema rei-gema--qr" aria-hidden="true" />
                <QrDeIngreso guest={guest as never} />
                <span className="rei-qr-etq">{tx("invitacion.pase.tuPase")}</span>
              </div>
            </div>
            <div className="rei-pagina">
              <div data-xin="1" data-delay="100" className="rei-pase-cabeza">
                <div className="rei-pase-numero">
                  <span className="rei-folio-etq">{tx("invitacion.pase.pase")} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="rei-pase-mesa">
                    <span className="rei-folio-etq">{tx("invitacion.pase.tuMesa")}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="rei-caja">
                <div className="rei-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="rei-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="rei-linea"><span>{tx("invitacion.pase.sector")} · {tx("invitacion.pase.tuMesa")}</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="rei-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} h</span></div>
              </div>
              <div className="rei-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="rei-pase-pie">
            <span className="rei-despedida">{tx("invitacion.saveTheDate.yVivieronFelices")} — {firma}</span>
            <div className="rei-folio rei-folio--oro rei-folio--colofon">
              <span className="rei-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.acc2} /></span>
              <span className="rei-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.saveTheDate.volverAlCastillo")} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="rei-riel">
        <span ref={rielTopRef} className="rei-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="rei-riel-linea">
          <span ref={rielBarraRef} className="rei-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="rei-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha")}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          El castillo de noche: estrellas que titilan, la luna de oro y el
          castillo con sus ventanas encendidas y el banderín que flamea;
          en el centro, el marco real con la gema, el nombre en Cinzel y
          los tres puntos. Es la bienvenida: dice de quién es la fiesta,
          cuándo, dónde y para cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="rei-portada">
        <div ref={escenaPortadaRef} className="rei-portada-hoja">
          <div className="rei-cielo" aria-hidden="true">
            <Estrellas />
            <span data-drift="-6" className="rei-luna" />
            <svg data-drift="10" viewBox="0 0 430 260" preserveAspectRatio="xMidYMax slice" className="rei-castillo">
              <g className="rei-castillo-piedra">
                <rect x="0" y="200" width="430" height="60" />
                <rect x="40" y="120" width="34" height="90" /><polygon points="40,120 57,84 74,120" />
                <rect x="96" y="150" width="60" height="60" />
                <rect x="170" y="70" width="40" height="140" /><polygon points="170,70 190,20 210,70" />
                <rect x="226" y="140" width="70" height="70" />
                <rect x="316" y="105" width="34" height="105" /><polygon points="316,105 333,66 350,105" />
                <rect x="366" y="160" width="40" height="50" />
              </g>
              <g className="rei-castillo-ventanas"><rect x="52" y="150" width="8" height="14" /><rect x="185" y="100" width="10" height="16" /><rect x="185" y="140" width="10" height="16" /><rect x="328" y="140" width="8" height="14" /><rect x="120" y="170" width="10" height="14" /><rect x="256" y="160" width="10" height="16" /></g>
              <g className="rei-castillo-banderin"><polygon points="190,20 190,4 214,12" /></g>
              <polygon points="57,84 57,72 72,78" className="rei-castillo-bandera" /><polygon points="333,66 333,54 348,60" className="rei-castillo-bandera" />
              <path d="M0 210 Q215 180 430 210 L430 260 L0 260 Z" className="rei-castillo-colina" />
            </svg>
          </div>

          <div data-cl="1" className="rei-tapa-cabecera">
            <span>{tx("invitacion.saveTheDate.reinoDe")} {nombreDelReino}</span>
            <span className="rei-tapa-numero">Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="rei-tapa-centro">
            <div className="rei-marco">
              <div className="rei-marco-gema" aria-hidden="true"><span className="rei-gema rei-gema--marco" /><span className="rei-marco-barra" /></div>
              <span className="rei-tapa-kicker">{kickerDelEvento}</span>
              <h1 ref={cartelRef} className={`rei-tapa-nombres${nombreLargo ? " rei-tapa-nombres--largo" : ""}`} style={{ "--largo": renglonMasLargo, "--n": totalLetras } as React.CSSProperties}>
                {renglones.map((r, i) => (
                  <span key={i} className="rei-tapa-linea"><span data-pieza="1"><Letras texto={r} desde={i === 0 ? 0 : renglones[0].replace(/\s/g, "").length} /></span></span>
                ))}
              </h1>
              <div className="rei-tres-puntos" aria-hidden="true"><span /><span className="rei-tres-puntos--oro" /><span /></div>
            </div>
            <div className="rei-tapa-datos">
              <span>{diaSemana} {diaNum} · {mesLargo} · {anio}<br /><span className="rei-oro">{[lugarNombre, ciudad].filter(Boolean).join(" · ")}</span></span>
              <span className="rei-tapa-datos-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase")} Nº {pase}<br /><span className="rei-oro">{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</span></>
                  : <>{hora} h<br /><span className="rei-oro">{fechaPuntos}</span></>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="rei-tapa-pie">
            <p className="rei-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}, ${String(invitation.portadaMensaje || tx("invitacion.saveTheDate.mensajeReino"))}`
                : String(invitation.portadaMensaje || tx("invitacion.saveTheDate.mensajeReino"))}
            </p>
            <button type="button" onClick={abrir} className="rei-tapa-btn">
              {tx("invitacion.portada.abrirInvitacion")} ✦
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="rei-pista">{tx("invitacion.portada.desliza")} ↓</div>

      {fotoAmpliada && (
        <div className="rei-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="rei-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="rei-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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
 * El nombre letra por letra: cada tanto una "brilla" (crece un 14 % y sube
 * 6 px) y vuelve rebotando. El CSS escalona el turno de cada letra.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="rei-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
      )}
    </>
  );
}
