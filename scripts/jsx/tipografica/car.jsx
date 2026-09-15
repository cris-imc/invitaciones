  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre de la marquesina se parte en letras para que cada tanto una
  // "falle" como un tubo de neón: la animación va escalonada por letra, así
  // que en cada ciclo se apaga una sola (ver carZumbido en el CSS).
  const textoDeMarquesina = saludaAlInvitado ? nombreInvitado : `${nombre1}${nombre2}`;
  const totalLetras = Math.max(1, textoDeMarquesina.replace(/\s/g, "").length);
  // El renglón más largo manda el cuerpo del nombre: Limelight es ancha y un
  // "María Florencia" no puede partirse en dos renglones dentro del marco.
  const renglonMasLargo = Math.max(4, ...(saludaAlInvitado ? [nombreInvitado] : [nombre1, nombre2]).map((n) => n.length));

  // La frase: el medio va en rosa y el cierre en dorado, como en el letrero
  // del mockup ("doce años" rosa, "decirlo en voz alta" dorado).
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.7)) return "car-acento2";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "car-acento";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");

  return (
    <div
      ref={raizRef}
      className={`${carSerif.variable} ${carSans.variable} car-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_CAR}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="car-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            El cartel de ruta: crema con rayos dorados arriba, la fecha en
            tres renglones de Limelight y la foto enmarcada como un afiche. */}
        <section data-tone="light" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="car-section car-std">
          <div className="car-rayos" aria-hidden="true" />
          <div className="car-folio">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
          </div>
          <div className="car-spread">
            <div className="car-pagina">
              <div className="car-fecha" style={{ "--letras": Math.max(3, mesLargo.length) } as React.CSSProperties}>
                <span data-xin="1" data-dist="-160" className="car-fecha-linea car-fecha-linea--dia">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="car-fecha-linea car-fecha-linea--mes">{mesLargo}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="car-fecha-linea">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="car-fecha-pie">
                <span>{diaSemana} · {hora} H</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="car-pildora car-pildora--tinta"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} ↗
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="car-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only car-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="7,7,26" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only car-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="7,7,26" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --car-punto. */}
                <span className="car-foto-revelado" aria-hidden="true" />
                <div className="car-foto-cabeza">
                  <span>{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
                  <span className="car-estrellas">★★★★★</span>
                </div>
                <span className="car-foto-pildora">Jackpot</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            El tragamonedas: una marquesina rosa arriba, la caja con borde
            dorado y los cuatro rodillos, y otra marquesina abajo en sentido
            contrario. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="car-section car-countdown">
          <div className="car-folio car-folio--suave">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="car-marquesina car-marquesina--rosa" aria-hidden="true">
            <div className="car-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.cuentaRegresiva.dias")} ♠ {tx("invitacion.cuentaRegresiva.horas")} ♥ {tx("invitacion.cuentaRegresiva.minutos")} ♣ {tx("invitacion.cuentaRegresiva.segundos")} ♦ {diaSemana.toLowerCase()} {diaNum} · {mesLargo} ♠ {hora} h ♥&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="car-spread">
            <div className="car-tragamonedas">
              <span className="car-tragamonedas-titulo">{tx("invitacion.cuentaRegresiva.faltan")}</span>
              <CuentaCartelera targetDate={fechaHora} />
              <div className="car-tragamonedas-pie" aria-hidden="true">
                <span className="car-luces"><span /><span /><span /></span>
                <span>{tx("invitacion.cuentaRegresiva.segundos").toUpperCase()} · {tx("invitacion.cuentaRegresiva.kicker").toUpperCase()}</span>
                <span className="car-palanca" />
              </div>
            </div>
          </div>
          <div className="car-marquesina car-marquesina--contraria" aria-hidden="true">
            <div className="car-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            El letrero de neón: la frase adentro de un tubo celeste, con
            "open all night" arriba y los cuatro palos abajo. */}
        {hayFrase && (
          <section data-tone="dark" data-screen-label={tx("invitacion.frase.etiqueta")} className="car-section car-frase-seccion">
            <div className="car-grilla" aria-hidden="true" />
            <div className="car-folio car-folio--suave">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.frase.unasPalabras").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="car-spread">
              <div className="car-letrero">
                <span className="car-letrero-etq">Open all night</span>
                <h2 ref={fraseRef} className="car-frase">
                  {palabras.map((p, i) => (
                    // El espacio va fuera del span: el motor pone cada palabra
                    // en inline-block y un espacio adentro se colapsa a cero.
                    <span key={i}>
                      <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                    </span>
                  ))}
                </h2>
              </div>
              <div data-xin="1" data-delay="900" data-dist="60" className="car-firma">
                <span className="car-firma-etq">{tx("invitacion.frase.conAmor").toUpperCase()}</span>
                <span>{titulo}{ciudad ? `. ${ciudad}.` : ""}</span>
              </div>
            </div>
            <div className="car-palos" aria-hidden="true"><span>♠</span><span className="car-palos-rojo">♥</span><span>♣</span><span className="car-palos-rojo">♦</span></div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            La mesa de paño: un naipe por lugar. El salón es el as de picas,
            la ceremonia el rey de corazones, el mapa la jota de tréboles y
            el cronograma la reina de diamantes. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="car-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="car-pan-fijo">
            <div data-strip="1" className="car-tira">
              <div data-tone="dark" className="car-panel car-panel--pano">
                <div className="car-folio">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="car-spread">
                  <div className="car-pagina">
                    <span className="car-panel-sub">{tx("invitacion.ubicacion.elLugar")}</span>
                    <h2 className="car-panel-titulo">{lugarNombre || ciudad}</h2>
                  </div>
                  <Naipe rango="A" palo="♠">
                    <div className="car-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="car-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="car-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="car-pildora car-pildora--tinta car-pildora--ancha">
                        {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}<span>→</span>
                      </a>
                    )}
                  </Naipe>
                </div>
                <div className="car-folio car-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="car-panel car-panel--vino">
                  <div className="car-folio">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="car-spread">
                    <div className="car-pagina">
                      <span className="car-panel-sub">{ceremoniaTitulo}</span>
                      <h2 className="car-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <Naipe rango="K" palo="♥" rojo>
                      {ceremoniaHora && <div className="car-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="car-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </Naipe>
                  </div>
                  <div className="car-folio car-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="dark" className="car-panel car-panel--noche">
                  <div className="car-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="car-spread">
                    <div className="car-pagina">
                      <span className="car-panel-sub">{ciudad || lugarNombre}</span>
                      <h2 className="car-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <Naipe rango="J" palo="♣">
                      {embedMapUrl && (
                        <div className="car-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="car-pildora car-pildora--tinta car-pildora--ancha">
                        {tx("invitacion.ubicacion.abrirEnMapas").toUpperCase()}<span>→</span>
                      </a>
                    </Naipe>
                  </div>
                  <div className="car-folio car-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="dark" className="car-panel car-panel--noche">
                  <div className="car-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="car-spread">
                    <div className="car-pagina">
                      <span className="car-panel-sub">{tx("invitacion.ubicacion.cronograma")}</span>
                      <h2 className="car-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <Naipe rango="Q" palo="♦" rojo>
                      {cronograma.map((item, i) => (
                        <div key={i} className="car-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </Naipe>
                  </div>
                  <div className="car-folio car-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            El ticket de mesa: papel crema con las muescas a los costados,
            línea de corte punteada y el sello JACKPOT al confirmar. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="dark" data-screen-label={tx("invitacion.rsvp.confirmar")} className="car-section car-checkin">
            <div className="car-halo car-halo--dorado" aria-hidden="true" />
            <div className="car-folio car-folio--suave">
              <span data-xin="1" data-dist="-40">{nCheckin} — CHECK-IN</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="car-spread">
              <div className="car-pagina">
                <h2 data-xin="1" data-dist="-80" className="car-h2 car-h2--dorado">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><span className="car-acento2">{tx("invitacion.rsvp.confirmaLinea2")}</span>
                </h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="car-cupon">
                <CheckinCartelera
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
            La cabina de fotos: grilla de seis columnas con las fotos en
            marco blanco y un baño de color que se enciende al pasar por el
            centro. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="car-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="car-pan-fijo car-pan-fijo--claro">
              <div data-strip="1" className="car-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`car-panel car-panel--album${iHoja % 2 === 1 ? " car-panel--album-b" : ""}`}>
                    <div className="car-folio car-folio--gris">
                      <span>{nAlbum} — {tx("invitacion.album.titulo").toUpperCase()}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="car-h2 car-h2--album">
                      {tx("invitacion.album.titulo")} <span className="car-acento">{tx("invitacion.album.deFotos")}</span>
                    </h2>
                    <div className="car-cabina" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="car-foto-cabina"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="car-foto-cabina-img" />
                          <span data-colorwash="1" className={`car-bano car-bano--${(i % 5) + 1}`} aria-hidden="true" />
                          <span className="car-foto-cabina-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="car-folio car-folio--gris car-folio--pie">
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
            El jukebox: titular celeste, ecualizador de tres neones y la
            lista sobre fichas oscuras. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="car-section car-musica">
            <div className="car-halo car-halo--celeste" aria-hidden="true" />
            <div className="car-folio car-folio--suave">
              <span data-xin="1" data-dist="-40">{nMusica} — JUKEBOX</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="car-spread">
              <div className="car-pagina">
                <h2 data-xin="1" data-dist="-80" className="car-h2 car-h2--celeste">
                  {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "car-acento3")}
                </h2>
                <div data-xin="1" data-delay="120" className="car-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              </div>
              <div className="car-pagina">
                <CancionesCartelera
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            La caja: pliego crema y las cuentas en fichas negras con borde
            de neón, dorado la primera y celeste la segunda. */}
        {hayRegalos && (
          <section id="banco" data-tone="light" data-screen-label={tx("invitacion.regalos.titulo")} className="car-section car-regalos">
            <div className="car-folio car-folio--gris">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="car-spread">
              <div className="car-pagina">
                <h2 data-xin="1" data-dist="-80" className="car-h2">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><span className="car-acento">{tx("invitacion.regalos.siQueresLinea2")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="car-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="car-pagina">
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
            La ruleta, sobre el paño: gira una vuelta entera cada vez que
            se contesta. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="car-section car-quiz">
            <div className="car-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="car-quiz-cuerpo">
              <div data-xin="1" className="car-ruleta" aria-hidden="true">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill={PALETA.bg} />
                  <g stroke={PALETA.bg} strokeWidth="1">
                    <path d="M50 50 L50 6 A44 44 0 0 1 81.1 18.9 Z" fill="#C8102E" />
                    <path d="M50 50 L81.1 18.9 A44 44 0 0 1 94 50 Z" fill="#0F0F1F" />
                    <path d="M50 50 L94 50 A44 44 0 0 1 81.1 81.1 Z" fill="#C8102E" />
                    <path d="M50 50 L81.1 81.1 A44 44 0 0 1 50 94 Z" fill="#0F0F1F" />
                    <path d="M50 50 L50 94 A44 44 0 0 1 18.9 81.1 Z" fill="#C8102E" />
                    <path d="M50 50 L18.9 81.1 A44 44 0 0 1 6 50 Z" fill="#0F0F1F" />
                    <path d="M50 50 L6 50 A44 44 0 0 1 18.9 18.9 Z" fill="#C8102E" />
                    <path d="M50 50 L18.9 18.9 A44 44 0 0 1 50 6 Z" fill="#0E7A4E" />
                  </g>
                  <circle cx="50" cy="50" r="14" fill={PALETA.acc2} stroke={PALETA.bg} strokeWidth="2" />
                </svg>
                <span className="car-ruleta-aguja" />
              </div>
              <TriviaCartelera
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            La ficha VIP: el QR adentro de una ficha de casino, el número de
            pase en dorado y los datos en una caja oscura. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="car-section car-pase">
          <div className="car-halo car-halo--rosa" aria-hidden="true" />
          <div className="car-folio car-folio--suave">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="car-spread">
            <div data-xin="1" data-dist="-60" className="car-pagina car-pagina--ficha">
              <div className="car-ficha">
                <span className="car-ficha-anillo" aria-hidden="true" />
                <span className="car-ficha-arriba">FICHA VIP</span>
                <div className="car-ficha-qr">
                  <QrDeIngreso guest={guest as never} />
                </div>
                <span className="car-ficha-abajo">{tx("invitacion.pase.tuPase").toUpperCase()}</span>
              </div>
            </div>
            <div className="car-pagina">
              <div data-xin="1" data-delay="100" className="car-pase-cabeza">
                <div className="car-pase-numero">
                  <span className="car-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="car-pase-mesa">
                    <span className="car-folio-etq">{tx("invitacion.pase.tuMesa").toUpperCase()}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="car-caja">
                <div className="car-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara").toUpperCase() : tx("invitacion.evento.invitado").toUpperCase()}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="car-linea"><span>{tx("invitacion.pase.lugares").toUpperCase()}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="car-linea"><span>SECTOR</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="car-linea"><span>{tx("invitacion.ubicacion.horario").toUpperCase()}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="car-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="car-pase-pie">
            <span className="car-despedida">{tx("invitacion.pase.losEsperamos")} {iniciales(nombre1, nombre2)}</span>
            <div className="car-folio car-folio--suave car-folio--filete">
              <span className="car-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.ink} /></span>
              <span className="car-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="car-riel">
        <span ref={rielTopRef} className="car-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="car-riel-linea">
          <span ref={rielBarraRef} className="car-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="car-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La portada ──────────────────────────────────────────────────
          La marquesina: un marco de bombitas que se encienden en cadena,
          el nombre en neón rosa que parpadea y, abajo, la ficha del
          invitado. Es la bienvenida: dice de quién es la fiesta, cuándo,
          dónde y para cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="car-portada">
        <div ref={escenaPortadaRef} className="car-portada-hoja">
          <div className="car-grilla car-grilla--tapa" aria-hidden="true" />
          <div className="car-halo car-halo--tapa" aria-hidden="true" />

          <div data-cl="1" className="car-marco">
            <div className="car-bombillas car-bombillas--arriba" aria-hidden="true"><Bombillas cantidad={16} /></div>
            <div className="car-bombillas car-bombillas--abajo" aria-hidden="true"><Bombillas cantidad={16} invertido /></div>
            <div className="car-bombillas car-bombillas--izq" aria-hidden="true"><Bombillas cantidad={12} invertido /></div>
            <div className="car-bombillas car-bombillas--der" aria-hidden="true"><Bombillas cantidad={12} /></div>

            <div className="car-folio car-folio--marco">
              <span className="car-live"><span className="car-live-punto" />Live · {tx("invitacion.saveTheDate.unaSolaNoche")}</span>
              <span>Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
            </div>

            <div data-cl="2" className="car-tapa-centro">
              <span className="car-tapa-kicker">{kickerDelEvento}</span>
              <h1 ref={cartelRef} className="car-tapa-nombres" style={{ "--n": totalLetras, "--largo": renglonMasLargo } as React.CSSProperties}>
                {saludaAlInvitado ? (
                  <span className="car-tapa-linea"><span data-pieza="1"><Letras texto={nombreInvitado} desde={0} /></span></span>
                ) : (
                  <>
                    <span className="car-tapa-linea"><span data-pieza="1"><Letras texto={nombre1} desde={0} /></span></span>
                    {nombre2 && (
                      <>
                        <span className="car-tapa-linea car-tapa-linea--amp"><span data-pieza="1">&amp;</span></span>
                        <span className="car-tapa-linea"><span data-pieza="1"><Letras texto={nombre2} desde={nombre1.replace(/\s/g, "").length} /></span></span>
                      </>
                    )}
                  </>
                )}
              </h1>
              <div className="car-tapa-fecha">
                <Flecha />
                <span>{diaSemana} {diaNum} · {mesLargo.toUpperCase()} · {anio}</span>
                <Flecha invertida />
              </div>
              <div className="car-tapa-datos">
                <div><span>{tx("invitacion.ubicacion.elLugar").toUpperCase()}</span><span>{lugarNombre || "—"}</span></div>
                <div><span>{tx("invitacion.ubicacion.ciudad").toUpperCase()}</span><span>{ciudad || "—"}</span></div>
                <div>
                  <span>{isPersonalized && guest ? tx("invitacion.pase.pase").toUpperCase() : tx("invitacion.saveTheDate.fecha").toUpperCase()}</span>
                  <span>{isPersonalized && guest ? `Nº ${pase} · ×${lugaresDelPase}` : fechaPuntos}</span>
                </div>
              </div>
            </div>

            <div data-cl="3" className="car-tapa-pie">
              <p className="car-tapa-mensaje">
                {saludaAlInvitado
                  ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}. ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                  : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
              </p>
              <button type="button" onClick={abrir} className="car-tapa-btn">
                {tx("invitacion.portada.abrirInvitacion")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="car-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="car-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="car-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="car-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {musicaHabilitada && audioDeFondo}
      {montado && isPersonalized && guest && portadaAbierta && (
        <BurbujaPase acento={PALETA.acc2} guest={guest} />
      )}
      {montado && musicaHabilitada && portadaAbierta && createPortal(
        <MusicToggleButton isPlaying={musicaSonando} onToggle={alternarMusica} className="fixed top-3 left-3 z-[99998]" />,
        document.body
      )}
    </div>
  );
}

/** "V & T": las iniciales de la despedida de la contratapa. */
function iniciales(a: string, b: string): string {
  const i = (s: string) => (s.trim()[0] || "").toUpperCase();
  return b ? `${i(a)} & ${i(b)}` : i(a);
}

/**
 * Las bombitas del marco: cada una se enciende un tercio del ciclo, con el
 * retraso corrido de a una, y así la luz "corre" alrededor de la marquesina.
 * Del lado de abajo y de la izquierda va invertido para que el giro sea
 * horario.
 */
function Bombillas({ cantidad, invertido = false }: { cantidad: number; invertido?: boolean }) {
  return (
    <>
      {Array.from({ length: cantidad }).map((_, i) => (
        <span key={i} className="car-bombilla" style={{ animationDelay: `-${((invertido ? cantidad - 1 - i : i) % 3) * 250}ms` }} />
      ))}
    </>
  );
}

/**
 * El nombre letra por letra, cada una con su índice: el CSS apaga una
 * distinta cada 3,6 segundos, como un tubo de neón que falla.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="car-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
      )}
    </>
  );
}

/** La flecha de neón celeste que señala la fecha, moviéndose de a 8 px. */
function Flecha({ invertida = false }: { invertida?: boolean }) {
  return (
    <svg width="42" height="22" viewBox="0 0 42 22" className={`car-flecha${invertida ? " car-flecha--inv" : ""}`} aria-hidden="true">
      <path d="M2 11 H30 M22 3 L30 11 L22 19" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="36" cy="11" r="3" fill="currentColor" />
    </svg>
  );
}

/** Un naipe: papel crema, índice y palo en dos esquinas (una dada vuelta). */
function Naipe({ rango, palo, rojo = false, children }: { rango: string; palo: string; rojo?: boolean; children: React.ReactNode }) {
  return (
    <div className={`car-naipe${rojo ? " car-naipe--rojo" : ""}`}>
      <span className="car-naipe-indice" aria-hidden="true">{rango}<span>{palo}</span></span>
      <span className="car-naipe-indice car-naipe-indice--abajo" aria-hidden="true">{rango}<span>{palo}</span></span>
      <div className="car-naipe-cuerpo">{children}</div>
    </div>
  );
}
