  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  return (
    <div
      ref={raizRef}
      className={`${ebnSerif.variable} ${ebnSans.variable} ${ebnMono.variable} ebn-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_EBN}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="ebn-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            El pliego se invierte: tinta sobre crema. La fecha ocupa la
            página izquierda en tres renglones que se cruzan, y la foto va
            enmarcada en la derecha. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="ebn-section ebn-std">
          <div className="ebn-trama ebn-trama--media" aria-hidden="true" />
          <div className="ebn-spread">
            <div className="ebn-pagina">
              <div className="ebn-folio">
                <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
                <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
              </div>
              <div className="ebn-fecha">
                <span data-xin="1" data-dist="-160" className="ebn-fecha-linea">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="ebn-fecha-linea ebn-fecha-linea--acc">{mesLargo.slice(0, 3)}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="ebn-fecha-linea">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="ebn-fecha-pie">
                <span>{diaSemana} · {hora} H</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="ebn-link"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} ↗
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="ebn-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only ebn-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="20,20,20" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only ebn-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="20,20,20" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --ebn-punto. */}
                <span className="ebn-foto-revelado" aria-hidden="true" />
                <span className="ebn-foto-anio">{anio}</span>
                <span className="ebn-foto-pie">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            Dos marquesinas que corren en sentidos opuestos y, entre ellas,
            las cuatro cifras. */}
        <section data-tone={TONO} data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="ebn-section ebn-countdown">
          <div className="ebn-folio">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="ebn-marquesina" aria-hidden="true">
            <div className="ebn-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[tx("invitacion.cuentaRegresiva.dias"), tx("invitacion.cuentaRegresiva.horas"), tx("invitacion.cuentaRegresiva.minutos"), tx("invitacion.cuentaRegresiva.segundos")].join(" · ")} · {fechaPuntos} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
          <CuentaEditorial targetDate={fechaHora} />
          <div className="ebn-marquesina ebn-marquesina--contraria" aria-hidden="true">
            <div className="ebn-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, hora ? `${hora} H` : "", dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            El pliego del acento: la frase entra palabra por palabra y al
            lado va el sello con la firma. */}
        {hayFrase && (
          <section data-tone="dark" data-screen-label={tx("invitacion.frase.etiqueta")} className="ebn-section ebn-frase-seccion">
            <div className="ebn-folio">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.frase.unasPalabras").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="ebn-spread">
              <h2 ref={fraseRef} className="ebn-frase">
                {palabras.map((p, i) => (
                  // El espacio va fuera del span: el motor pone cada palabra
                  // en inline-block y un espacio adentro se colapsa a cero.
                  <span key={i}>
                    <span data-w="1" className={i >= desdeAcento ? "ebn-acento" : undefined}>{p}</span>{" "}
                  </span>
                ))}
              </h2>
              <div data-xin="1" data-delay="900" data-dist="60" className="ebn-sello">
                <span>{tx("invitacion.frase.conAmor")}</span>
              </div>
            </div>
            <div className="ebn-folio ebn-folio--pie">
              <span>{titulo.toUpperCase()}</span>
              <span>{fechaPuntos}</span>
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Un pliego por lugar. Cada uno se lleva su tono: el salón sobre
            crema, la ceremonia sobre tinta y el cronograma sobre el acento. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="ebn-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="ebn-pan-fijo">
            <div data-strip="1" className="ebn-tira">
              <div data-tone={TONO} className="ebn-panel">
                <div className="ebn-folio">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="ebn-spread">
                  <h2 className="ebn-panel-titulo">
                    {(lugarNombre || tx("invitacion.ubicacion.elLugar")).split(" ")[0]}
                    <br /><span className="ebn-acento">{(lugarNombre || "").split(" ").slice(1).join(" ") || ciudad}</span>
                  </h2>
                  <div className="ebn-lineas">
                    <div className="ebn-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="ebn-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="ebn-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="ebn-cta">
                        {tx("invitacion.ubicacion.comoLlegar")}<span className="ebn-cta-flecha">↗</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="ebn-folio ebn-folio--pie">
                  <span>{(ciudad || direccion).toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.segui").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="ebn-panel">
                  <div className="ebn-folio">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="ebn-spread">
                    <h2 className="ebn-panel-titulo">
                      {(ceremoniaNombre || ceremoniaTitulo).split(" ")[0]}
                      <br /><span className="ebn-acento">{(ceremoniaNombre || "").split(" ").slice(1).join(" ") || ceremoniaTitulo}</span>
                    </h2>
                    <div className="ebn-lineas">
                      {ceremoniaHora && <div className="ebn-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="ebn-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="ebn-folio ebn-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.segui").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone={TONO} className="ebn-panel">
                  <div className="ebn-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="ebn-spread">
                    <h2 className="ebn-panel-titulo">
                      {tx("invitacion.ubicacion.comoLlegar")}
                    </h2>
                    <div className="ebn-lineas">
                      {embedMapUrl && (
                        <div className="ebn-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="ebn-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas")}<span className="ebn-cta-flecha">↗</span>
                      </a>
                    </div>
                  </div>
                  <div className="ebn-folio ebn-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.segui").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="dark" className="ebn-panel ebn-panel--acento">
                  <div className="ebn-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="ebn-spread">
                    <h2 className="ebn-panel-titulo">
                      {tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}
                      <br /><span className="ebn-acento ebn-acento--tinta">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",").slice(1).join(",").trim()}</span>
                    </h2>
                    <div className="ebn-lineas">
                      {cronograma.map((item, i) => (
                        <div key={i} className="ebn-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="ebn-folio ebn-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            El cupón: papel blanco con borde grueso, línea de corte punteada
            y el estado arriba a la derecha. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone={TONO} data-screen-label={tx("invitacion.rsvp.confirmar")} className="ebn-section ebn-checkin">
            <div className="ebn-folio">
              <span data-xin="1" data-dist="-40">{nCheckin} — CHECK-IN</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="ebn-spread">
              <div className="ebn-pagina">
                <h2 data-xin="1" data-dist="-80" className="ebn-h2">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><span className="ebn-acento">{tx("invitacion.rsvp.confirmaLinea2")}</span>
                </h2>
              </div>
              <div className="ebn-cupon">
                <span className="ebn-cupon-corte" aria-hidden="true" />
                <CheckinEditorial
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
            Hoja de contactos: la grilla de seis columnas de una plancha de
            fotografía, con la tinta del acento por encima. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="ebn-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="ebn-pan-fijo">
              <div data-strip="1" className="ebn-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone={TONO} className="ebn-panel ebn-panel--album">
                    <div className="ebn-folio">
                      <span>{nAlbum} — {tx("invitacion.album.titulo").toUpperCase()}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()}</span>
                    </div>
                    {iHoja === 0 && (
                      <h2 className="ebn-h2 ebn-h2--album">
                        {tx("invitacion.album.titulo")} <span className="ebn-acento">{tx("invitacion.album.deFotos")}</span>
                      </h2>
                    )}
                    <div className="ebn-contactos" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          className="ebn-contacto"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="ebn-contacto-img" />
                          <span className="ebn-contacto-tinta" aria-hidden="true" />
                          <span className="ebn-contacto-n">{String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="ebn-folio ebn-folio--pie">
                      <span>{tx("invitacion.album.fotosSubidas", { n: todasLasFotos.length }).toUpperCase()}</span>
                      {!scrollVertical && hojasDeFotos.length > 1 && <span>{tx("invitacion.portada.segui").toUpperCase()} →</span>}
                    </div>
                  </div>
                ))}
              </div>
              {!scrollVertical && hojasDeFotos.length > 1 && <Puntos cantidad={hojasDeFotos.length} />}
            </div>
          </div>
        )}

        {/* ── 07 Música ──────────────────────────────────────────────────
            Pliego de tinta, con el ecualizador como única ilustración. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="ebn-section ebn-musica">
            <div className="ebn-folio">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.musica.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="ebn-spread">
              <div className="ebn-pagina">
                <h2 data-xin="1" data-dist="-80" className="ebn-h2">
                  {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "ebn-acento")}
                </h2>
                <div data-xin="1" data-delay="120" className="ebn-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />)}
                </div>
              </div>
              <div className="ebn-pagina">
                <CancionesEditorial
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Las tarjetas bancarias son fichas blancas con borde grueso. */}
        {hayRegalos && (
          <section id="banco" data-tone={TONO} data-screen-label={tx("invitacion.regalos.titulo")} className="ebn-section ebn-regalos">
            <div className="ebn-folio">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="ebn-spread">
              <div className="ebn-pagina">
                <h2 data-xin="1" data-dist="-80" className="ebn-h2">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><span className="ebn-acento">{tx("invitacion.regalos.siQueresLinea2")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="ebn-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="ebn-pagina">
                {regaloHabilitado && (
                  <TarjetaBancaria
                    titulo={String(invitation.regaloTitulo || tx("invitacion.regalos.tituloEvento"))}
                    alias={String(invitation.regaloAlias || "")}
                    cbu={String(invitation.regaloCbu || "")}
                    banco={String(invitation.regaloBanco || "")}
                    titular={String(invitation.regaloTitular || "")}
                    retraso={180}
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
                    retraso={260}
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── 09 Trivia ──────────────────────────────────────────────────
            El único pliego que va entero en el acento. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="ebn-section ebn-quiz">
            <div className="ebn-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {tx("invitacion.quiz.kicker").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="ebn-spread">
              <div className="ebn-pagina">
                <h2 data-xin="1" data-dist="-80" className="ebn-h2">{triviaTitulo}</h2>
              </div>
              <div className="ebn-pagina">
                <TriviaEditorial
                  preguntas={triviaPreguntas}
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            La contratapa: el QR grande a la izquierda y los datos del pase
            a la derecha, con el sello girando. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="ebn-section ebn-pase">
          <div className="ebn-folio">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="ebn-spread">
            <div data-xin="1" data-dist="-60" className="ebn-pagina ebn-pagina--qr">
              <QrDeIngreso guest={guest as never} />
            </div>
            <div className="ebn-pagina">
              <div data-xin="1" data-delay="100" className="ebn-pase-cabeza">
                <div className="ebn-pase-numero">
                  <span className="ebn-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                <Sello texto={`${titulo} · ${fechaPuntos} · `} />
              </div>
              <div className="ebn-lineas">
                <div className="ebn-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara").toUpperCase() : tx("invitacion.evento.invitado").toUpperCase()}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="ebn-linea"><span>{tx("invitacion.pase.lugares").toUpperCase()}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="ebn-linea"><span>{tx("invitacion.pase.tuMesa").toUpperCase()}</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="ebn-linea"><span>{tx("invitacion.ubicacion.horario").toUpperCase()}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="ebn-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div className="ebn-folio ebn-folio--pie">
            <span>{tx("invitacion.pase.noTransferible").toUpperCase()}</span>
            <span className="ebn-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
              {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()} ↺
            </span>
          </div>
          <div className="ebn-credito">
            <LogoFooterCredit bgColor="transparent" textColor={PALETA.bg} />
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="ebn-riel">
        <span ref={rielTopRef} className="ebn-riel-top">{tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}</span>
        <div ref={rielLineaRef} className="ebn-riel-linea">
          <span ref={rielBarraRef} className="ebn-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="ebn-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La portada ──────────────────────────────────────────────────
          Es la tapa de la revista y, a la vez, la bienvenida: dice de quién
          es la fiesta, cuándo, dónde y para cuántos. Por eso esta
          sub-colección no monta además la sección de Bienvenida: sería
          decir dos veces lo mismo, una arriba de la otra. */}
      <div ref={portadaRef} data-tone={TONO} className="ebn-portada">
        <div ref={escenaPortadaRef} className="ebn-portada-hoja">
          <div className="ebn-trama ebn-trama--tapa" aria-hidden="true" />

          <div data-cl="1" className="ebn-folio">
            <span>{tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos").toUpperCase()}</span>
            <span>Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="ebn-tapa-centro">
            <div className="ebn-tapa-fila">
              <span className="ebn-tapa-fecha">{diaSemana} {diaNum} · {mesLargo.toUpperCase()} · {anio}</span>
              <Sello texto={`${tx(invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.nosCasamos")} · ${fechaPuntos} · `} amp />
            </div>
            <h1 ref={cartelRef} className="ebn-tapa-nombres">
              {saludaAlInvitado ? (
                <span className="ebn-tapa-linea"><span data-pieza="1">{nombreInvitado}</span></span>
              ) : (
                <>
                  <span className="ebn-tapa-linea"><span data-pieza="1">{nombre1}</span></span>
                  {nombre2 && (
                    <span className="ebn-tapa-linea ebn-tapa-linea--sangra">
                      <span data-pieza="1"><span className="ebn-acento">&amp;</span>{nombre2}</span>
                    </span>
                  )}
                </>
              )}
            </h1>
            <div className="ebn-folio">
              <span>{[lugarNombre, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
              {isPersonalized && guest && (
                <span className="ebn-tapa-pase">
                  {tx("invitacion.pase.numeroPase", { n: pase }).toUpperCase()}<br />
                  {tx("invitacion.bienvenida.paraVarios", { cantidad: String(lugaresDelPase) }).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div data-cl="3" className="ebn-tapa-pie">
            <span className="ebn-regla" aria-hidden="true" />
            <p className="ebn-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}. ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
            </p>
            <button type="button" onClick={abrir} className="ebn-tapa-btn">
              {tx("invitacion.portada.abrirInvitacion").toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="ebn-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="ebn-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="ebn-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="ebn-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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

/**
 * El sello circular: dos anillos y el texto siguiendo la circunferencia,
 * girando una vuelta cada 26 segundos. Es el único elemento de la
 * sub-colección que no es tipografía plana, y aparece dos veces: en la tapa
 * (con el & en el centro) y en la contratapa.
 */
function Sello({ texto, amp = false }: { texto: string; amp?: boolean }) {
  // El id del arco tiene que ser único por instancia: dos <textPath> que
  // apuntan al mismo id hacen que el segundo no se dibuje.
  const id = useId().replace(/:/g, "");
  return (
    <div className="ebn-sello-circular" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <defs>
          <path id={`arc-${id}`} d="M50 50 m -37 0 a 37 37 0 1 1 74 0 a 37 37 0 1 1 -74 0" fill="none" />
        </defs>
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="2" />
        <text>
          <textPath href={`#arc-${id}`}>{texto.toUpperCase().repeat(2).slice(0, 64)}</textPath>
        </text>
      </svg>
      {amp && <span className="ebn-sello-amp">&amp;</span>}
    </div>
  );
}
