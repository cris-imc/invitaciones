  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El masthead: una línea por nombre, la segunda alineada a la derecha con
  // el "&" chico en itálica y en el acento. El renglón más largo manda el
  // cuerpo, porque una didona no se parte.
  const renglones = saludaAlInvitado ? [nombreInvitado] : [nombre1, ...(nombre2 ? [nombre2] : [])];
  const renglonMasLargo = Math.max(5, ...renglones.map((n) => n.length));
  const totalLetras = Math.max(1, renglones.join("").replace(/\s/g, "").length);

  // La frase: el medio en itálica y en el acento, el cierre subrayado con un
  // filete de 3 px -- como una cita destacada de revista.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.7)) return "cou-subrayado";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "cou-acento";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const mesCorto = mesLargo.slice(0, 3);
  const fechaCodigo = `${anio} ${String(fechaEvento.getMonth() + 1).padStart(2, "0")} ${String(fechaEvento.getDate()).padStart(2, "0")} ${pase}`;

  // El sumario de la tapa interior: los pliegos que esta invitación tiene.
  const sumario = [
    { n: nSaveTheDate, t: tx("invitacion.saveTheDate.guardaLaFecha"), p: `${diaSemana.toLowerCase()} ${diaNum} ${tx("invitacion.evento.de")} ${mesLargo}` },
    { n: nCuando, t: tx("invitacion.ubicacion.cuandoYDonde"), p: lugarNombre || ciudad },
    ...(nCheckin ? [{ n: nCheckin, t: "Check-in", p: tx("invitacion.rsvp.confirmar") }] : []),
    { n: nPase, t: tx("invitacion.pase.tuPase"), p: guest?.mesas?.length ? `QR · ${tx("invitacion.pase.tuMesa")} ${guest.mesas[0]}` : "QR" },
  ];

  return (
    <div
      ref={raizRef}
      className={`${couSerif.variable} ${couSans.variable} cou-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_COU}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="cou-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            El sumario: el día enorme, el mes en itálica y en el acento, el
            índice de pliegos con filetes y la foto con su pie de foto. */}
        <section data-tone="light" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="cou-section cou-std">
          <div className="cou-folio">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">SUMARIO · {folio(nSaveTheDate)}</span>
          </div>
          <div className="cou-spread">
            <div className="cou-pagina">
              <div className="cou-fecha">
                <span data-xin="1" data-dist="-160" className="cou-fecha-dia">{diaNum}</span>
                <div className="cou-fecha-columna">
                  <span data-xin="1" data-dist="160" data-delay="120" className="cou-fecha-mes">{mesLargo}</span>
                  <span data-xin="1" data-dist="160" data-delay="240" className="cou-fecha-anio">{anio}</span>
                  <span data-xin="1" data-delay="360" className="cou-fecha-pie">{diaSemana} · {hora} H</span>
                </div>
              </div>
              <div data-xin="1" data-delay="400" className="cou-sumario">
                {sumario.map((s) => (
                  <div key={s.n} className="cou-sumario-fila">
                    <span><span className="cou-sumario-n">{s.n}</span><span className="cou-sumario-t">{s.t}</span></span>
                    <span className="cou-sumario-p">{s.p}</span>
                  </div>
                ))}
              </div>
              <AddToCalendarLink
                eventName={titulo}
                targetDate={fechaHora}
                location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                className="cou-cta cou-cta--chico"
                showIcon={false}
              >
                {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} <span className="cou-cta-flecha">↗</span>
              </AddToCalendarLink>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="cou-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only cou-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="11,11,11" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only cou-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="11,11,11" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --cou-punto. */}
                <span className="cou-foto-revelado" aria-hidden="true" />
                <span className="cou-foto-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
                <span className="cou-foto-pie">{[lugarNombre, ciudad].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            Pliego de tinta: cuatro renglones -- la etiqueta, una línea de
            puntos y la cifra -- y una marquesina en itálica abajo. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="cou-section cou-countdown">
          <div className="cou-folio">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="cou-spread">
            <div className="cou-pagina cou-pagina--entera">
              <CuentaCouture targetDate={fechaHora} />
            </div>
          </div>
          <div className="cou-marquesina" aria-hidden="true">
            <div className="cou-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[`${diaSemana.toLowerCase()} ${diaNum} ${tx("invitacion.evento.de")} ${mesLargo}`, lugarNombre, ciudad, dressCode].filter(Boolean).join(" — ")} —&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            La cita destacada: la comilla gigante en el acento detrás, la
            frase en Bodoni y la firma con un filete a la izquierda. */}
        {hayFrase && (
          <section data-tone="light" data-screen-label={tx("invitacion.frase.etiqueta")} className="cou-section cou-frase-seccion">
            <div className="cou-folio">
              <span data-xin="1" data-dist="-40">{nFrase} — EDITORIAL</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="cou-spread">
              <div className="cou-cita">
                <span className="cou-comilla" aria-hidden="true">“</span>
                <h2 ref={fraseRef} className="cou-frase">
                  {palabras.map((p, i) => (
                    // El espacio va fuera del span: el motor pone cada palabra
                    // en inline-block y un espacio adentro se colapsa a cero.
                    <span key={i}>
                      <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                    </span>
                  ))}
                </h2>
              </div>
              <div data-xin="1" data-delay="900" data-dist="60" className="cou-firma">
                <span className="cou-folio-etq">{tx("invitacion.frase.conAmor").toUpperCase()}</span>
                <span className="cou-firma-texto">{titulo}{ciudad ? `, ${ciudad}.` : "."}</span>
              </div>
            </div>
            <div className="cou-folio cou-folio--pie">
              <span>{titulo.toUpperCase()} · {mesLargo.toUpperCase()} {anio}</span>
              <span>PÁGINA {nFrase}</span>
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            La pasarela: un pliego por lugar, el salón sobre crema, la
            ceremonia sobre tinta, el cronograma sobre blanco. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="cou-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="cou-pan-fijo">
            <div data-strip="1" className="cou-tira">
              <div data-tone="light" className="cou-panel">
                <div className="cou-folio">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="cou-spread">
                  <div className="cou-pagina">
                    <span className="cou-panel-sub">{(lugarNombre || tx("invitacion.ubicacion.elLugar")).split(" ")[0]}</span>
                    <h2 className="cou-panel-titulo">{(lugarNombre || "").split(" ").slice(1).join(" ") || ciudad}</h2>
                  </div>
                  <div className="cou-lineas">
                    <div className="cou-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="cou-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="cou-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="cou-cta">
                        {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}<span className="cou-cta-flecha">→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="cou-folio cou-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="cou-panel">
                  <div className="cou-folio">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="cou-spread">
                    <div className="cou-pagina">
                      <span className="cou-panel-sub">{(ceremoniaNombre || ceremoniaTitulo).split(" ")[0]}</span>
                      <h2 className="cou-panel-titulo">{(ceremoniaNombre || "").split(" ").slice(1).join(" ") || ceremoniaTitulo}</h2>
                    </div>
                    <div className="cou-lineas">
                      {ceremoniaHora && <div className="cou-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="cou-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="cou-folio cou-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="light" className="cou-panel">
                  <div className="cou-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="cou-spread">
                    <div className="cou-pagina">
                      <span className="cou-panel-sub">{ciudad || lugarNombre}</span>
                      <h2 className="cou-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="cou-lineas">
                      {embedMapUrl && (
                        <div className="cou-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="cou-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas").toUpperCase()}<span className="cou-cta-flecha">→</span>
                      </a>
                    </div>
                  </div>
                  <div className="cou-folio cou-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="light" className="cou-panel cou-panel--blanco">
                  <div className="cou-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="cou-spread">
                    <div className="cou-pagina">
                      <span className="cou-panel-sub">{tx("invitacion.ubicacion.cronograma")}</span>
                      <h2 className="cou-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="cou-lineas">
                      {cronograma.map((item, i) => (
                        <div key={i} className="cou-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="cou-folio cou-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            La tarjeta de suscripción: blanca, con filete, el punto de
            estado parpadeando y el sello "sí" que cae al confirmar. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="light" data-screen-label={tx("invitacion.rsvp.confirmar")} className="cou-section cou-checkin">
            <div className="cou-folio">
              <span data-xin="1" data-dist="-40">{nCheckin} — CHECK-IN</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="cou-spread">
              <div className="cou-pagina">
                <span data-xin="1" className="cou-panel-sub">{tx("invitacion.rsvp.confirmaLinea1")}</span>
                <h2 data-xin="1" data-dist="-80" className="cou-h2">{tx("invitacion.rsvp.confirmaLinea2")}</h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="cou-cupon">
                <CheckinCouture
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
            La sesión de tapa: hoja de contactos de seis columnas con
            filete, y el baño de color que se enciende al pasar. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="cou-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="cou-pan-fijo cou-pan-fijo--album">
              <div data-strip="1" className="cou-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`cou-panel cou-panel--album${iHoja % 2 === 1 ? " cou-panel--album-b" : ""}`}>
                    <div className="cou-folio">
                      <span>{nAlbum} — {tx("invitacion.album.titulo").toUpperCase()}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="cou-h2 cou-h2--album">
                      {tx("invitacion.album.titulo")} <span className="cou-italica">{tx("invitacion.album.deFotos")}</span>
                    </h2>
                    <div className="cou-contactos" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="cou-contacto"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="cou-contacto-img" />
                          <span data-colorwash="1" className={`cou-bano cou-bano--${(i % 5) + 1}`} aria-hidden="true" />
                          <span className="cou-contacto-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="cou-folio cou-folio--pie">
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
            La banda sonora: pliego de tinta, "Lado A" en itálica y la
            lista como un tracklist con filetes. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="cou-section cou-musica">
            <div className="cou-folio">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.musica.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="cou-spread">
              <div className="cou-pagina">
                <span data-xin="1" className="cou-panel-sub">Lado A</span>
                <h2 data-xin="1" data-dist="-80" className="cou-h2">{tx("invitacion.sabor.preguntaCancionFaltar")}</h2>
                <div data-xin="1" data-delay="120" className="cou-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              </div>
              <div className="cou-pagina">
                <CancionesCouture
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Los créditos: fichas blancas con filete. */}
        {hayRegalos && (
          <section id="banco" data-tone="light" data-screen-label={tx("invitacion.regalos.titulo")} className="cou-section cou-regalos">
            <div className="cou-folio">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="cou-spread">
              <div className="cou-pagina">
                <span data-xin="1" className="cou-panel-sub">{tx("invitacion.regalos.siQueresLinea1")}</span>
                <h2 data-xin="1" data-dist="-80" className="cou-h2">{tx("invitacion.regalos.siQueresLinea2")}</h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="cou-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="cou-pagina">
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
            El cuestionario: el único pliego entero en el acento, con las
            opciones en Bodoni y filete blanco. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="light" data-screen-label="Quiz" className="cou-section cou-quiz">
            <div className="cou-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="cou-spread">
              <TriviaCouture
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            La contratapa: el QR sobre un cuadrado de papel, el número de
            pase enorme, el sello de la mesa girando y el colofón. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="cou-section cou-pase">
          <div className="cou-folio">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">CONTRATAPA · {folio(nPase)}</span>
          </div>
          <div className="cou-spread">
            <div data-xin="1" data-dist="-60" className="cou-pagina cou-pagina--qr">
              <div className="cou-qr">
                <QrDeIngreso guest={guest as never} />
                <span className="cou-qr-etq">{tx("invitacion.pase.tuPase").toUpperCase()}</span>
              </div>
            </div>
            <div className="cou-pagina">
              <div data-xin="1" data-delay="100" className="cou-pase-cabeza">
                <div className="cou-pase-numero">
                  <span className="cou-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                <SelloCouture
                  texto={`${(nombreInvitado || titulo).toUpperCase()} · ${lugaresDelPase} ${tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas").toUpperCase()} · `}
                  centro={guest?.mesas?.[0] ?? pase}
                />
              </div>
              <div data-xin="1" data-delay="160" className="cou-lineas cou-lineas--pase">
                <div className="cou-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="cou-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="cou-linea"><span>{tx("invitacion.pase.tuMesa")}</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="cou-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="cou-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="cou-pase-pie">
            <span className="cou-despedida">{tx("invitacion.pase.losEsperamos")} {iniciales(nombre1, nombre2)}</span>
            <div className="cou-folio cou-folio--colofon">
              <span className="cou-credito">COLOFÓN · <LogoFooterCredit bgColor="transparent" textColor={PALETA.bg} /></span>
              <span className="cou-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="cou-riel">
        <span ref={rielTopRef} className="cou-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="cou-riel-linea">
          <span ref={rielBarraRef} className="cou-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="cou-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          La tapa de la revista y, a la vez, la bienvenida: cabecera con
          número y edición, el masthead con los nombres, la foto con el
          recuadro "en esta edición" y el sello del pase, y abajo el mensaje
          con el código de barras. */}
      <div ref={portadaRef} data-tone={TONO} className="cou-portada">
        <div ref={escenaPortadaRef} className="cou-portada-hoja">
          <div data-cl="1" className="cou-cabecera">
            <span>Nº {pase} · {mesLargo.toUpperCase()} {anio}</span>
            <span className="cou-cabecera-edicion">{kickerDelEvento}</span>
            <span>{[lugarNombre, ciudad].filter(Boolean).join(" · ").toUpperCase() || `${diaSemana} · ${hora} H`}</span>
          </div>

          <div data-cl="2" className="cou-tapa-cuerpo">
            <h1 ref={cartelRef} className="cou-masthead" style={{ "--largo": renglonMasLargo, "--n": totalLetras } as React.CSSProperties}>
              {saludaAlInvitado ? (
                <span className="cou-masthead-linea"><span data-pieza="1"><Letras texto={nombreInvitado} desde={0} /></span></span>
              ) : (
                <>
                  <span className="cou-masthead-linea"><span data-pieza="1"><Letras texto={nombre1} desde={0} /></span></span>
                  {nombre2 && (
                    <span className="cou-masthead-linea cou-masthead-linea--der">
                      <span data-pieza="1"><span className="cou-amp">&amp;</span><Letras texto={nombre2} desde={nombre1.replace(/\s/g, "").length} /></span>
                    </span>
                  )}
                </>
              )}
            </h1>
            <div className="cou-tapa-foto">
              {hayFoto && fotoMobile && (
                <div className="acp-mobile-only cou-foto-capa">
                  <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="11,11,11" />
                </div>
              )}
              {hayFoto && fotoDesktop && (
                <div className="acp-desktop-only cou-foto-capa">
                  <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="11,11,11" />
                </div>
              )}
              <span className="cou-tapa-trama" aria-hidden="true" />
              <span className="cou-tapa-foto-etq">{hayFoto ? tx("invitacion.album.nuestraFoto").toUpperCase() : titulo.toUpperCase()}</span>
              <div className="cou-edicion">
                <span className="cou-folio-etq">{tx("invitacion.saveTheDate.enEstaEdicion").toUpperCase()}</span>
                <span className="cou-edicion-titulo">{diaSemana.charAt(0) + diaSemana.slice(1).toLowerCase()} {diaNum} {tx("invitacion.evento.de")} {mesLargo}{lugarNombre ? `, ${lugarNombre}` : ""}</span>
                <span className="cou-edicion-pie">{[ciudad, `${hora} h`].filter(Boolean).join(", ")}</span>
              </div>
              <div className="cou-tapa-sello">
                <SelloCouture
                  texto={`${kickerDelEvento.toUpperCase()} · ${isPersonalized && guest ? `${tx("invitacion.pase.pase").toUpperCase()} Nº ${pase} · ${lugaresDelPase} ${tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas").toUpperCase()}` : `${diaNum} ${mesCorto.toUpperCase()} ${anio}`} · `}
                  centro={isPersonalized && guest ? pase.replace(/^0+/, "") || pase : diaNum}
                  relleno
                />
              </div>
            </div>
          </div>

          <div data-cl="3" className="cou-tapa-pie">
            <div className="cou-tapa-pie-texto">
              <p className="cou-tapa-mensaje">
                {saludaAlInvitado
                  ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}. ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                  : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
              </p>
              <button type="button" onClick={abrir} className="cou-tapa-btn">
                <span>{tx("invitacion.portada.abrirInvitacion").toUpperCase()}</span><span className="cou-cta-flecha">→</span>
              </button>
            </div>
            <CodigoDeBarras texto={fechaCodigo} />
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="cou-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="cou-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="cou-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="cou-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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

/** "V & T": las iniciales de la despedida de la contratapa. */
function iniciales(a: string, b: string): string {
  const i = (s: string) => (s.trim()[0] || "").toUpperCase();
  return b ? `${i(a)} & ${i(b)}` : i(a);
}

/**
 * El masthead letra por letra: cada tanto una se corre 20-40 px y vuelve,
 * como plomo suelto en la caja. El CSS escalona el turno de cada letra.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="cou-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
      )}
    </>
  );
}

/**
 * El sello circular: un anillo con el texto siguiendo la circunferencia,
 * girando, y un número en itálica en el centro. En la tapa va relleno de
 * papel (sobre la foto); en la contratapa es sólo el anillo en el acento.
 */
function SelloCouture({ texto, centro, relleno = false }: { texto: string; centro: string; relleno?: boolean }) {
  // El id del arco tiene que ser único por instancia: dos <textPath> que
  // apuntan al mismo id hacen que el segundo no se dibuje.
  const id = useId().replace(/:/g, "");
  return (
    <div className={`cou-sello-circular${relleno ? " cou-sello-circular--relleno" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <defs>
          <path id={`arc-${id}`} d="M50 50 m -36 0 a 36 36 0 1 1 72 0 a 36 36 0 1 1 -72 0" fill="none" />
        </defs>
        <circle cx="50" cy="50" r="48.5" fill={relleno ? "var(--pp-bg)" : "none"} stroke="currentColor" strokeWidth="1.5" />
        <text>
          <textPath href={`#arc-${id}`}>{texto.repeat(3).slice(0, 62)}</textPath>
        </text>
      </svg>
      <span className="cou-sello-centro">{centro}</span>
    </div>
  );
}

/** El código de barras de la tapa: 17 barras y la fecha con el pase debajo. */
function CodigoDeBarras({ texto }: { texto: string }) {
  const barras = [[0, 2], [4, 1], [7, 3], [12, 1], [15, 2], [19, 1], [22, 3], [27, 2], [31, 1], [34, 3], [39, 1], [42, 2], [46, 1], [49, 3], [54, 2], [58, 1], [61, 3]];
  return (
    <svg width="64" height="50" viewBox="0 0 64 50" className="cou-barras" aria-hidden="true">
      <g fill="currentColor">
        {barras.map(([x, w]) => <rect key={x} x={x} y="0" width={w} height="40" />)}
      </g>
      <text x="32" y="49" textAnchor="middle">{texto}</text>
    </svg>
  );
}
