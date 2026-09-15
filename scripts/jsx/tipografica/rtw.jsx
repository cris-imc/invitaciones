  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre como logo de los 80: crema con doble sombra dura (magenta y
  // cian, invertidas en la segunda línea). El renglón más largo manda el
  // cuerpo.
  const renglones = saludaAlInvitado ? [nombreInvitado] : [nombre1, ...(nombre2 ? [nombre2] : [])];
  const renglonMasLargo = Math.max(5, ...renglones.map((n) => n.length));
  const totalLetras = Math.max(1, renglones.join("").replace(/\s/g, "").length);

  // La frase: el medio en magenta y el cierre en cian.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.7)) return "rtw-cian";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "rtw-magenta";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const mesCorto = mesLargo.slice(0, 3).toUpperCase();
  // Diez estrellas fijas sobre el cielo de la tapa, cada una con su ritmo.
  const ESTRELLAS: [number, number, number][] = [[6, 6, 3], [18, 14, 2], [30, 4, 2], [44, 12, 3], [58, 6, 2], [72, 16, 2], [86, 8, 3], [94, 20, 2], [12, 28, 2], [80, 30, 2]];

  return (
    <div
      ref={raizRef}
      className={`${rtwSerif.variable} ${rtwSans.variable} rtw-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_RTW}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="rtw-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            La cinta VHS: pliego magenta con líneas de barrido, la fecha en
            Righteous itálica con sombra dura y la foto como un cuadro de
            video con "● REC". */}
        <section data-tone="dark" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="rtw-section rtw-std">
          <span className="rtw-vhs" aria-hidden="true" />
          <div className="rtw-folio">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">● REC · {folio(nSaveTheDate)}</span>
          </div>
          <div className="rtw-spread">
            <div className="rtw-pagina">
              <div className="rtw-fecha">
                <span data-xin="1" data-dist="-160" className="rtw-fecha-linea rtw-fecha-linea--dia">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="rtw-fecha-linea rtw-fecha-linea--mes">{mesLargo}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="rtw-fecha-linea rtw-fecha-linea--anio">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="rtw-fecha-pie">
                <span>{diaSemana} · {hora} H</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="rtw-chip rtw-chip--oscuro"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} ▶
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="rtw-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only rtw-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="26,11,46" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only rtw-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="26,11,46" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --rtw-punto. */}
                <span className="rtw-foto-revelado" aria-hidden="true" />
                <div className="rtw-foto-cabeza"><span>● REC</span><span>SP 0:00:{String(fechaEvento.getDate()).padStart(2, "0")}</span></div>
                <div className="rtw-foto-pie"><span>{tx("invitacion.album.nuestraFoto").toUpperCase()}</span><span>{diaNum} {mesCorto} {anio}</span></div>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            El display digital: dos marquesinas inclinadas y cuatro
            pantallas con borde y sombra dura de su color, sobre la grilla
            magenta en fuga. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="rtw-section rtw-countdown">
          <div className="rtw-grilla3d rtw-grilla3d--magenta" aria-hidden="true"><span /></div>
          <div className="rtw-folio rtw-folio--cian">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="rtw-marquesina rtw-marquesina--cian" aria-hidden="true">
            <div className="rtw-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.cuentaRegresiva.dias")} ▶ {tx("invitacion.cuentaRegresiva.horas")} ▶ {tx("invitacion.cuentaRegresiva.minutos")} ▶ {tx("invitacion.cuentaRegresiva.segundos")} ▶ {diaSemana.toLowerCase()} {diaNum} {tx("invitacion.evento.de")} {mesLargo} ▶&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="rtw-spread">
            <div className="rtw-pagina rtw-pagina--entera">
              <CuentaRetrowave targetDate={fechaHora} />
            </div>
          </div>
          <div className="rtw-marquesina rtw-marquesina--magenta rtw-marquesina--contraria" aria-hidden="true">
            <div className="rtw-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, `${hora} h`, dressCode, "Side A"].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            Las letras cromadas: sobre el cielo, con el sol rayado detrás,
            la frase en itálica con sombra y la tarjeta que flota. */}
        {hayFrase && (
          <section data-tone="dark" data-screen-label={tx("invitacion.frase.etiqueta")} className="rtw-section rtw-frase-seccion">
            <span className="rtw-sol-rayado" aria-hidden="true" />
            <div className="rtw-folio rtw-folio--cian">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.frase.unasPalabras").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="rtw-spread">
              <h2 ref={fraseRef} className="rtw-frase">
                {palabras.map((p, i) => (
                  // El espacio va fuera del span: el motor pone cada palabra
                  // en inline-block y un espacio adentro se colapsa a cero.
                  <span key={i}>
                    <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                  </span>
                ))}
              </h2>
              <div data-xin="1" data-delay="900" data-dist="60" className="rtw-firma">
                <span className="rtw-firma-play" aria-hidden="true">▶</span>
                <span>{tx("invitacion.frase.conAmor")} · {titulo}</span>
              </div>
            </div>
            <div className="rtw-folio rtw-folio--cian rtw-folio--pie">
              <span>Side A · Track {nFrase}</span>
              <span className="rtw-barra" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Un track por lugar: fondo, cielo y suelo, cada uno con su neón
            (magenta, cian, sol) en el título, la tarjeta y la grilla. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="rtw-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="rtw-pan-fijo">
            <div data-strip="1" className="rtw-tira">
              <div data-tone="dark" className="rtw-panel rtw-panel--magenta">
                <div className="rtw-grilla3d" aria-hidden="true"><span /></div>
                <div className="rtw-folio rtw-folio--acento">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="rtw-spread">
                  <div className="rtw-pagina">
                    <span className="rtw-panel-sub">Track {deLugar("recepcion").split(" ")[0]}</span>
                    <h2 className="rtw-panel-titulo">{lugarNombre || ciudad}</h2>
                  </div>
                  <div className="rtw-tarjeta-lugar">
                    <div className="rtw-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="rtw-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="rtw-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="rtw-cta">
                        {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}<span>▶</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="rtw-folio rtw-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} ▶▶</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="rtw-panel rtw-panel--cian">
                  <div className="rtw-grilla3d" aria-hidden="true"><span /></div>
                  <div className="rtw-folio rtw-folio--acento">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="rtw-spread">
                    <div className="rtw-pagina">
                      <span className="rtw-panel-sub">Track {deLugar("ceremonia").split(" ")[0]}</span>
                      <h2 className="rtw-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <div className="rtw-tarjeta-lugar">
                      {ceremoniaHora && <div className="rtw-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="rtw-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="rtw-folio rtw-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} ▶▶</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="dark" className="rtw-panel rtw-panel--sol">
                  <div className="rtw-grilla3d" aria-hidden="true"><span /></div>
                  <div className="rtw-folio rtw-folio--acento">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="rtw-spread">
                    <div className="rtw-pagina">
                      <span className="rtw-panel-sub">Track {deLugar("llegar").split(" ")[0]}</span>
                      <h2 className="rtw-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="rtw-tarjeta-lugar">
                      {embedMapUrl && (
                        <div className="rtw-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="rtw-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas").toUpperCase()}<span>▶</span>
                      </a>
                    </div>
                  </div>
                  <div className="rtw-folio rtw-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} ▶▶</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="dark" className="rtw-panel rtw-panel--sol rtw-panel--suelo">
                  <div className="rtw-grilla3d" aria-hidden="true"><span /></div>
                  <div className="rtw-folio rtw-folio--acento">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="rtw-spread">
                    <div className="rtw-pagina">
                      <span className="rtw-panel-sub">Track {deLugar("cronograma").split(" ")[0]}</span>
                      <h2 className="rtw-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="rtw-tarjeta-lugar">
                      {cronograma.map((item, i) => (
                        <div key={i} className="rtw-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="rtw-folio rtw-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            La carátula del cassette: pliego cian con barrido, la tarjeta
            crema con borde y sombra dura, "● REC" y el sello triangular
            GRABADO al confirmar. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="dark" data-screen-label={tx("invitacion.rsvp.confirmar")} className="rtw-section rtw-checkin">
            <span className="rtw-vhs rtw-vhs--suave" aria-hidden="true" />
            <div className="rtw-folio">
              <span data-xin="1" data-dist="-40">{nCheckin} — CHECK-IN</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="rtw-spread">
              <div className="rtw-pagina">
                <h2 data-xin="1" data-dist="-80" className="rtw-h2 rtw-h2--sombra-crema">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><span className="rtw-magenta">{tx("invitacion.rsvp.confirmaLinea2")}</span>
                </h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="rtw-cupon">
                <CheckinRetrowave
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
            Polaroids: marco blanco con el borde de abajo más ancho, sombra
            dura y cada una apenas girada. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="rtw-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="rtw-pan-fijo rtw-pan-fijo--album">
              <div data-strip="1" className="rtw-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`rtw-panel rtw-panel--album${iHoja % 2 === 1 ? " rtw-panel--album-b" : ""}`}>
                    <div className="rtw-folio rtw-folio--gris">
                      <span>{nAlbum} — {tx("invitacion.album.titulo").toUpperCase()}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="rtw-h2 rtw-h2--album">Polaroids</h2>
                    <div className="rtw-polaroids" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="rtw-polaroid"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="rtw-polaroid-img" />
                          <span data-colorwash="1" className={`rtw-bano rtw-bano--${(i % 5) + 1}`} aria-hidden="true" />
                          <span className="rtw-polaroid-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rtw-folio rtw-folio--gris rtw-folio--pie">
                      <span>{tx("invitacion.album.fotosSubidas", { n: todasLasFotos.length }).toUpperCase()}</span>
                      {!scrollVertical && hojasDeFotos.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} ▶▶</span>}
                    </div>
                  </div>
                ))}
              </div>
              {!scrollVertical && hojasDeFotos.length > 1 && <Puntos cantidad={hojasDeFotos.length} />}
            </div>
          </div>
        )}

        {/* ── 07 Música ──────────────────────────────────────────────────
            El walkman: dos carretes girando con la cinta entre ellos, y la
            lista con "A1, A2…" en el neón de cada tema. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="rtw-section rtw-musica">
            <div className="rtw-folio rtw-folio--cian">
              <span data-xin="1" data-dist="-40">{nMusica} — SIDE B</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="rtw-spread">
              <div className="rtw-pagina">
                <h2 data-xin="1" data-dist="-80" className="rtw-h2 rtw-h2--sombra-magenta">
                  {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "rtw-cian")}
                </h2>
                <div data-xin="1" data-delay="120" className="rtw-walkman" aria-hidden="true">
                  <span className="rtw-carrete rtw-carrete--magenta" /><span className="rtw-cinta" /><span className="rtw-carrete rtw-carrete--cian" />
                </div>
              </div>
              <div className="rtw-pagina">
                <CancionesRetrowave
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Pliego del sol: naranja con barrido, y las cuentas en tarjetas
            oscuras con borde y sombra de neón. */}
        {hayRegalos && (
          <section id="banco" data-tone="dark" data-screen-label={tx("invitacion.regalos.titulo")} className="rtw-section rtw-regalos">
            <span className="rtw-vhs rtw-vhs--suave" aria-hidden="true" />
            <div className="rtw-folio">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="rtw-spread">
              <div className="rtw-pagina">
                <h2 data-xin="1" data-dist="-80" className="rtw-h2 rtw-h2--sombra-crema">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><span className="rtw-magenta">{tx("invitacion.regalos.siQueresLinea2")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="rtw-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="rtw-pagina">
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
            El arcade: "LEVEL 1 / 3" sobre el cielo, la grilla cian en fuga
            y las opciones que dicen WIN o MISS. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="rtw-section rtw-quiz">
            <div className="rtw-grilla3d rtw-grilla3d--cian" aria-hidden="true"><span /></div>
            <div className="rtw-folio rtw-folio--cian">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">HIGH SCORE · {folio(nQuiz)}</span>
            </div>
            <div className="rtw-spread">
              <TriviaRetrowave
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            El ticket de entrada: el QR sobre crema con borde cian y sombra
            magenta, el pase enorme en itálica y "◀◀ Rebobinar". */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="rtw-section rtw-pase">
          <span className="rtw-sol-rayado rtw-sol-rayado--chico" aria-hidden="true" />
          <div className="rtw-folio rtw-folio--cian">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="rtw-spread">
            <div data-xin="1" data-dist="-60" className="rtw-pagina rtw-pagina--qr">
              <div className="rtw-qr">
                <QrDeIngreso guest={guest as never} />
                <span className="rtw-qr-etq">{tx("invitacion.pase.tuPase").toUpperCase()}</span>
              </div>
            </div>
            <div className="rtw-pagina">
              <div data-xin="1" data-delay="100" className="rtw-pase-cabeza">
                <div className="rtw-pase-numero">
                  <span className="rtw-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="rtw-pase-mesa">
                    <span className="rtw-folio-etq">{tx("invitacion.pase.tuMesa").toUpperCase()}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="rtw-caja">
                <div className="rtw-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="rtw-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="rtw-linea"><span>Sector</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="rtw-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="rtw-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="rtw-pase-pie">
            <span className="rtw-despedida">{tx("invitacion.pase.losEsperamos")} {iniciales(nombre1, nombre2)}</span>
            <div className="rtw-folio rtw-folio--cian rtw-folio--colofon">
              <span className="rtw-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.ink} /></span>
              <span className="rtw-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                ◀◀ {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="rtw-riel">
        <span ref={rielTopRef} className="rtw-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="rtw-riel-linea">
          <span ref={rielBarraRef} className="rtw-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="rtw-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          El atardecer: cielo con estrellas, el sol y las palmeras sobre el
          horizonte, la grilla en fuga que corre hacia adelante y el nombre
          como logo de los 80. Es la bienvenida: dice de quién es la
          fiesta, cuándo, dónde y para cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="rtw-portada">
        <div ref={escenaPortadaRef} className="rtw-portada-hoja">
          <div className="rtw-escenario" aria-hidden="true">
            <span className="rtw-cielo" />
            {ESTRELLAS.map(([x, y, s], i) => (
              <span key={i} className="rtw-estrella" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDuration: `${(1.6 + (i % 4) * 0.5).toFixed(1)}s`, animationDelay: `${(i * 0.33).toFixed(2)}s` }} />
            ))}
            <div className="rtw-horizonte-escena">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-depth="-0.4" src="/templates/retrowave/sol.webp" alt="" className="rtw-sol" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-depth="0.8" src="/templates/retrowave/palmera-izq.webp" alt="" className="rtw-palmera rtw-palmera--izq" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-depth="1.2" src="/templates/retrowave/palmera-der.webp" alt="" className="rtw-palmera rtw-palmera--der" />
            </div>
            <div className="rtw-suelo"><div className="rtw-suelo-plano"><span className="rtw-suelo-grilla" /></div></div>
            <span className="rtw-horizonte" />
            <span className="rtw-scan" />
          </div>

          <div data-cl="1" className="rtw-folio rtw-folio--cian rtw-folio--tapa">
            <span>{kickerDelEvento}</span>
            <span>Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="rtw-tapa-centro">
            <span className="rtw-tapa-kicker">Now playing</span>
            <h1 ref={cartelRef} className="rtw-tapa-nombres" style={{ "--largo": renglonMasLargo, "--n": totalLetras } as React.CSSProperties}>
              {saludaAlInvitado ? (
                <span className="rtw-tapa-linea"><span data-pieza="1" className="rtw-tapa-logo"><Letras texto={nombreInvitado} desde={0} /></span></span>
              ) : (
                <>
                  <span className="rtw-tapa-linea"><span data-pieza="1" className="rtw-tapa-logo"><Letras texto={nombre1} desde={0} /></span></span>
                  {nombre2 && (
                    <>
                      <span className="rtw-tapa-linea rtw-tapa-linea--amp"><span data-pieza="1">&amp;</span></span>
                      <span className="rtw-tapa-linea"><span data-pieza="1" className="rtw-tapa-logo rtw-tapa-logo--inv"><Letras texto={nombre2} desde={nombre1.replace(/\s/g, "").length} /></span></span>
                    </>
                  )}
                </>
              )}
            </h1>
            <div className="rtw-placa rtw-placa--datos">
              <span>{lugarNombre || "—"}<br /><span className="rtw-cian">{[direccion, ciudad].filter(Boolean).join(" · ")}</span></span>
              <span className="rtw-placa-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase")} Nº {pase}<br /><span className="rtw-cian">{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</span></>
                  : <>{hora} h<br /><span className="rtw-cian">{fechaPuntos}</span></>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="rtw-tapa-pie">
            <p className="rtw-placa rtw-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}. ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
            </p>
            <button type="button" onClick={abrir} className="rtw-tapa-btn">
              <span>▶ Play</span><span className="rtw-tapa-btn-etq">{tx("invitacion.portada.abrirInvitacion").toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="rtw-pista">{tx("invitacion.portada.desliza").toUpperCase()} ▼</div>

      {fotoAmpliada && (
        <div className="rtw-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="rtw-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="rtw-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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
 * El nombre letra por letra: cada tanto una hace "glitch" (se corre y se
 * inclina tres pasos y vuelve), como una cinta que tiembla. El CSS
 * escalona el turno de cada letra.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="rtw-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
      )}
    </>
  );
}
