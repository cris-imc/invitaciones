  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre como título de opening: dos renglones, el segundo sangrado.
  // Con una sola persona el nombre se parte en dos (Valen / tina, como en el
  // mockup); con dos, uno por renglón y el cuerpo baja a .7em si son largos.
  const partirNombre = (n: string): [string, string] => {
    const limpio = n.trim();
    const partes = limpio.split(/\s+/);
    if (partes.length > 1) return [partes[0], partes.slice(1).join(" ")];
    const corte = Math.ceil(limpio.length / 2);
    return [limpio.slice(0, corte), limpio.slice(corte)];
  };
  const renglones: [string, string] = saludaAlInvitado ? partirNombre(nombreInvitado) : nombre2 ? [nombre1, nombre2] : partirNombre(nombre1);
  const renglonMasLargo = Math.max(4, ...renglones.map((n) => n.length));
  const nombreLargo = Boolean(nombre2) && renglonMasLargo > 7;
  const totalLetras = Math.max(1, renglones.join("").replace(/\s/g, "").length);

  // La frase: una palabra del medio en el acento y el cierre sobre la
  // estrella amarilla.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.8)) return "sho-resalte";
    if (i === Math.min(desdeAcento, n - 1) || i === Math.floor(n * 0.3)) return "sho-acento";
    return undefined;
  };

  const esXV = invitation.tipo === "QUINCE_ANOS";
  const esBoda = invitation.tipo === "CASAMIENTO";
  const kickerDelEvento = tx(esBoda ? "invitacion.evento.nosCasamos" : esXV ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const subtituloJp = tx(esXV ? "invitacion.saveTheDate.jpQuince" : esBoda ? "invitacion.saveTheDate.jpBoda" : "invitacion.saveTheDate.jpFiesta");
  const numeroDeEpisodio = esXV ? "15" : "01";
  const emblema = esXV ? "✦ 15 ✦" : nombre2 ? "✦ & ✦" : "✦ ✦ ✦";
  const firma = esXV ? nombre1.trim().split(/\s+/)[0] : iniciales(nombre1, nombre2);
  // Los nueve destellos de la tapa y del pase: posición, tamaño, color y
  // ritmo, como en el mockup.
  const DESTELLOS = [[6, 14, 26], [86, 10, 34], [70, 26, 18], [14, 44, 22], [92, 52, 20], [30, 62, 16], [80, 74, 30], [10, 84, 20], [56, 90, 18]];
  const PETALOS = [8, 22, 38, 55, 68, 82, 94];

  return (
    <div
      ref={raizRef}
      className={`${shoSerif.variable} ${shoSans.variable} sho-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_SHO}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="sho-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            "Próximo episodio": sobre la tinta, la fecha en Cherry Bomb a
            tres colores, y la foto con marco blanco y el sticker つづく. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="sho-section sho-std">
          <span className="sho-lineas sho-lineas--std" aria-hidden="true" />
          <div className="sho-folio sho-folio--celeste">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.proximoEpisodio")}</span>
            <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
          </div>
          <div className="sho-spread">
            <div className="sho-pagina">
              <div className="sho-fecha">
                <span data-xin="1" data-dist="-160" className="sho-fecha-linea sho-fecha-linea--dia">{diaNum}</span>
                <span data-xin="1" data-dist="160" data-delay="120" className="sho-fecha-linea sho-fecha-linea--mes">{mesLargo}</span>
                <span data-xin="1" data-dist="-160" data-delay="240" className="sho-fecha-linea sho-fecha-linea--anio">{anio}</span>
              </div>
              <div data-xin="1" data-delay="360" className="sho-fecha-pie">
                <span>{diaSemana} · {hora} h · {tx("invitacion.saveTheDate.guardaLaFecha")}</span>
                <AddToCalendarLink
                  eventName={titulo}
                  targetDate={fechaHora}
                  location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                  className="sho-pildora sho-pildora--blanca"
                  showIcon={false}
                >
                  {tx("invitacion.saveTheDate.agregarAlCalendario")} ↗
                </AddToCalendarLink>
              </div>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="sho-foto">
                {fotoMobile && (
                  <div className="acp-mobile-only sho-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="59,42,74" />
                  </div>
                )}
                {fotoDesktop && (
                  <div className="acp-desktop-only sho-foto-capa">
                    <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="59,42,74" />
                  </div>
                )}
                {/* La trama que tapa la foto y se disuelve al subir: el radio
                    del punto lo mueve el motor en --sho-punto. */}
                <span className="sho-foto-revelado" aria-hidden="true" />
                <span className="sho-foto-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
                <span className="sho-sticker sho-sticker--tsuzuku">{tx("invitacion.saveTheDate.tsuzuku")}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            Secuencia de transformación: cuatro viñetas blancas con líneas
            de velocidad entre dos marquesinas inclinadas. */}
        <section data-tone="light" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="sho-section sho-countdown">
          <div className="sho-folio sho-folio--suave">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.saveTheDate.transformacionEn")}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="sho-marquesina sho-marquesina--acento" aria-hidden="true">
            <div className="sho-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.cuentaRegresiva.dias")} ✦ {tx("invitacion.cuentaRegresiva.horas")} ✦ {tx("invitacion.cuentaRegresiva.minutos")} ✦ {tx("invitacion.cuentaRegresiva.segundos")} ✦ {diaNum} {tx("invitacion.evento.de")} {mesLargo} ✦ カウントダウン ✦&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="sho-spread">
            <div className="sho-pagina sho-pagina--entera">
              <CuentaShojo targetDate={fechaHora} />
            </div>
          </div>
          <div className="sho-marquesina sho-marquesina--celeste sho-marquesina--contraria" aria-hidden="true">
            <div className="sho-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {[lugarNombre, ciudad, `${hora} h`, dressCode].filter(Boolean).join(" · ").toUpperCase()} ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            Monólogo interior: la frase dentro de un globo de pensamiento y
            el cartel キラキラ flotando al costado. */}
        {hayFrase && (
          <section data-tone="light" data-screen-label={tx("invitacion.frase.etiqueta")} className="sho-section sho-frase-seccion">
            <span className="sho-trama sho-trama--frase" aria-hidden="true" />
            <div className="sho-folio sho-folio--suave">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.saveTheDate.monologoInterior")}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="sho-spread">
              <div className="sho-pensamiento">
                <h2 ref={fraseRef} className="sho-frase">
                  {palabras.map((p, i) => (
                    // El espacio va fuera del span: el motor pone cada palabra
                    // en inline-block y un espacio adentro se colapsa a cero.
                    <span key={i}>
                      <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                    </span>
                  ))}
                </h2>
                <span className="sho-burbujita sho-burbujita--grande" aria-hidden="true" /><span className="sho-burbujita sho-burbujita--chica" aria-hidden="true" />
              </div>
              <div data-xin="1" data-delay="900" data-dist="60" className="sho-kirakira">
                <span className="sho-kirakira-titulo">{tx("invitacion.saveTheDate.kirakira")}</span>
                <span className="sho-kirakira-texto">{tx("invitacion.frase.conAmor")} · {titulo}</span>
              </div>
            </div>
            <div className="sho-folio sho-folio--suave sho-folio--pie">
              <span>{titulo} · {tx("invitacion.saveTheDate.epAbrev")} {numeroDeEpisodio}</span>
              <span className="sho-barra" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Viñetas de manga: el escenario sobre lila, la escena 1 sobre
            tinta y el guion sobre rosa, con el título blanco con trazo y
            la ficha blanca. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="sho-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="sho-pan-fijo">
            <div data-strip="1" className="sho-tira">
              <div data-tone="light" className="sho-panel sho-panel--escenario">
                <span className="sho-lineas sho-lineas--panel" aria-hidden="true" />
                <div className="sho-folio">
                  <span>{nCuando} — {tx("invitacion.saveTheDate.escenario")}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="sho-spread">
                  <div className="sho-pagina sho-pagina--titulo">
                    <span className="sho-panel-sub">{tx("invitacion.ubicacion.elSalon")}</span>
                    <h2 className="sho-panel-titulo">{lugarNombre || tx("invitacion.ubicacion.elLugar")}</h2>
                  </div>
                  <div className="sho-ficha">
                    <div className="sho-linea"><span>{tx("invitacion.ubicacion.recepcion")}</span><span>{hora} h</span></div>
                    {direccion && <div className="sho-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="sho-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="sho-cta">
                        {tx("invitacion.ubicacion.comoLlegar")}<span>→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="sho-folio sho-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ")}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza")} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="sho-panel sho-panel--escena">
                  <span className="sho-lineas sho-lineas--panel" aria-hidden="true" />
                  <div className="sho-folio">
                    <span>{nCuando} — {tx("invitacion.saveTheDate.escena")} 1</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="sho-spread">
                    <div className="sho-pagina sho-pagina--titulo">
                      <span className="sho-panel-sub">{ceremoniaTitulo}</span>
                      <h2 className="sho-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <div className="sho-ficha">
                      {ceremoniaHora && <div className="sho-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="sho-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="sho-folio sho-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil")}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza")} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="light" className="sho-panel sho-panel--mapa">
                  <span className="sho-lineas sho-lineas--panel" aria-hidden="true" />
                  <div className="sho-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar")}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="sho-spread">
                    <div className="sho-pagina sho-pagina--titulo">
                      <span className="sho-panel-sub">{tx("invitacion.ubicacion.tuUbicacion")}</span>
                      <h2 className="sho-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="sho-ficha">
                      {embedMapUrl && (
                        <div className="sho-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="sho-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas")}<span>→</span>
                      </a>
                    </div>
                  </div>
                  <div className="sho-folio sho-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ")}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza")} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="light" className="sho-panel sho-panel--guion">
                  <span className="sho-lineas sho-lineas--panel" aria-hidden="true" />
                  <div className="sho-folio">
                    <span>{nCuando} — {tx("invitacion.saveTheDate.guion")}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="sho-spread">
                    <div className="sho-pagina sho-pagina--titulo">
                      <span className="sho-panel-sub">{tx("invitacion.ubicacion.cronograma")}</span>
                      <h2 className="sho-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="sho-ficha">
                      {cronograma.map((item, i) => (
                        <div key={i} className="sho-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="sho-folio sho-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            Ficha de personaje: pliego celeste con líneas de velocidad, la
            tarjeta blanca con sombra de tinta y el sello "¡Sí!" de
            estrella al confirmar. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="light" data-screen-label={tx("invitacion.rsvp.confirmar")} className="sho-section sho-checkin">
            <span className="sho-lineas sho-lineas--checkin" aria-hidden="true" />
            <div className="sho-folio">
              <span data-xin="1" data-dist="-40">{nCheckin} — {tx("invitacion.saveTheDate.fichaDePersonaje")}</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="sho-spread">
              <div className="sho-pagina">
                <h2 data-xin="1" data-dist="-80" className="sho-h2">
                  {tx("invitacion.saveTheDate.teSumas")}<br />{tx("invitacion.saveTheDate.alElenco")}
                </h2>
                <p data-xin="1" data-delay="120" className="sho-parrafo sho-parrafo--tinta">{tx("invitacion.rsvp.kicker")}.</p>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="sho-cupon">
                <CheckinShojo
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
            Fotogramas: la hoja de contactos con marcos de tinta, esquinas
            redondas, sombra plana y apenas torcidos. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="sho-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="sho-pan-fijo sho-pan-fijo--album">
              <div data-strip="1" className="sho-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="light" className={`sho-panel sho-panel--album${iHoja % 2 === 1 ? " sho-panel--album-b" : ""}`}>
                    <div className="sho-folio sho-folio--gris">
                      <span>{nAlbum} — {tx("invitacion.saveTheDate.galeria")}</span>
                      <span>{tx("invitacion.album.hojaDeTotal", { n: String(iHoja + 1).padStart(2, "0"), total: String(hojasDeFotos.length).padStart(2, "0") })} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="sho-h2 sho-h2--album">{tx("invitacion.saveTheDate.fotogramas")}</h2>
                    <div className="sho-hoja" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="sho-foto-hoja"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="sho-foto-hoja-img" />
                          <span data-colorwash="1" className={`sho-bano sho-bano--${(i % 5) + 1}`} aria-hidden="true" />
                          <span className="sho-foto-hoja-n">FOTO {String(i + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="sho-folio sho-folio--gris sho-folio--pie">
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
            Opening / ending: pliego lila con trama blanca abajo, el
            ecualizador y la lista en fichas blancas. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="sho-section sho-musica">
            <span className="sho-trama sho-trama--musica" aria-hidden="true" />
            <div className="sho-folio">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.saveTheDate.opening")}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="sho-spread">
              <div className="sho-pagina">
                <h2 data-xin="1" data-dist="-80" className="sho-h2 sho-h2--sombra-tinta">
                  {tituloEnDosLineas(tx("invitacion.saveTheDate.cualEsTuOpening"), "sho-h2-sub")}
                </h2>
                <p data-xin="1" data-delay="100" className="sho-parrafo sho-parrafo--tinta">{tx("invitacion.musica.dejanosElTema")}</p>
                <div data-xin="1" data-delay="120" className="sho-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.18}s` }} />)}
                </div>
              </div>
              <div className="sho-pagina">
                <CancionesShojo
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Ítems: sobre rosa, fichas blancas con sombra de color. */}
        {hayRegalos && (
          <section id="banco" data-tone="light" data-screen-label={tx("invitacion.regalos.titulo")} className="sho-section sho-regalos">
            <div className="sho-folio sho-folio--suave">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.saveTheDate.items")}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="sho-spread">
              <div className="sho-pagina">
                <h2 data-xin="1" data-dist="-80" className="sho-h2 sho-h2--sombra-lila">
                  {tx("invitacion.saveTheDate.tuRegalo")}<br />{tx("invitacion.saveTheDate.esVenir")}
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="sho-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="sho-pagina">
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
            Trivia de fans: sobre la estrella amarilla con líneas de
            velocidad desde abajo, chip de tinta y opciones con sombra. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="light" data-screen-label={triviaTitulo} className="sho-section sho-quiz">
            <span className="sho-lineas sho-lineas--quiz" aria-hidden="true" />
            <div className="sho-folio">
              <span data-xin="1" data-dist="-40">{nQuiz} — {tx("invitacion.saveTheDate.triviaDeFans")}</span>
              <span data-xin="1" data-dist="40">{folio(nQuiz)}</span>
            </div>
            <div className="sho-spread">
              <TriviaShojo
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            El ticket del festival: sobre tinta con destellos, el QR con
            marco rosa, el pase gigante, la mesa en amarillo y el "fin del
            episodio". */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="sho-section sho-pase">
          <div className="sho-destellos" aria-hidden="true">
            {DESTELLOS.map(([x, y, s], i) => (
              <svg key={i} viewBox="0 0 40 40" className={`sho-destello sho-destello--${i % 4}`} style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDuration: `${(1.8 + (i % 4) * 0.45).toFixed(2)}s`, animationDelay: `${(i * 0.37).toFixed(2)}s` }}><path d="M20 2 C22 14 26 18 38 20 C26 22 22 26 20 38 C18 26 14 22 2 20 C14 18 18 14 20 2 Z" fill="currentColor" /></svg>
            ))}
          </div>
          <div className="sho-folio sho-folio--celeste">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase")}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="sho-spread">
            <div data-xin="1" data-dist="-60" className="sho-pagina sho-pagina--qr">
              <div className="sho-qr">
                <QrDeIngreso guest={guest as never} />
                <span className="sho-qr-etq">{tx("invitacion.pase.tuPase")}</span>
              </div>
            </div>
            <div className="sho-pagina">
              <div data-xin="1" data-delay="100" className="sho-pase-cabeza">
                <div className="sho-pase-numero">
                  <span className="sho-folio-etq">{tx("invitacion.pase.pase")} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="sho-pase-mesa">
                    <span className="sho-folio-etq">{tx("invitacion.pase.tuMesa")}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="sho-caja">
                <div className="sho-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="sho-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="sho-linea"><span>{tx("invitacion.pase.sector")} · {tx("invitacion.pase.tuMesa")}</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="sho-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} h</span></div>
              </div>
              <div className="sho-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="sho-pase-pie">
            <span className="sho-despedida">{tx("invitacion.saveTheDate.finDelEpisodio")} — {firma}</span>
            <div className="sho-folio sho-folio--celeste sho-folio--colofon">
              <span className="sho-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.acc3} /></span>
              <span className="sho-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.saveTheDate.volverAlOpening")} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="sho-riel">
        <span ref={rielTopRef} className="sho-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="sho-riel-linea">
          <span ref={rielBarraRef} className="sho-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="sho-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha")}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          Title card del episodio: líneas de velocidad lilas, screentone
          rosa abajo, destellos y pétalos cayendo. El nombre en Cherry
          Bomb blanco con trazo y doble sombra, el emblema entre barras,
          el globo del mensaje y el botón "▶". Es la bienvenida: dice de
          quién es la fiesta, cuándo, dónde y para cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="sho-portada">
        <div ref={escenaPortadaRef} className="sho-portada-hoja">
          <span className="sho-lineas sho-lineas--tapa" aria-hidden="true" />
          <span className="sho-trama sho-trama--tapa" aria-hidden="true" />
          <div className="sho-destellos" data-drift="24" aria-hidden="true">
            {DESTELLOS.map(([x, y, s], i) => (
              <svg key={i} viewBox="0 0 40 40" className={`sho-destello sho-destello--${i % 4}`} style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDuration: `${(1.8 + (i % 4) * 0.45).toFixed(2)}s`, animationDelay: `${(i * 0.37).toFixed(2)}s` }}><path d="M20 2 C22 14 26 18 38 20 C26 22 22 26 20 38 C18 26 14 22 2 20 C14 18 18 14 20 2 Z" fill="currentColor" /></svg>
            ))}
            {PETALOS.map((x, i) => (
              <svg key={`p${i}`} viewBox="0 0 24 24" className="sho-petalo" style={{ left: `${x}%`, animationDuration: `${9 + (i % 3) * 2.5}s`, animationDelay: `${i * 1.7}s` }}><path d="M12 2 C18 6 20 12 12 22 C4 12 6 6 12 2 Z" fill="currentColor" opacity=".7" /></svg>
            ))}
          </div>

          <div data-cl="1" className="sho-tapa-cabecera">
            <div className="sho-tapa-episodio">
              <span className="sho-chip">{tx("invitacion.saveTheDate.episodio")} {numeroDeEpisodio}</span>
              <span className="sho-tapa-jp">{subtituloJp}</span>
            </div>
            <span className="sho-tapa-numero">Nº 00 / {String(totalPliegos).padStart(2, "0")}</span>
          </div>

          <div data-cl="2" className="sho-tapa-centro">
            <span className="sho-tapa-kicker">{diaSemana} {diaNum} · {mesLargo} · {anio}</span>
            <h1 ref={cartelRef} className={`sho-tapa-nombres${nombreLargo ? " sho-tapa-nombres--largo" : ""}`} style={{ "--largo": renglonMasLargo, "--n": totalLetras } as React.CSSProperties}>
              <span className="sho-tapa-linea"><span data-pieza="1"><Letras texto={renglones[0]} desde={0} /></span></span>
              {renglones[1] && (
                <span className="sho-tapa-linea sho-tapa-linea--sangra"><span data-pieza="1"><Letras texto={renglones[1]} desde={renglones[0].replace(/\s/g, "").length} /></span></span>
              )}
            </h1>
            <div className="sho-emblema" aria-hidden="true">
              <span className="sho-emblema-barra" /><span className="sho-emblema-texto">{emblema}</span><span className="sho-emblema-barra" />
            </div>
            <div className="sho-tapa-datos">
              <span>{lugarNombre || kickerDelEvento}<br /><span className="sho-suave">{[direccion, ciudad].filter(Boolean).join(" · ")}</span></span>
              <span className="sho-tapa-datos-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase")} Nº {pase}<br /><span className="sho-suave">{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</span></>
                  : <>{hora} h<br /><span className="sho-suave">{fechaPuntos}</span></>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="sho-tapa-pie">
            <div className="sho-globo">
              <p className="sho-tapa-mensaje">
                {saludaAlInvitado
                  ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}, ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                  : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
              </p>
              <svg viewBox="0 0 40 40" className="sho-globo-estrella" aria-hidden="true"><path d="M20 2 C22 14 26 18 38 20 C26 22 22 26 20 38 C18 26 14 22 2 20 C14 18 18 14 20 2 Z" /></svg>
            </div>
            <button type="button" onClick={abrir} className="sho-tapa-btn">
              <span>{tx("invitacion.portada.abrirInvitacion")}</span><span>▶</span>
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="sho-pista">{tx("invitacion.portada.desliza")} ↓</div>

      {fotoAmpliada && (
        <div className="sho-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="sho-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="sho-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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
 * El nombre letra por letra: cada tanto una sube 16 px y crece un poco,
 * y vuelve rebotando ("sparkle bounce"). El CSS escalona el turno de cada
 * letra.
 */
function Letras({ texto, desde }: { texto: string; desde: number }) {
  let k = desde;
  return (
    <>
      {Array.from(texto).map((ch, i) =>
        ch === " " ? " " : <span key={i} className="sho-letra" style={{ "--i": k++ } as React.CSSProperties}>{ch}</span>
      )}
    </>
  );
}
