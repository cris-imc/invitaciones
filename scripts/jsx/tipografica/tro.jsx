  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre como etiqueta de bebida: un renglón en Lilita One, centrado;
  // con dos personas, uno por renglón y el cuerpo baja a .72em.
  const renglones = saludaAlInvitado ? [nombreInvitado] : [nombre1, ...(nombre2 ? [nombre2] : [])];
  const renglonMasLargo = Math.max(4, ...renglones.map((n) => n.length));
  const nombreLargo = renglones.length > 1 || renglonMasLargo > 11;
  const totalLetras = Math.max(1, renglones.join("").replace(/\s/g, "").length);

  // La frase: una palabra del medio en el acento y el cierre en el sol.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.8)) return "tro-sol";
    if (i === Math.min(desdeAcento, n - 1) || i === Math.floor(n * 0.3)) return "tro-acento";
    return undefined;
  };

  const esXV = invitation.tipo === "QUINCE_ANOS";
  const esBoda = invitation.tipo === "CASAMIENTO";
  const kickerDelEvento = tx(esBoda ? "invitacion.evento.nosCasamos" : esXV ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const cintaDelEvento = esXV ? `15 ${tx("invitacion.saveTheDate.anios")} ☼ ${tx("invitacion.saveTheDate.tropical")}` : `${anio} ☼ ${tx("invitacion.saveTheDate.tropical")}`;
  const firma = esXV ? nombre1.trim().split(/\s+/)[0] : iniciales(nombre1, nombre2);
  // Cada lugar es un parador numerado según el orden real de los paneles.
  const parador = (clave: string) => `${tx("invitacion.saveTheDate.parador")} ${Math.max(0, panelesLugar.indexOf(clave)) + 1}`;
  // Las olas: un path de 120×22 repetido al doble de ancho que corre 120 px
  // y vuelve a empezar sin costura.
  const Ola = ({ clase, arriba = false }: { clase: string; arriba?: boolean }) => (
    <span className={`tro-ola ${clase}`} aria-hidden="true">
      <svg viewBox="0 0 120 22" preserveAspectRatio="none"><path d={arriba ? "M0 11 Q15 0 30 11 T60 11 T90 11 T120 11 T150 11 T180 11 T210 11 T240 11 V0 H0 Z" : "M0 11 Q15 0 30 11 T60 11 T90 11 T120 11 T150 11 T180 11 T210 11 T240 11 V22 H0 Z"} /></svg>
    </span>
  );
  const FRONDA = "M0,0 C 10,-14 30,-14 46,-4 C 58,4 64,16 62,30 C 52,20 40,14 28,12 C 34,20 36,26 34,30 C 22,22 10,12 0,0 Z";
  const NERVIO = "M2,-1 C 20,-6 40,-2 58,20";
  const FRONDAS: [number, number][] = [[-158, 0.94], [-128, 1.01], [-98, 1.08], [-68, 1.15], [-38, 1.08], [-8, 1.01], [22, 0.94]];
  const ESTRELLA = "30,2 37,22 58,23 41,36 47,57 30,45 13,57 19,36 2,23 23,22";

  return (
    <div
      ref={raizRef}
      className={`${troSerif.variable} ${troSans.variable} tro-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_TRO}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="tro-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            Etiqueta de botella: sobre arena con la ola del mar arriba, la
            fecha en Lilita a tres colores y la foto con marco blanco,
            sombra de mar y el código de barras en la esquina. */}
        <section data-tone="light" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="tro-section tro-std">
          <Ola clase="tro-ola--std" arriba />
          <div className="tro-folio tro-folio--acento">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.guardaLaFecha")}</span>
            <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
          </div>
          <div className="tro-spread">
            <div className="tro-pagina">
              <div className="tro-fecha">
                <span data-xin="1" data-dist="-160" className="tro-fecha-linea tro-fecha-linea--dia">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="tro-fecha-linea tro-fecha-linea--mes">{mesLargo}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="tro-fecha-linea tro-fecha-linea--anio">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="tro-fecha-pie">
                <span>{diaSemana} · {hora} h</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="tro-pildora tro-pildora--tinta"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario")} ☼
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="tro-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only tro-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="44,58,74" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only tro-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="44,58,74" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --tro-punto. */}
                <span className="tro-foto-revelado" aria-hidden="true" />
                <span className="tro-foto-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
                <span className="tro-barras" aria-hidden="true">
                  {[2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1].map((w, i) => <span key={i} style={{ width: w }} />)}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            El radiocasete: sobre el mar, la caja de tinta con asa, cuatro
            displays de color y dos parlantes girando, entre dos
            marquesinas inclinadas. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="tro-section tro-countdown">
          <div className="tro-folio">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.cuentaRegresiva.faltan")}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="tro-marquesina tro-marquesina--sol" aria-hidden="true">
            <div className="tro-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.cuentaRegresiva.dias")} ☼ {tx("invitacion.cuentaRegresiva.horas")} ☼ {tx("invitacion.cuentaRegresiva.minutos")} ☼ {tx("invitacion.cuentaRegresiva.segundos")} ☼ {diaNum} {tx("invitacion.evento.de")} {mesLargo} ☼&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="tro-spread">
            <div className="tro-pagina tro-pagina--entera">
              <div className="tro-radio">
                <span className="tro-radio-asa" aria-hidden="true" />
                <CuentaTropical targetDate={fechaHora} />
                <div className="tro-radio-pie" aria-hidden="true">
                  <span className="tro-parlante" /><span className="tro-radio-etq">Play ▶ {tx("invitacion.saveTheDate.hastaLaFiesta")}</span><span className="tro-parlante" />
                </div>
              </div>
            </div>
          </div>
          <div className="tro-marquesina tro-marquesina--blanca tro-marquesina--contraria" aria-hidden="true">
            <div className="tro-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, `${hora} h`, dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            Escrito en la arena: grano de arena de fondo, la frase en Lilita
            con sombra de mar y la pastilla con la estrella de mar. */}
        {hayFrase && (
          <section data-tone="light" data-screen-label={tx("invitacion.frase.etiqueta")} className="tro-section tro-frase-seccion">
            <span className="tro-grano" aria-hidden="true" />
            <div className="tro-folio tro-folio--acento">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.saveTheDate.escritoEnLaArena")}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="tro-spread">
              <h2 ref={fraseRef} className="tro-frase">
                {palabras.map((p, i) => (
                  // El espacio va fuera del span: el motor pone cada palabra
                  // en inline-block y un espacio adentro se colapsa a cero.
                  <span key={i}>
                    <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                  </span>
                ))}
              </h2>
              <div data-xin="1" data-delay="900" data-dist="60" className="tro-pastilla">
                <svg viewBox="0 0 60 60" className="tro-pastilla-estrella" aria-hidden="true"><polygon points={ESTRELLA} /></svg>
                <span>{tx("invitacion.frase.conAmor")} · {titulo}</span>
              </div>
            </div>
            <div className="tro-folio tro-folio--pie">
              <span>{titulo}{esXV ? " · XV" : ""}</span>
              <span className="tro-barra" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Los paradores: cielo, arena y mar, cada uno con su ola abajo,
            el título en Lilita con sombra de color y la ficha blanca. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="tro-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="tro-pan-fijo">
            <div data-strip="1" className="tro-tira">
              <div data-tone="light" className="tro-panel tro-panel--cielo">
                <Ola clase="tro-ola--panel" />
                <div className="tro-folio">
                  <span>{nCuando} — {tx("invitacion.ubicacion.elSalon")}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="tro-spread">
                  <div className="tro-pagina tro-pagina--titulo">
                    <span className="tro-panel-sub">{parador("recepcion")}</span>
                    <h2 className="tro-panel-titulo">{lugarNombre || tx("invitacion.ubicacion.elLugar")}</h2>
                  </div>
                  <div className="tro-ficha">
                    <div className="tro-linea"><span>{tx("invitacion.ubicacion.recepcion")}</span><span>{hora} h</span></div>
                    {direccion && <div className="tro-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="tro-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="tro-cta">
                        {tx("invitacion.ubicacion.comoLlegar")}<span>→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="tro-folio tro-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ")}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza")} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="light" className="tro-panel tro-panel--arena">
                  <Ola clase="tro-ola--panel" />
                  <div className="tro-folio">
                    <span>{nCuando} — {ceremoniaTitulo}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="tro-spread">
                    <div className="tro-pagina tro-pagina--titulo">
                      <span className="tro-panel-sub">{parador("ceremonia")}</span>
                      <h2 className="tro-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <div className="tro-ficha">
                      {ceremoniaHora && <div className="tro-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="tro-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="tro-folio tro-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil")}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza")} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="light" className="tro-panel tro-panel--cielo tro-panel--mapa">
                  <Ola clase="tro-ola--panel" />
                  <div className="tro-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar")}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="tro-spread">
                    <div className="tro-pagina tro-pagina--titulo">
                      <span className="tro-panel-sub">{parador("llegar")}</span>
                      <h2 className="tro-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="tro-ficha">
                      {embedMapUrl && (
                        <div className="tro-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="tro-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas")}<span>→</span>
                      </a>
                    </div>
                  </div>
                  <div className="tro-folio tro-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ")}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza")} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="dark" className="tro-panel tro-panel--mar">
                  <Ola clase="tro-ola--panel" />
                  <div className="tro-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma")}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="tro-spread">
                    <div className="tro-pagina tro-pagina--titulo">
                      <span className="tro-panel-sub">{parador("cronograma")}</span>
                      <h2 className="tro-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="tro-ficha">
                      {cronograma.map((item, i) => (
                        <div key={i} className="tro-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="tro-folio tro-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            La pulsera de playa: sobre el acento con lunares blancos, la
            tarjeta blanca con sombra de tinta y la estrella "¡Sí!". */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="light" data-screen-label={tx("invitacion.rsvp.confirmar")} className="tro-section tro-checkin">
            <span className="tro-lunares" aria-hidden="true" />
            <div className="tro-folio tro-folio--blanco">
              <span data-xin="1" data-dist="-40">{nCheckin} — {tx("invitacion.pase.checkIn")}</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="tro-spread">
              <div className="tro-pagina">
                <h2 data-xin="1" data-dist="-80" className="tro-h2 tro-h2--sombra-tinta">
                  {tx("invitacion.saveTheDate.venis")}<br /><span className="tro-sol">{tx("invitacion.saveTheDate.aLaPlaya")}</span>
                </h2>
                <p data-xin="1" data-delay="120" className="tro-parrafo tro-parrafo--blanco">{tx("invitacion.rsvp.kicker")}.</p>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="tro-cupon">
                <CheckinTropical
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
            Postales: marcos blancos gruesos con filete de tinta, apenas
            torcidos, sobre el papel neutro. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="tro-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="tro-pan-fijo tro-pan-fijo--album">
              <div data-strip="1" className="tro-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`tro-panel tro-panel--album${iHoja % 2 === 1 ? " tro-panel--album-b" : ""}`}>
                    <div className="tro-folio tro-folio--gris">
                      <span>{nAlbum} — {tx("invitacion.album.titulo")}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") })} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="tro-h2 tro-h2--album">{tx("invitacion.saveTheDate.postales")}</h2>
                    <div className="tro-hoja" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="tro-foto-hoja"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="tro-foto-hoja-img" />
                          <span data-colorwash="1" className={`tro-bano tro-bano--${(i % 5) + 1}`} aria-hidden="true" />
                          <span className="tro-foto-hoja-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="tro-folio tro-folio--gris tro-folio--pie">
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
            El parlante de playa: sobre tinta, el título con la segunda
            línea al sol, el ecualizador de colores y la lista en fichas
            blancas. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="tro-section tro-musica">
            <div className="tro-folio tro-folio--sol">
              <span data-xin="1" data-dist="-40">{nMusica} — Playlist</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="tro-spread">
              <div className="tro-pagina">
                <h2 data-xin="1" data-dist="-80" className="tro-h2 tro-h2--plano">
                  {tituloEnDosLineas(tx("invitacion.saveTheDate.preguntaTemaSuena"), "tro-sol")}
                </h2>
                <div data-xin="1" data-delay="120" className="tro-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              </div>
              <div className="tro-pagina">
                <CancionesTropical
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Sobre arena, fichas blancas con sombra de color. */}
        {hayRegalos && (
          <section id="banco" data-tone="light" data-screen-label={tx("invitacion.regalos.titulo")} className="tro-section tro-regalos">
            <div className="tro-folio tro-folio--acento">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo")}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="tro-spread">
              <div className="tro-pagina">
                <h2 data-xin="1" data-dist="-80" className="tro-h2 tro-h2--sombra-sol">
                  {tx("invitacion.saveTheDate.tuRegalo")}<br />{tx("invitacion.saveTheDate.esVenir")}
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="tro-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="tro-pagina">
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
            Sobre el sol con la ola del mar abajo, chip de tinta y opciones
            en píldoras blancas con sombra. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="light" data-screen-label={triviaTitulo} className="tro-section tro-quiz">
            <Ola clase="tro-ola--quiz" />
            <div className="tro-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — Trivia</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="tro-spread">
              <TriviaTropical
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            Pulsera y QR: sobre el mar con la arena abajo y su ola, el QR
            con marco de tinta y sombra del acento, el pase gigante, la
            mesa al sol y "¡Nos vemos en la arena!". */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="tro-section tro-pase">
          <span className="tro-pase-arena" aria-hidden="true" />
          <Ola clase="tro-ola--pase" />
          <div className="tro-folio">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase")}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="tro-spread">
            <div data-xin="1" data-dist="-60" className="tro-pagina tro-pagina--qr">
              <div className="tro-qr">
                <QrDeIngreso guest={guest as never} />
                <span className="tro-qr-etq">{tx("invitacion.pase.tuPase")}</span>
              </div>
            </div>
            <div className="tro-pagina">
              <div data-xin="1" data-delay="100" className="tro-pase-cabeza">
                <div className="tro-pase-numero">
                  <span className="tro-folio-etq">{tx("invitacion.pase.pase")} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="tro-pase-mesa">
                    <span className="tro-folio-etq">{tx("invitacion.pase.tuMesa")}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="tro-caja">
                <div className="tro-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="tro-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="tro-linea"><span>{tx("invitacion.pase.sector")} · {tx("invitacion.pase.tuMesa")}</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="tro-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} h</span></div>
              </div>
              <div className="tro-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="tro-pase-pie">
            <span className="tro-despedida">{tx("invitacion.saveTheDate.nosVemosEnLaArena")} — {firma}</span>
            <div className="tro-folio tro-folio--colofon">
              <span className="tro-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.ink} /></span>
              <span className="tro-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.saveTheDate.volverALaPlaya")} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="tro-riel">
        <span ref={rielTopRef} className="tro-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="tro-riel-linea">
          <span ref={rielBarraRef} className="tro-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="tro-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha")}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          La playa: cielo con sol y nubes, mar con olas, arena; la palmera
          que se mece, la estrella de mar que flota y la sandía. En el
          centro el nombre en Lilita blanca con trazo y la cinta del
          evento. Es la bienvenida: dice de quién es la fiesta, cuándo,
          dónde y para cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="tro-portada">
        <div ref={escenaPortadaRef} className="tro-portada-hoja">
          <div className="tro-playa" aria-hidden="true">
            <span data-drift="-6" className="tro-sol-disco" />
            <span data-drift="4" className="tro-nube tro-nube--grande" />
            <span data-drift="6" className="tro-nube tro-nube--chica" />
            <span className="tro-mar" />
            <Ola clase="tro-ola--mar" />
            <Ola clase="tro-ola--espuma" />
            <span className="tro-arena" />
            <Ola clase="tro-ola--arena" />
            <svg data-drift="10" viewBox="0 0 160 200" className="tro-palmera">
              <path d="M66 200 C 70 160, 74 120, 78 76 L 90 78 C 88 120, 86 160, 88 200 Z" className="tro-tronco" />
              <g className="tro-anillos"><path d="M70 104 Q78 100 88 103" /><path d="M69 128 Q78 124 87 127" /><path d="M68 152 Q78 148 87 151" /><path d="M67 176 Q78 172 87 175" /></g>
              {FRONDAS.map(([rot, esc], i) => (
                <g key={i} transform={`rotate(${rot} 80 68) translate(80 68) scale(${esc})`} className={i % 2 === 0 ? "tro-fronda" : "tro-fronda tro-fronda--oscura"}>
                  <path d={FRONDA} /><path d={NERVIO} className="tro-nervio" />
                </g>
              ))}
              <g className="tro-cocos"><circle cx="76" cy="76" r="7" /><circle cx="90" cy="78" r="7" /><circle cx="83" cy="86" r="6" /></g>
            </svg>
            <svg data-drift="8" viewBox="0 0 60 60" className="tro-estrella-mar"><polygon points={ESTRELLA} /></svg>
            <svg data-drift="5" viewBox="0 0 80 50" className="tro-sandia"><path d="M4 46 A36 36 0 0 1 76 46 Z" className="tro-sandia-pulpa" /><path d="M4 46 A36 36 0 0 1 76 46" className="tro-sandia-cascara" /><circle cx="30" cy="34" r="2.5" /><circle cx="44" cy="28" r="2.5" /><circle cx="54" cy="38" r="2.5" /></svg>
          </div>

          <div data-cl="1" className="tro-tapa-cabecera">
            <span className="tro-chip tro-chip--tinta">{kickerDelEvento}</span>
            <span className="tro-chip tro-chip--blanco">Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="tro-tapa-centro">
            <span className="tro-chip tro-chip--blanco tro-tapa-kicker">{diaSemana} {diaNum} · {mesLargo} · {anio}</span>
            <h1 ref={cartelRef} className={`tro-tapa-nombres${nombreLargo ? " tro-tapa-nombres--largo" : ""}`} style={{ "--largo": renglonMasLargo, "--n": totalLetras } as React.CSSProperties}>
              {renglones.map((r, i) => (
                <span key={i} className="tro-tapa-linea"><span data-pieza="1"><Letras texto={r} desde={i === 0 ? 0 : renglones[0].replace(/\s/g, "").length} /></span></span>
              ))}
            </h1>
            <span className="tro-cinta">{cintaDelEvento}</span>
            <div className="tro-tapa-datos">
              <span>{lugarNombre || kickerDelEvento}<br /><span className="tro-acento">{[direccion, ciudad].filter(Boolean).join(" · ")}</span></span>
              <span className="tro-tapa-datos-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase")} Nº {pase}<br /><span className="tro-acento">{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</span></>
                  : <>{hora} h<br /><span className="tro-acento">{fechaPuntos}</span></>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="tro-tapa-pie">
            <p className="tro-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}, ${String(invitation.portadaMensaje || tx("invitacion.saveTheDate.mensajeTropical"))}`
                : String(invitation.portadaMensaje || tx("invitacion.saveTheDate.mensajeTropical"))}
            </p>
            <button type="button" onClick={abrir} className="tro-tapa-btn">
              <span>{tx("invitacion.portada.abrirInvitacion")}</span><span>→</span>
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="tro-pista">{tx("invitacion.portada.desliza")} ↓</div>

      {fotoAmpliada && (
        <div className="tro-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="tro-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="tro-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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
 * El nombre letra por letra: cada tanto una "flota" (sube 14 px y gira
 * 6°) y vuelve rebotando. El CSS escalona el turno de cada letra.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="tro-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
      )}
    </>
  );
}
