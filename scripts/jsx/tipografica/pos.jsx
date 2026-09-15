  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre en Alfa Slab, centrado, con el "&" como una estampilla. El
  // renglón más largo manda el cuerpo.
  const renglones = saludaAlInvitado ? [nombreInvitado] : [nombre1, ...(nombre2 ? [nombre2] : [])];
  const renglonMasLargo = Math.max(5, ...renglones.map((n) => n.length));

  // La frase: el medio en el acento y el cierre en el verde azulado.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.7)) return "pos-teal";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "pos-acento";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const mesCorto = mesLargo.slice(0, 3).toUpperCase();
  const inicialesCortas = iniciales(nombre1, nombre2).replace(" & ", "+");
  const codigoDelPase = `ALT ${pase} · ${anio} · ${(ciudad || lugarNombre || "").slice(0, 3).toUpperCase()}`;

  return (
    <div
      ref={raizRef}
      className={`${posSerif.variable} ${posSans.variable} ${posMono.variable} pos-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_POS}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="pos-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            El pasaporte: sobre tinta, el sello de visa con la fecha adentro
            y la foto con marco de papel y el "VISA 2027" arriba. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="pos-section pos-std">
          <div className="pos-folio pos-folio--ambar">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
          </div>
          <div className="pos-spread">
            <div className="pos-pagina">
              <div data-xin="1" data-dist="0" className="pos-visa">
                <SelloVisa arco={`${tx("invitacion.saveTheDate.entrada").toUpperCase()} · ${[lugarNombre, ciudad].filter(Boolean).join(" · ").toUpperCase()} · `} dia={diaNum} mes={mesLargo.toUpperCase()} anio={anio} admitido={tx("invitacion.saveTheDate.admitido").toUpperCase()} />
              </div>
              <div data-xin="1" data-delay="360" className="pos-fecha-pie">
                <span>{diaSemana} · {hora} H</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="pos-chip pos-chip--ambar"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} ✈
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="pos-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only pos-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="30,58,95" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only pos-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="30,58,95" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --pos-punto. */}
                <span className="pos-foto-revelado" aria-hidden="true" />
                <span className="pos-foto-visa" aria-hidden="true">VISA<br />{anio}</span>
                <span className="pos-foto-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            El panel de salidas: fichas split-flap en mono, con la línea
            partida al medio, entre dos marquesinas. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="pos-section pos-countdown">
          <div className="pos-folio">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="pos-marquesina pos-marquesina--acento" aria-hidden="true">
            <div className="pos-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.saveTheDate.embarque").toUpperCase()} · {tx("invitacion.cuentaRegresiva.dias").toUpperCase()} · {tx("invitacion.cuentaRegresiva.horas").toUpperCase()} · {tx("invitacion.cuentaRegresiva.minutos").toUpperCase()} · {tx("invitacion.cuentaRegresiva.segundos").toUpperCase()} · {diaNum} {tx("invitacion.evento.de").toUpperCase()} {mesLargo.toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="pos-spread">
            <div className="pos-pagina pos-pagina--entera">
              <CuentaPostal targetDate={fechaHora} />
            </div>
          </div>
          <div className="pos-marquesina pos-marquesina--filete pos-marquesina--contraria" aria-hidden="true">
            <div className="pos-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, `${hora} h`, dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            El dorso de la postal: papel rayado, la frase en Alfa Slab y la
            nota con el avioncito que flota. */}
        {hayFrase && (
          <section data-tone="light" data-screen-label={tx("invitacion.frase.etiqueta")} className="pos-section pos-frase-seccion">
            <span className="pos-rayado" aria-hidden="true" />
            <div className="pos-folio pos-folio--acento">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.frase.unasPalabras").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="pos-spread">
              <h2 ref={fraseRef} className="pos-frase">
                {palabras.map((p, i) => (
                  // El espacio va fuera del span: el motor pone cada palabra
                  // en inline-block y un espacio adentro se colapsa a cero.
                  <span key={i}>
                    <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                  </span>
                ))}
              </h2>
              <div data-xin="1" data-delay="900" data-dist="60" className="pos-nota">
                <span className="pos-nota-avion" aria-hidden="true">✈</span>
                <span>{tx("invitacion.frase.conAmor")} · {titulo}</span>
              </div>
            </div>
            <div className="pos-folio pos-folio--pie">
              <span>{tx("invitacion.saveTheDate.viaAerea").toUpperCase()}</span>
              <span className="pos-barra" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Etiquetas de valija: un destino por lugar, con la tarjeta de
            esquinas desparejas y el ojal a la izquierda. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="pos-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="pos-pan-fijo">
            <div data-strip="1" className="pos-tira">
              <div data-tone="light" className="pos-panel pos-panel--crema">
                <div className="pos-folio pos-folio--acento">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="pos-spread">
                  <div className="pos-pagina">
                    <span className="pos-panel-sub">{tx("invitacion.saveTheDate.destino")} {deLugar("recepcion").split(" ")[0]}</span>
                    <h2 className="pos-panel-titulo">{lugarNombre || ciudad}</h2>
                  </div>
                  <div className="pos-etiqueta-valija">
                    <span className="pos-ojal" aria-hidden="true" />
                    <div className="pos-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="pos-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="pos-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="pos-cta">
                        {tx("invitacion.ubicacion.comoLlegar")}<span>✈</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="pos-folio pos-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="pos-panel pos-panel--tinta">
                  <div className="pos-folio pos-folio--ambar">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="pos-spread">
                    <div className="pos-pagina">
                      <span className="pos-panel-sub pos-panel-sub--ambar">{tx("invitacion.saveTheDate.destino")} {deLugar("ceremonia").split(" ")[0]}</span>
                      <h2 className="pos-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <div className="pos-etiqueta-valija">
                      <span className="pos-ojal" aria-hidden="true" />
                      {ceremoniaHora && <div className="pos-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="pos-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="pos-folio pos-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="light" className="pos-panel pos-panel--crema">
                  <div className="pos-folio pos-folio--acento">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="pos-spread">
                    <div className="pos-pagina">
                      <span className="pos-panel-sub">{tx("invitacion.saveTheDate.destino")} {deLugar("llegar").split(" ")[0]}</span>
                      <h2 className="pos-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="pos-etiqueta-valija">
                      <span className="pos-ojal" aria-hidden="true" />
                      {embedMapUrl && (
                        <div className="pos-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="pos-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas")}<span>✈</span>
                      </a>
                    </div>
                  </div>
                  <div className="pos-folio pos-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="dark" className="pos-panel pos-panel--teal">
                  <div className="pos-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="pos-spread">
                    <div className="pos-pagina">
                      <span className="pos-panel-sub pos-panel-sub--blanco">{tx("invitacion.saveTheDate.destino")} {deLugar("cronograma").split(" ")[0]}</span>
                      <h2 className="pos-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="pos-etiqueta-valija">
                      <span className="pos-ojal" aria-hidden="true" />
                      {cronograma.map((item, i) => (
                        <div key={i} className="pos-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="pos-folio pos-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            La tarjeta de embarque: pliego verde azulado, el boarding pass
            blanco con la línea de troquel y el sello OK al confirmar. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="light" data-screen-label={tx("invitacion.rsvp.confirmar")} className="pos-section pos-checkin">
            <div className="pos-folio">
              <span data-xin="1" data-dist="-40">{nCheckin} — CHECK-IN</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="pos-spread">
              <div className="pos-pagina">
                <h2 data-xin="1" data-dist="-80" className="pos-h2">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><span className="pos-ambar">{tx("invitacion.rsvp.confirmaLinea2")}</span>
                </h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="pos-cupon">
                <span className="pos-troquel" aria-hidden="true"><span /><span /><span /></span>
                <CheckinPostal
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
            Postales del viaje: cada foto es una tarjeta que, al pasar por
            el centro, gira y muestra el dorso con la estampilla. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="pos-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="pos-pan-fijo pos-pan-fijo--album">
              <div data-strip="1" className="pos-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`pos-panel pos-panel--album${iHoja % 2 === 1 ? " pos-panel--album-b" : ""}`}>
                    <div className="pos-folio pos-folio--gris">
                      <span>{nAlbum} — {tx("invitacion.album.titulo").toUpperCase()}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="pos-h2 pos-h2--album">{tx("invitacion.saveTheDate.postalesDelViaje")}</h2>
                    <div className="pos-postales" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="pos-postal"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          <div data-card="1" className="pos-postal-carta">
                            <div className="pos-postal-frente">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="" loading="lazy" className="pos-postal-img" />
                              <span data-colorwash="1" className={`pos-bano pos-bano--${(i % 5) + 1}`} aria-hidden="true" />
                              <span className="pos-postal-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                            </div>
                            <div className="pos-postal-dorso" aria-hidden="true">
                              <div className="pos-postal-dorso-izq"><span>{[ciudad, anio].filter(Boolean).join(" · ").toUpperCase()}</span><span /><span /><span /></div>
                              <div className="pos-postal-dorso-der"><span className="pos-estampilla-chica" /><span /><span /></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pos-folio pos-folio--gris pos-folio--pie">
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
            El anuncio de abordo: sobre tinta, con el ecualizador de cinco
            barras y la lista en fichas. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="pos-section pos-musica">
            <div className="pos-folio pos-folio--ambar">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.musica.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="pos-spread">
              <div className="pos-pagina">
                <h2 data-xin="1" data-dist="-80" className="pos-h2">
                  {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "pos-ambar")}
                </h2>
                <div data-xin="1" data-delay="120" className="pos-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              </div>
              <div className="pos-pagina">
                <CancionesPostal
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            El fondo de viaje: tarjetas blancas con borde de tinta. */}
        {hayRegalos && (
          <section id="banco" data-tone="light" data-screen-label={tx("invitacion.regalos.titulo")} className="pos-section pos-regalos">
            <div className="pos-folio pos-folio--acento">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="pos-spread">
              <div className="pos-pagina">
                <h2 data-xin="1" data-dist="-80" className="pos-h2">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><span className="pos-teal">{tx("invitacion.regalos.siQueresLinea2")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="pos-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="pos-pagina">
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
            La declaración de aduana: pliego ámbar y opciones en blanco con
            borde de tinta. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="light" data-screen-label="Quiz" className="pos-section pos-quiz">
            <div className="pos-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="pos-spread">
              <TriviaPostal
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            La tarjeta de embarque final: talón lateral con texto vertical,
            código de barras, el QR chico y el asiento; al lado, el número
            de pase y los datos. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="pos-section pos-pase">
          <div className="pos-folio pos-folio--ambar">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="pos-spread">
            <div data-xin="1" data-dist="-60" className="pos-pagina pos-pagina--boarding">
              <div className="pos-boarding">
                <span className="pos-boarding-troquel" aria-hidden="true" />
                <span className="pos-boarding-talon">Boarding · {inicialesCortas} · {diaNum} {mesCorto}</span>
                <div className="pos-boarding-datos">
                  <div className="pos-boarding-etqs"><span>{tx("invitacion.saveTheDate.pasajero")}</span><span>{tx("invitacion.saveTheDate.asiento")}</span></div>
                  <div className="pos-boarding-fila"><span className="pos-boarding-nombre">{nombreInvitado || titulo}</span><span className="pos-boarding-asiento">{guest?.mesas?.[0] ?? pase}</span></div>
                  <CodigoDeBarras />
                  <span className="pos-boarding-codigo">{codigoDelPase}</span>
                </div>
                <div className="pos-boarding-qr">
                  <QrDeIngreso guest={guest as never} />
                </div>
              </div>
            </div>
            <div className="pos-pagina">
              <div data-xin="1" data-delay="100" className="pos-pase-cabeza">
                <div className="pos-pase-numero">
                  <span className="pos-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="pos-pase-mesa">
                    <span className="pos-folio-etq">{tx("invitacion.pase.tuMesa").toUpperCase()}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="pos-caja">
                <div className="pos-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="pos-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="pos-linea"><span>Sector</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="pos-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="pos-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="pos-pase-pie">
            <span className="pos-despedida">{tx("invitacion.saveTheDate.buenViaje")} {tx("invitacion.pase.losEsperamos")} — {iniciales(nombre1, nombre2)}</span>
            <div className="pos-folio pos-folio--ambar pos-folio--colofon">
              <span className="pos-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.bg} /></span>
              <span className="pos-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="pos-riel">
        <span ref={rielTopRef} className="pos-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="pos-riel-linea">
          <span ref={rielBarraRef} className="pos-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="pos-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          La postal de tapa: borde de correo aéreo, el mapa con las curvas
          de nivel, la ruta punteada con el avioncito recorriéndola, el
          nombre en Alfa Slab con el "&" como estampilla y el matasellos que
          cae encima. Es la bienvenida: dice de quién es la fiesta, cuándo,
          dónde y para cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="pos-portada">
        <div ref={escenaPortadaRef} className="pos-portada-hoja">
          <span className="pos-borde-aereo" aria-hidden="true" />
          <div className="pos-mapa-fondo" aria-hidden="true">
            <svg data-depth="0.5" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="pos-mapa-curvas">
              <g fill="none" stroke="currentColor" strokeWidth="1"><path d="M20 220 Q60 180 110 200 T200 190 T300 210 T380 190" /><path d="M40 100 Q90 130 150 110 T260 120 T360 90" /></g>
              <g fill="currentColor" opacity=".5"><circle cx="70" cy="205" r="2.5" /><circle cx="220" cy="188" r="2.5" /><circle cx="330" cy="205" r="2.5" /><circle cx="150" cy="112" r="2.5" /><circle cx="300" cy="105" r="2.5" /></g>
            </svg>
            <svg viewBox="0 0 430 300" preserveAspectRatio="none" className="pos-ruta">
              <path d="M -40 62 C 20 20, 60 20, 110 50 S 200 70, 260 30 S 380 10, 470 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="5 7" opacity=".7" />
              <circle cx="110" cy="50" r="3" className="pos-ruta-punto" /><circle cx="260" cy="30" r="3" className="pos-ruta-punto" />
            </svg>
            <svg viewBox="0 0 40 40" className="pos-avion">
              <path d="M38 20 C38 18.4 36.4 18.4 34 18.4 L23 18.4 L15 4 L11 4 L15.5 18.4 L9.5 18.4 L6.5 13 L4.5 13 L5.5 18.8 L3 20 L5.5 21.2 L4.5 27 L6.5 27 L9.5 21.6 L15.5 21.6 L11 36 L15 36 L23 21.6 L34 21.6 C36.4 21.6 38 21.6 38 20 Z" fill="currentColor" />
            </svg>
          </div>

          <div data-cl="1" className="pos-folio pos-folio--tapa">
            <span className="pos-chip-borde">{tx("invitacion.saveTheDate.vueloConfirmado")}</span>
            <span className="pos-chip-borde">Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="pos-tapa-centro">
            <span className="pos-tapa-kicker">{ciudad ? `${tx("invitacion.saveTheDate.saludosDesde")} ${ciudad}` : kickerDelEvento}</span>
            <h1 ref={cartelRef} className="pos-tapa-nombres" style={{ "--largo": renglonMasLargo } as React.CSSProperties}>
              <Matasellos texto={`${tx("invitacion.saveTheDate.correo").toUpperCase()} · ${diaNum} ${mesCorto} ${anio} · ${(ciudad || lugarNombre).toUpperCase()} · `} centro={inicialesCortas} pie={`${hora} H`} />
              {saludaAlInvitado ? (
                <span className="pos-tapa-linea"><span data-pieza="1">{nombreInvitado}</span></span>
              ) : (
                <>
                  <span className="pos-tapa-linea"><span data-pieza="1">{nombre1}</span></span>
                  {nombre2 && (
                    <>
                      <span className="pos-tapa-linea pos-tapa-linea--amp"><span data-pieza="1" className="pos-estampilla-amp">&amp;</span></span>
                      <span className="pos-tapa-linea"><span data-pieza="1">{nombre2}</span></span>
                    </>
                  )}
                </>
              )}
            </h1>
            <div className="pos-tapa-datos">
              <span>{tx("invitacion.saveTheDate.destino")}: {lugarNombre || "—"}<br /><span className="pos-acento">{[direccion, ciudad].filter(Boolean).join(" · ")}</span></span>
              <span className="pos-tapa-datos-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase")} Nº {pase}<br /><span className="pos-acento">{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</span></>
                  : <>{diaSemana} {diaNum}<br /><span className="pos-acento">{hora} h</span></>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="pos-tapa-pie">
            <p className="pos-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}. ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
            </p>
            <button type="button" onClick={abrir} className="pos-tapa-btn">
              {tx("invitacion.portada.abrirInvitacion")} ✈
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="pos-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="pos-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="pos-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="pos-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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
 * El matasellos: dos anillos con el texto en arco, las iniciales en el
 * centro y la hora debajo, con la tinta gastada (una máscara de puntos).
 * Cae sobre el nombre 1,6 s después de que entra la tapa.
 */
function Matasellos({ texto, centro, pie }: { texto: string; centro: string; pie: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <div data-matasellos="1" className="pos-matasellos" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <defs>
          <path id={`arc-${id}`} d="M50 50 m -36 0 a 36 36 0 1 1 72 0 a 36 36 0 1 1 -72 0" fill="none" />
          <pattern id={`gasto-${id}`} patternUnits="userSpaceOnUse" width="7" height="7"><circle cx="2" cy="3" r="1.4" fill="#000" /><circle cx="5.5" cy="6" r="1" fill="#000" /></pattern>
          <mask id={`mascara-${id}`}><rect width="100" height="100" fill="#fff" /><rect width="100" height="100" fill={`url(#gasto-${id})`} opacity=".55" /></mask>
        </defs>
        <g mask={`url(#mascara-${id})`}>
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="2" />
          <text className="pos-matasellos-arco"><textPath href={`#arc-${id}`}>{texto.repeat(3).slice(0, 44)}</textPath></text>
          <text x="50" y="47" textAnchor="middle" className="pos-matasellos-centro">{centro}</text>
          <text x="50" y="60" textAnchor="middle" className="pos-matasellos-pie">{pie}</text>
        </g>
      </svg>
    </div>
  );
}

/** El sello de visa del Save the Date: la fecha adentro de tres anillos. */
function SelloVisa({ arco, dia, mes, anio, admitido }: { arco: string; dia: string; mes: string; anio: string; admitido: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 200" className="pos-visa-sello" aria-hidden="true">
      <defs>
        <pattern id={`gasto-${id}`} patternUnits="userSpaceOnUse" width="7" height="7"><circle cx="2" cy="3" r="1.4" fill="#000" /><circle cx="5.5" cy="6" r="1" fill="#000" /></pattern>
        <path id={`arc-${id}`} d="M100 100 m -78 0 a 78 78 0 1 1 156 0 a 78 78 0 1 1 -156 0" fill="none" />
        <mask id={`mascara-${id}`}><rect width="200" height="200" fill="#fff" /><rect width="200" height="200" fill={`url(#gasto-${id})`} opacity=".45" /></mask>
      </defs>
      <g mask={`url(#mascara-${id})`} fill="none" stroke="currentColor"><circle cx="100" cy="100" r="94" strokeWidth="5" /><circle cx="100" cy="100" r="86" strokeWidth="1.5" /><circle cx="100" cy="100" r="62" strokeWidth="2" /></g>
      <g mask={`url(#mascara-${id})`}>
        <text className="pos-visa-arco"><textPath href={`#arc-${id}`}>{arco.repeat(3).slice(0, 56)}</textPath></text>
        <text x="100" y="92" textAnchor="middle" className="pos-visa-dia">{dia}</text>
        <text x="100" y="116" textAnchor="middle" className="pos-visa-mes">{mes}</text>
        <text x="100" y="140" textAnchor="middle" className="pos-visa-anio">{anio}</text>
        <rect x="66" y="150" width="68" height="12" fill="currentColor" /><text x="100" y="159.5" textAnchor="middle" className="pos-visa-admitido">{admitido}</text>
      </g>
    </svg>
  );
}

/** El código de barras del boarding pass: cuarenta barras. */
function CodigoDeBarras() {
  const barras = [[0, 3], [5, 1], [9, 2], [14, 4], [20, 1], [24, 3], [30, 2], [34, 1], [38, 4], [45, 2], [49, 1], [53, 3], [59, 1], [62, 4], [69, 2], [73, 1], [77, 3], [83, 2], [87, 4], [94, 1], [97, 3], [103, 1], [107, 2], [112, 4], [118, 1], [122, 3], [128, 2], [132, 1], [136, 4], [143, 2], [147, 1], [151, 3], [157, 1], [160, 4], [167, 2], [171, 1], [175, 3], [181, 2], [185, 4], [192, 1], [196, 3]];
  return (
    <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="pos-barras" aria-hidden="true">
      <g fill="currentColor">{barras.map(([x, w]) => <rect key={x} x={x} width={w} height="40" />)}</g>
    </svg>
  );
}
