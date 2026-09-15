  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre va en bloques sobre fondo crema, uno por renglón; el más largo
  // manda el cuerpo (Jost es geométrica y no se parte).
  const renglones = saludaAlInvitado ? [nombreInvitado] : [nombre1, ...(nombre2 ? [nombre2] : [])];
  const renglonMasLargo = Math.max(5, ...renglones.map((n) => n.length));
  const totalLetras = Math.max(1, renglones.join("").replace(/\s/g, "").length);

  // La frase: el medio en negro sobre amarillo (invertido) y el cierre sobre
  // un bloque crema.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.7)) return "bau-bloque";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "bau-invertido";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const mesCorto = mesLargo.slice(0, 3);

  return (
    <div
      ref={raizRef}
      className={`${bauSerif.variable} ${bauSans.variable} bau-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_BAU}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="bau-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            Inversión en negro: un círculo azul, un semicírculo amarillo, la
            fecha en tres renglones y la foto con la esquina redonda. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="bau-section bau-std">
          <span className="bau-forma bau-std-circulo" aria-hidden="true" />
          <span className="bau-forma bau-std-medio" aria-hidden="true" />
          <div className="bau-folio">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
          </div>
          <div className="bau-spread">
            <div className="bau-pagina">
              <div className="bau-fecha">
                <span data-xin="1" data-dist="-160" className="bau-fecha-linea bau-fecha-linea--dia">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="bau-fecha-linea bau-fecha-linea--mes">{mesCorto}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="bau-fecha-linea bau-fecha-linea--anio">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="bau-fecha-pie">
                <span>{diaSemana} · {hora} H</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="bau-chip bau-chip--claro"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()} →
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="bau-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only bau-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="17,17,17" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only bau-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="17,17,17" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --bau-punto. */}
                <span className="bau-foto-revelado" aria-hidden="true" />
                <span className="bau-foto-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
                <span className="bau-foto-cuadrado" aria-hidden="true" />
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            La retícula: cuatro módulos de color con una junta negra de 3 px,
            cada uno con una forma asomando, entre dos marquesinas. */}
        <section data-tone="light" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="bau-section bau-countdown">
          <div className="bau-folio">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="bau-marquesina bau-marquesina--negra" aria-hidden="true">
            <div className="bau-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.cuentaRegresiva.dias")} ● {tx("invitacion.cuentaRegresiva.horas")} ■ {tx("invitacion.cuentaRegresiva.minutos")} ▲ {tx("invitacion.cuentaRegresiva.segundos")} ● {diaSemana.toLowerCase()} {diaNum} {tx("invitacion.evento.de")} {mesLargo} ■&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="bau-spread">
            <div className="bau-pagina bau-pagina--entera">
              <CuentaBauhaus targetDate={fechaHora} />
            </div>
          </div>
          <div className="bau-marquesina bau-marquesina--filete bau-marquesina--contraria" aria-hidden="true">
            <div className="bau-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, `${hora} h`, dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            Pliego amarillo: un cuarto rojo arriba a la derecha, el disco azul
            que pendula abajo y la frase con palabras en bloque. */}
        {hayFrase && (
          <section data-tone="light" data-screen-label={tx("invitacion.frase.etiqueta")} className="bau-section bau-frase-seccion">
            <span className="bau-forma bau-frase-cuarto" aria-hidden="true" />
            <span className="bau-forma bau-frase-pendulo" aria-hidden="true" />
            <div className="bau-folio">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.frase.unasPalabras").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="bau-spread">
              <h2 ref={fraseRef} className="bau-frase">
                {palabras.map((p, i) => (
                  // El espacio va fuera del span: el motor pone cada palabra
                  // en inline-block y un espacio adentro se colapsa a cero.
                  <span key={i}>
                    <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                  </span>
                ))}
              </h2>
              <div data-xin="1" data-delay="900" data-dist="60" className="bau-firma">
                <span className="bau-forma bau-forma--circulo bau-firma-punto" aria-hidden="true" />
                <span>{tx("invitacion.frase.conAmor")} · {titulo}{ciudad ? `, ${ciudad}.` : "."}</span>
              </div>
            </div>
            <div className="bau-folio bau-folio--pie">
              <span>{titulo.toUpperCase()}</span>
              <span className="bau-barra" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Un módulo por lugar, cada uno con su color de fondo y una forma
            grande en la esquina: crema y cuarto amarillo, azul y círculo
            rojo, amarillo y semicírculo negro. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="bau-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="bau-pan-fijo">
            <div data-strip="1" className="bau-tira">
              <div data-tone="light" className="bau-panel bau-panel--crema">
                <span className="bau-forma bau-panel-forma" aria-hidden="true" />
                <div className="bau-folio">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="bau-spread">
                  <div className="bau-pagina">
                    <span className="bau-panel-sub">Módulo {deLugar("recepcion").split(" ")[0]}</span>
                    <h2 className="bau-panel-titulo">{lugarNombre || ciudad}</h2>
                  </div>
                  <div className="bau-tarjeta-lugar">
                    <div className="bau-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="bau-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="bau-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="bau-cta">
                        {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}<span>→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="bau-folio bau-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="bau-panel bau-panel--azul">
                  <span className="bau-forma bau-panel-forma" aria-hidden="true" />
                  <div className="bau-folio">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="bau-spread">
                    <div className="bau-pagina">
                      <span className="bau-panel-sub">Módulo {deLugar("ceremonia").split(" ")[0]}</span>
                      <h2 className="bau-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <div className="bau-tarjeta-lugar bau-tarjeta-lugar--negra">
                      {ceremoniaHora && <div className="bau-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="bau-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="bau-folio bau-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="light" className="bau-panel bau-panel--crema2">
                  <span className="bau-forma bau-panel-forma" aria-hidden="true" />
                  <div className="bau-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="bau-spread">
                    <div className="bau-pagina">
                      <span className="bau-panel-sub">Módulo {deLugar("llegar").split(" ")[0]}</span>
                      <h2 className="bau-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="bau-tarjeta-lugar">
                      {embedMapUrl && (
                        <div className="bau-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="bau-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas").toUpperCase()}<span>→</span>
                      </a>
                    </div>
                  </div>
                  <div className="bau-folio bau-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="light" className="bau-panel bau-panel--amarillo">
                  <span className="bau-forma bau-panel-forma" aria-hidden="true" />
                  <div className="bau-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="bau-spread">
                    <div className="bau-pagina">
                      <span className="bau-panel-sub">Módulo {deLugar("cronograma").split(" ")[0]}</span>
                      <h2 className="bau-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="bau-tarjeta-lugar">
                      {cronograma.map((item, i) => (
                        <div key={i} className="bau-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="bau-folio bau-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            El formulario en retícula: un anillo azul detrás, la tarjeta
            blanca con borde de 3 px y el sello "SÍ" al confirmar. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="light" data-screen-label={tx("invitacion.rsvp.confirmar")} className="bau-section bau-checkin">
            <span className="bau-forma bau-checkin-anillo" aria-hidden="true" />
            <div className="bau-folio">
              <span data-xin="1" data-dist="-40">{nCheckin} — CHECK-IN</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="bau-spread">
              <div className="bau-pagina">
                <h2 data-xin="1" data-dist="-80" className="bau-h2">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><span className="bau-rojo">{tx("invitacion.rsvp.confirmaLinea2")}</span>
                </h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="bau-cupon">
                <CheckinBauhaus
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
            La retícula de fotos: junta negra de 3 px y una esquina redonda
            distinta en cada módulo. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="bau-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="bau-pan-fijo bau-pan-fijo--album">
              <div data-strip="1" className="bau-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`bau-panel bau-panel--album${iHoja % 2 === 1 ? " bau-panel--album-b" : ""}`}>
                    <div className="bau-folio">
                      <span>{nAlbum} — {tx("invitacion.album.titulo").toUpperCase()}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") }).toUpperCase()} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="bau-h2 bau-h2--album">{tx("invitacion.album.titulo")} <span className="bau-rojo">{tx("invitacion.album.deFotos")}</span></h2>
                    <div className="bau-reticula" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="bau-modulo-foto"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="bau-modulo-foto-img" />
                          <span data-colorwash="1" className={`bau-bano bau-bano--${(i % 5) + 1}`} aria-hidden="true" />
                          <span className="bau-modulo-foto-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bau-folio bau-folio--pie">
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
            Pliego azul con un círculo amarillo, el ecualizador de barras
            anchas y la lista en módulos negros con viñeta geométrica. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="bau-section bau-musica">
            <span className="bau-forma bau-musica-circulo" aria-hidden="true" />
            <div className="bau-folio">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.musica.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="bau-spread">
              <div className="bau-pagina">
                <h2 data-xin="1" data-dist="-80" className="bau-h2">{tx("invitacion.sabor.preguntaCancionFaltar")}</h2>
                <div data-xin="1" data-delay="120" className="bau-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              </div>
              <div className="bau-pagina">
                <CancionesBauhaus
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Pliego crema con una media píldora roja, y las cuentas en
            módulos blancos con borde de 3 px. */}
        {hayRegalos && (
          <section id="banco" data-tone="light" data-screen-label={tx("invitacion.regalos.titulo")} className="bau-section bau-regalos">
            <span className="bau-forma bau-regalos-pildora" aria-hidden="true" />
            <div className="bau-folio">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="bau-spread">
              <div className="bau-pagina">
                <h2 data-xin="1" data-dist="-80" className="bau-h2">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><span className="bau-azul">{tx("invitacion.regalos.siQueresLinea2")}</span>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="bau-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="bau-pagina bau-pagina--junta">
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
            Pliego rojo con un disco negro abajo; las opciones son módulos
            crema con su forma de viñeta. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="dark" data-screen-label="Quiz" className="bau-section bau-quiz">
            <span className="bau-forma bau-quiz-disco" aria-hidden="true" />
            <div className="bau-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="bau-spread">
              <TriviaBauhaus
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            Pliego negro con un cuarto amarillo; el QR sobre un cuadrado
            crema con la esquina redonda, el pase en amarillo, la mesa en
            rojo y las tres formas como firma. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="bau-section bau-pase">
          <span className="bau-forma bau-pase-cuarto" aria-hidden="true" />
          <div className="bau-folio">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="bau-spread">
            <div data-xin="1" data-dist="-60" className="bau-pagina bau-pagina--qr">
              <div className="bau-qr">
                <QrDeIngreso guest={guest as never} />
                <span className="bau-qr-etq">{tx("invitacion.pase.tuPase").toUpperCase()}</span>
              </div>
            </div>
            <div className="bau-pagina">
              <div data-xin="1" data-delay="100" className="bau-pase-cabeza">
                <div className="bau-pase-numero">
                  <span className="bau-folio-etq">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="bau-pase-mesa">
                    <span className="bau-folio-etq">{tx("invitacion.pase.tuMesa").toUpperCase()}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="bau-lineas-pase">
                <div className="bau-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="bau-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="bau-linea"><span>Sector</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="bau-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="bau-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="bau-pase-pie">
            <div className="bau-despedida">
              <span className="bau-forma bau-forma--circulo bau-despedida-forma bau-despedida-forma--azul" aria-hidden="true" />
              <span className="bau-forma bau-forma--cuadrado bau-despedida-forma bau-despedida-forma--rojo" aria-hidden="true" />
              <span className="bau-triangulo" aria-hidden="true" />
              <span className="bau-despedida-texto">{tx("invitacion.pase.losEsperamos")} · {iniciales(nombre1, nombre2)}</span>
            </div>
            <div className="bau-folio bau-folio--colofon">
              <span className="bau-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.bg} /></span>
              <span className="bau-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.portada.verAperturaOtraVez").toUpperCase()} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="bau-riel">
        <span ref={rielTopRef} className="bau-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="bau-riel-linea">
          <span ref={rielBarraRef} className="bau-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="bau-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          La composición: cinco formas de color sobre una grilla de 4×6,
          cada una a su profundidad, y el nombre en bloques crema encima.
          Es la bienvenida: dice de quién es la fiesta, cuándo, dónde y para
          cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="bau-portada">
        <div ref={escenaPortadaRef} className="bau-portada-hoja">
          <div className="bau-composicion" aria-hidden="true">
            <span data-drift="14" data-depth="0.8" className="bau-forma bau-comp-1" />
            <span data-drift="-10" data-depth="-0.6" className="bau-forma bau-comp-2" />
            <span data-drift="20" data-depth="1.1" className="bau-forma bau-comp-3" />
            <span data-drift="-6" data-depth="-0.3" className="bau-forma bau-comp-4" />
            <span data-drift="8" data-depth="0.5" className="bau-forma bau-comp-5" />
          </div>

          <div data-cl="1" className="bau-folio bau-folio--tapa">
            <span>{kickerDelEvento}</span>
            <span>Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="bau-tapa-centro">
            <span className="bau-chip bau-chip--fecha">{diaSemana} {diaNum} · {String(fechaEvento.getMonth() + 1).padStart(2, "0")} · {anio}</span>
            <h1 ref={cartelRef} className="bau-tapa-nombres" style={{ "--largo": renglonMasLargo, "--n": totalLetras } as React.CSSProperties}>
              {saludaAlInvitado ? (
                <span className="bau-tapa-linea"><span data-pieza="1" className="bau-tapa-bloque"><Letras texto={nombreInvitado} desde={0} /></span></span>
              ) : (
                <>
                  <span className="bau-tapa-linea"><span data-pieza="1" className="bau-tapa-bloque"><Letras texto={nombre1} desde={0} /></span></span>
                  {nombre2 && (
                    <span className="bau-tapa-linea">
                      <span data-pieza="1" className="bau-tapa-bloque bau-tapa-bloque--punto"><span className="bau-forma bau-forma--circulo bau-tapa-punto" aria-hidden="true" /><Letras texto={nombre2} desde={nombre1.replace(/\s/g, "").length} /></span>
                    </span>
                  )}
                </>
              )}
            </h1>
            <div className="bau-chip bau-chip--datos">
              <span>{lugarNombre || "—"}<br />{[direccion, ciudad].filter(Boolean).join(" · ")}</span>
              <span className="bau-chip-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase")} Nº {pase}<br />{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</>
                  : <>{hora} h<br />{fechaPuntos}</>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="bau-tapa-pie">
            <p className="bau-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}. ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
            </p>
            <button type="button" onClick={abrir} className="bau-tapa-btn">
              <span>{tx("invitacion.portada.abrirInvitacion").toUpperCase()}</span><span className="bau-forma bau-forma--circulo bau-tapa-btn-punto" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="bau-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="bau-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="bau-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="bau-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {musicaHabilitada && audioDeFondo}
      {montado && isPersonalized && guest && portadaAbierta && (
        <BurbujaPase acento={PALETA.acc3} guest={guest} />
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
 * El nombre letra por letra: cada tanto una gira 90° sobre su eje vertical
 * y vuelve, como una placa. El CSS escalona el turno de cada letra.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="bau-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
      )}
    </>
  );
}
