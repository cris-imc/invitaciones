  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre como cartel de cine: Playfair 900 centrado, con la "y" en
  // itálica dorada. El renglón más largo manda el cuerpo.
  const renglones = saludaAlInvitado ? [nombreInvitado] : [nombre1, ...(nombre2 ? [nombre2] : [])];
  const renglonMasLargo = Math.max(5, ...renglones.map((n) => n.length));
  const totalLetras = Math.max(1, renglones.join("").replace(/\s/g, "").length);

  // El intertítulo: el medio en dorado y el cierre en redonda negrita.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.7)) return "noi-negrita";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "noi-oro";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const tituloDePelicula = String(invitation.nombreEvento || kickerDelEvento);
  // Cuatro volutas de humo, cada una con su ritmo.
  const HUMO: [number, number, number][] = [[22, 6, 0], [30, 7.5, 1.8], [26, 5.2, 3.2], [34, 8, 4.6]];

  return (
    <div
      ref={raizRef}
      className={`${noiSerif.variable} ${noiSans.variable} noi-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_NOI}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="noi-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            El cartel de cine: marfil, "estreno mundial", la fecha en tres
            renglones y la foto en blanco y negro con perforaciones de
            película a los costados. */}
        <section data-tone="light" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="noi-section noi-std">
          <div className="noi-folio">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
          </div>
          <div className="noi-spread">
            <div className="noi-pagina">
              <span data-xin="1" className="noi-estreno">{tx("invitacion.saveTheDate.estrenoMundial")}</span>
              <div className="noi-fecha">
                <span data-xin="1" data-dist="-160" className="noi-fecha-linea noi-fecha-linea--dia">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="noi-fecha-linea noi-fecha-linea--mes">{tx("invitacion.evento.de")} {mesLargo}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="noi-fecha-linea noi-fecha-linea--anio">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="noi-fecha-pie">
                <span>{diaSemana} · {tx("invitacion.saveTheDate.funcionUnica")} · {hora} H</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="noi-chip"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.reservarEnCalendario")}
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="noi-foto">
                <span className="noi-perforaciones noi-perforaciones--izq" aria-hidden="true" />
                <span className="noi-perforaciones noi-perforaciones--der" aria-hidden="true" />
                {fotoMobile && (
                  <div className="acp-mobile-only noi-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="11,11,13" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only noi-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="11,11,13" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --noi-punto. */}
                <span className="noi-foto-revelado" aria-hidden="true" />
                <span className="noi-foto-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()} · B/N</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            La claqueta: la franja a rayas, la caja con producción y
            dirección, los cuatro números y la toma. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="noi-section noi-countdown">
          <div className="noi-folio noi-folio--oro">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.kicker").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <span className="noi-claqueta" aria-hidden="true" />
          <div className="noi-spread">
            <div className="noi-pagina noi-pagina--entera">
              <div className="noi-claqueta-caja">
                <div className="noi-claqueta-fila"><span>{tx("invitacion.saveTheDate.prod").toUpperCase()} {titulo.toUpperCase()}</span><span>{tx("invitacion.saveTheDate.dirElDestino").toUpperCase()}</span></div>
                <CuentaNoir targetDate={fechaHora} />
                <div className="noi-claqueta-fila noi-claqueta-fila--pie"><span>{tx("invitacion.saveTheDate.escena").toUpperCase()} {nCountdown}</span><span>{tx("invitacion.saveTheDate.toma").toUpperCase()} {String(fechaEvento.getDate() % 9 + 1)}</span></div>
              </div>
            </div>
          </div>
          <div className="noi-marquesina" aria-hidden="true">
            <div className="noi-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, `${hora} h`, dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            El intertítulo de cine mudo: viñeta oscura, marco doble y la
            frase en itálica que se funde palabra por palabra. */}
        {hayFrase && (
          <section data-tone="dark" data-screen-label={tx("invitacion.frase.etiqueta")} className="noi-section noi-frase-seccion">
            <span className="noi-vineta" aria-hidden="true" />
            <div className="noi-folio noi-folio--oro">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.saveTheDate.intertitulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="noi-spread noi-spread--centro">
              <div className="noi-intertitulo">
                <h2 ref={fraseRef} className="noi-frase">
                  {palabras.map((p, i) => (
                    // El espacio va fuera del span: el motor pone cada palabra
                    // en inline-block y un espacio adentro se colapsa a cero.
                    <span key={i}>
                      <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                    </span>
                  ))}
                </h2>
              </div>
              <span data-xin="1" data-delay="900" data-dist="60" className="noi-frase-firma">{tx("invitacion.frase.conAmor").toUpperCase()} · {titulo.toUpperCase()}</span>
            </div>
            <div className="noi-folio noi-folio--suave noi-folio--pie">
              <span>{titulo.toUpperCase()}</span>
              <span>{tx("invitacion.saveTheDate.rollo").toUpperCase()} {nFrase}</span>
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Las escenas: exterior noche sobre negro, interior sobre marfil y
            el guion de la noche sobre rojo sangre. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="noi-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="noi-pan-fijo">
            <div data-strip="1" className="noi-tira">
              <div data-tone="dark" className="noi-panel noi-panel--negro">
                <div className="noi-folio noi-folio--acento">
                  <span>{nCuando} — {tx("invitacion.saveTheDate.escena").toUpperCase()} {deLugar("recepcion").split(" ")[0]}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="noi-spread">
                  <div className="noi-pagina">
                    <span className="noi-panel-sub">{tx("invitacion.ubicacion.fiestaSalon")}</span>
                    <h2 className="noi-panel-titulo">{lugarNombre || ciudad}</h2>
                  </div>
                  <div className="noi-ficha">
                    <div className="noi-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="noi-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="noi-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="noi-cta">
                        {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}<span>→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="noi-folio noi-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="light" className="noi-panel noi-panel--marfil">
                  <div className="noi-folio noi-folio--acento">
                    <span>{nCuando} — {tx("invitacion.saveTheDate.escena").toUpperCase()} {deLugar("ceremonia").split(" ")[0]}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="noi-spread">
                    <div className="noi-pagina">
                      <span className="noi-panel-sub">{ceremoniaTitulo}</span>
                      <h2 className="noi-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <div className="noi-ficha">
                      {ceremoniaHora && <div className="noi-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="noi-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="noi-folio noi-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="dark" className="noi-panel noi-panel--negro">
                  <div className="noi-folio noi-folio--acento">
                    <span>{nCuando} — {tx("invitacion.saveTheDate.escena").toUpperCase()} {deLugar("llegar").split(" ")[0]}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="noi-spread">
                    <div className="noi-pagina">
                      <span className="noi-panel-sub">{ciudad || lugarNombre}</span>
                      <h2 className="noi-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="noi-ficha">
                      {embedMapUrl && (
                        <div className="noi-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="noi-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas").toUpperCase()}<span>→</span>
                      </a>
                    </div>
                  </div>
                  <div className="noi-folio noi-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="dark" className="noi-panel noi-panel--rojo">
                  <div className="noi-folio">
                    <span>{nCuando} — {tx("invitacion.saveTheDate.escena").toUpperCase()} {deLugar("cronograma").split(" ")[0]}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="noi-spread">
                    <div className="noi-pagina">
                      <span className="noi-panel-sub">{tx("invitacion.saveTheDate.guionDeLaNoche")}</span>
                      <h2 className="noi-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="noi-ficha">
                      {cronograma.map((item, i) => (
                        <div key={i} className="noi-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="noi-folio noi-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            El expediente: sobre marfil, la carpeta con "Caso Nº", máquina
            de escribir y el sello rectangular CONFIRMADO. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="light" data-screen-label={tx("invitacion.rsvp.confirmar")} className="noi-section noi-checkin">
            <div className="noi-folio">
              <span data-xin="1" data-dist="-40">{nCheckin} — {tx("invitacion.saveTheDate.expediente").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="noi-spread">
              <div className="noi-pagina">
                <h2 data-xin="1" data-dist="-80" className="noi-h2">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><span className="noi-italica noi-rojo">{tx("invitacion.rsvp.confirmaLinea2")}</span>
                </h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="noi-cupon">
                <CheckinNoir
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
            La tira de fotogramas: negro con perforaciones arriba y abajo,
            y las fotos con su baño de color. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="noi-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="noi-pan-fijo noi-pan-fijo--album">
              <div data-strip="1" className="noi-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`noi-panel noi-panel--album${iHoja % 2 === 1 ? " noi-panel--album-b" : ""}`}>
                    <div className="noi-folio noi-folio--gris">
                      <span>{nAlbum} — {tx("invitacion.saveTheDate.fotogramas").toUpperCase()}</span>
                      <span>{tx("invitacion.saveTheDate.rollo").toUpperCase()} {String(iHoja + 1).padStart(2, "0")} / {String(hojasDeFotos.length).padStart(2, "0")} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="noi-h2 noi-h2--album">{tx("invitacion.saveTheDate.detrasDe")} <span className="noi-italica">{tx("invitacion.saveTheDate.escena").toLowerCase()}</span></h2>
                    <div className="noi-fotogramas" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="noi-fotograma"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="noi-fotograma-img" />
                          <span data-colorwash="1" className={`noi-bano noi-bano--${(i % 2) + 1}`} aria-hidden="true" />
                          <span className="noi-fotograma-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="noi-folio noi-folio--gris noi-folio--pie">
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
            La banda sonora: dos carretes girando y la lista con filetes
            punteados. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="noi-section noi-musica">
            <div className="noi-folio noi-folio--oro">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.saveTheDate.bandaSonora").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="noi-spread">
              <div className="noi-pagina">
                <h2 data-xin="1" data-dist="-80" className="noi-h2">
                  {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "noi-italica noi-oro")}
                </h2>
                <div data-xin="1" data-delay="120" className="noi-carretes" aria-hidden="true">
                  <span className="noi-carrete"><i /><i /><i /><i /></span><span className="noi-carrete-cinta" /><span className="noi-carrete noi-carrete--oro"><i /><i /><i /><i /></span>
                </div>
              </div>
              <div className="noi-pagina">
                <CancionesNoir
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Sobre marfil, fichas de papel con filete. */}
        {hayRegalos && (
          <section id="banco" data-tone="light" data-screen-label={tx("invitacion.regalos.titulo")} className="noi-section noi-regalos">
            <div className="noi-folio">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="noi-spread">
              <div className="noi-pagina">
                <h2 data-xin="1" data-dist="-80" className="noi-h2">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><span className="noi-italica noi-rojo">{tx("invitacion.regalos.siQueresLinea2")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="noi-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="noi-pagina">
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
            El interrogatorio: rojo sangre, la pregunta en itálica y las
            opciones que dicen culpable o coartada. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="noi-section noi-quiz">
            <div className="noi-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{tx("invitacion.saveTheDate.interrogatorio").toUpperCase()} · {folio(nQuiz)}</span>
            </div>
            <div className="noi-spread">
              <TriviaNoir
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            Los créditos finales: el QR sobre marfil con doble filete
            dorado, el pase enorme, la butaca en itálica y FIN. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="noi-section noi-pase">
          <div className="noi-folio noi-folio--oro">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.saveTheDate.creditosFinales").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="noi-spread">
            <div data-xin="1" data-dist="-60" className="noi-pagina noi-pagina--qr">
              <div className="noi-qr">
                <QrDeIngreso guest={guest as never} />
                <span className="noi-qr-etq">{tx("invitacion.pase.tuPase").toUpperCase()}</span>
              </div>
            </div>
            <div className="noi-pagina">
              <div data-xin="1" data-delay="100" className="noi-pase-cabeza">
                <div className="noi-pase-numero">
                  <span className="noi-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="noi-pase-mesa">
                    <span className="noi-folio-etq">{tx("invitacion.saveTheDate.butaca").toUpperCase()}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="noi-lineas-pase">
                <div className="noi-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="noi-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="noi-linea"><span>Sector · {tx("invitacion.pase.tuMesa")}</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="noi-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="noi-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="noi-pase-pie">
            <span className="noi-fin">FIN</span>
            <span className="noi-fin-sub">{tx("invitacion.saveTheDate.oElPrincipio")} — {iniciales(nombre1, nombre2)}</span>
            <div className="noi-folio noi-folio--oro noi-folio--colofon">
              <span className="noi-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.ink} /></span>
              <span className="noi-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.saveTheDate.rebobinar").toUpperCase()} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="noi-riel">
        <span ref={rielTopRef} className="noi-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="noi-riel-linea">
          <span ref={rielBarraRef} className="noi-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="noi-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          El foco, la persiana y el humo: un cartel de cine negro con el
          nombre en Playfair 900, la "y" en itálica dorada y el título de
          la película. Es la bienvenida: dice de quién es la fiesta,
          cuándo, dónde y para cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="noi-portada">
        <div ref={escenaPortadaRef} className="noi-portada-hoja">
          <div className="noi-escenario" aria-hidden="true">
            <span data-depth="6" className="noi-foco" />
            <span data-depth="1.5" className="noi-persiana" />
            {HUMO.map(([x, d, dl], i) => (
              <span key={i} className="noi-humo" style={{ left: `${x}%`, animationDuration: `${d}s`, animationDelay: `${dl}s` }} />
            ))}
            <span className="noi-grano" />
          </div>

          <div data-cl="1" className="noi-folio noi-folio--oro noi-folio--tapa">
            <span>{tx("invitacion.saveTheDate.escena")} 00 · {tx("invitacion.saveTheDate.toma")} 1</span>
            <span>Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="noi-tapa-centro">
            <span className="noi-tapa-kicker">— {tx("invitacion.saveTheDate.unaProduccionDe")} —</span>
            <h1 ref={cartelRef} className="noi-tapa-nombres" style={{ "--largo": renglonMasLargo, "--n": totalLetras } as React.CSSProperties}>
              {saludaAlInvitado ? (
                <span className="noi-tapa-linea"><span data-pieza="1"><Letras texto={nombreInvitado} desde={0} /></span></span>
              ) : (
                <>
                  <span className="noi-tapa-linea"><span data-pieza="1"><Letras texto={nombre1} desde={0} /></span></span>
                  {nombre2 && (
                    <>
                      <span className="noi-tapa-linea noi-tapa-linea--y"><span data-pieza="1">{tx("invitacion.rsvp.y")}</span></span>
                      <span className="noi-tapa-linea"><span data-pieza="1"><Letras texto={nombre2} desde={nombre1.replace(/\s/g, "").length} /></span></span>
                    </>
                  )}
                </>
              )}
            </h1>
            <span className="noi-tapa-pelicula">{tx("invitacion.saveTheDate.en")} «{tituloDePelicula}»</span>
            <div className="noi-tapa-datos">
              <span>{diaSemana} {diaNum} · {String(fechaEvento.getMonth() + 1).padStart(2, "0")} · {anio} · {hora}<br /><span className="noi-oro">{[lugarNombre, ciudad].filter(Boolean).join(" · ")}</span></span>
              <span className="noi-tapa-datos-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase").toUpperCase()} Nº {pase}<br /><span className="noi-oro">{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</span></>
                  : <>{kickerDelEvento.toUpperCase()}<br /><span className="noi-oro">{dressCode || fechaPuntos}</span></>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="noi-tapa-pie">
            <p className="noi-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}: ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
            </p>
            <button type="button" onClick={abrir} className="noi-tapa-btn">
              {tx("invitacion.portada.abrirInvitacion").toUpperCase()}<span className="noi-cursor">_</span>
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="noi-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="noi-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="noi-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="noi-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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
 * El nombre letra por letra: cada tanto una salta como una tecla de máquina
 * de escribir (sube 4 px y baja en seco). El CSS escalona el turno.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="noi-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
      )}
    </>
  );
}
