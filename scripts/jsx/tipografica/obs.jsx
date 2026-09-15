  // El total de pliegos, para los folios ("03 / 10"). Se cuenta lo que esta
  // invitación realmente tiene: si no hay trivia, no existe el pliego 09 y el
  // pase deja de ser 10 de 10.
  const totalPliegos = cuenta;
  const folio = (n: string) => `${n} / ${String(totalPliegos).padStart(2, "0")}`;

  // El nombre en Cormorant fina, centrado, con la "y" entre dos líneas
  // doradas. El renglón más largo manda el cuerpo.
  const renglones = saludaAlInvitado ? [nombreInvitado] : [nombre1, ...(nombre2 ? [nombre2] : [])];
  const renglonMasLargo = Math.max(5, ...renglones.map((n) => n.length));

  // La bitácora: el medio en itálica dorada y el cierre en itálica azul.
  const tonoDePalabra = (i: number) => {
    const n = palabras.length;
    if (i >= Math.ceil(n * 0.7)) return "obs-italica obs-azul";
    if (i >= Math.floor(n * 0.25) && i < desdeAcento) return "obs-italica obs-oro";
    return undefined;
  };

  const kickerDelEvento = tx(invitation.tipo === "CASAMIENTO" ? "invitacion.evento.nosCasamos" : invitation.tipo === "QUINCE_ANOS" ? "invitacion.evento.misQuinceAnos" : "invitacion.evento.teInvitamos");
  const mesCorto = mesLargo.slice(0, 3).toUpperCase();
  const anioRomano = aRomano(fechaEvento.getFullYear());
  const luna = faseLunar(fechaHora);
  const nombreDeLuna = tx(luna.clave);
  const inicialesY = `${(nombre1.trim()[0] || "").toUpperCase()}${nombre2 ? ` ${tx("invitacion.rsvp.y")} ${(nombre2.trim()[0] || "").toUpperCase()}` : ""}`;
  const codigoDelPase = `ALT ${pase} · ${(ciudad || lugarNombre || "").slice(0, 3).toUpperCase()} · ${anio}`;
  // Las estrellas del cielo de la tapa: posición, radio y, en ocho de ellas,
  // el ritmo del titilar.
  const ESTRELLAS: [number, number, number, number][] = [
    [22, 60, 1, 0], [88, 24, 0.8, 0], [140, 90, 1.3, 3.2], [210, 40, 0.7, 0], [300, 70, 1.1, 4.1], [370, 30, 0.9, 0],
    [40, 180, 0.9, 0], [120, 220, 0.6, 0], [250, 160, 1.2, 2.8], [340, 200, 0.8, 0], [390, 140, 0.6, 0],
    [60, 330, 0.7, 0], [180, 300, 0.9, 3.6], [290, 330, 0.6, 0], [360, 290, 1.1, 0],
    [30, 470, 1, 4.4], [110, 520, 0.7, 0], [200, 480, 0.8, 0], [310, 500, 1.2, 3], [380, 440, 0.7, 0],
    [70, 620, 0.8, 0], [160, 660, 1, 0], [260, 600, 0.6, 0], [350, 650, 0.9, 3.8],
  ];

  return (
    <div
      ref={raizRef}
      className={`${obsSerif.variable} ${obsSans.variable} ${obsMono.variable} obs-raiz`}
      style={varsDePaleta}
    >
      <style>{CSS_OBS}</style>
      <style>{COVER_RESPONSIVE_STYLE}</style>

      <div ref={scrollerRef} className="obs-scroller">
        {/* ── 01 Guardá la fecha ─────────────────────────────────────────
            Las efemérides: el astrolabio con la fecha adentro y el texto
            girando, la luna de esa noche y la foto vista por el ocular. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.saveTheDate.guardaLaFecha")} className="obs-section obs-std">
          <div className="obs-folio">
            <span data-xin="1" data-dist="-40">{nSaveTheDate} — {tx("invitacion.saveTheDate.efemerides").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nSaveTheDate)}</span>
          </div>
          <div className="obs-spread">
            <div className="obs-pagina">
              <div data-xin="1" data-dist="0" className="obs-astrolabio">
                <Astrolabio arco={`${diaSemana} · ${diaNum} ${tx("invitacion.evento.de").toUpperCase()} ${mesLargo.toUpperCase()} · ${anio} · ${[ciudad || lugarNombre].filter(Boolean).join(" · ").toUpperCase()} · ${hora} H · `} dia={diaNum} mes={`${tx("invitacion.evento.de")} ${mesLargo}`} anio={anioRomano} />
              </div>
              <div data-xin="1" data-delay="300" className="obs-luna">
                <span className="obs-luna-disco" aria-hidden="true"><span style={{ transform: `translateX(${luna.desplazamiento}%)` }} /></span>
                <div className="obs-luna-texto">
                  <span className="obs-etq-mono">{tx("invitacion.saveTheDate.lunaEsaNoche")}</span>
                  <span>{nombreDeLuna} · {luna.porcentaje} % {tx("invitacion.saveTheDate.iluminada")}</span>
                </div>
              </div>
              <AddToCalendarLink
                eventName={titulo}
                targetDate={fechaHora}
                location={[lugarNombre, direccion].filter(Boolean).join(", ")}
                className="obs-cta-linea"
                showIcon={false}
              >
                {tx("invitacion.saveTheDate.agregarAlCalendario").toUpperCase()}
              </AddToCalendarLink>
            </div>

            {hayFoto && (
              <div ref={ventanaRef} data-xin="1" data-delay="200" data-dist="0" className="obs-ocular">
                <div className="obs-ocular-lente">
                  {fotoMobile && (
                    <div className="acp-mobile-only obs-foto-capa">
                      <AnimatedCoverPhoto photoSrc={fotoMobile} tint={false} effect="enfoque" scrimColorRgb="11,20,38" />
                    </div>
                  )}
                  {fotoDesktop && (
                    <div className="acp-desktop-only obs-foto-capa">
                      <AnimatedCoverPhoto photoSrc={fotoDesktop} tint={false} effect="enfoque" scrimColorRgb="11,20,38" />
                    </div>
                  )}
                  {/* La viñeta que tapa la foto y se abre al subir: el motor
                      mueve --obs-punto de 7,2 a 0 y la opacidad la sigue. */}
                  <span className="obs-vineta" aria-hidden="true" />
                  <span className="obs-reticula obs-reticula--v" aria-hidden="true" /><span className="obs-reticula obs-reticula--h" aria-hidden="true" /><span className="obs-reticula-centro" aria-hidden="true" />
                  <span className="obs-ocular-etq">{tx("invitacion.album.nuestraFoto").toUpperCase()}</span>
                </div>
                <span className="obs-ocular-pie obs-ocular-pie--izq">{tx("invitacion.saveTheDate.ocular").toUpperCase()}</span>
                <span className="obs-ocular-pie obs-ocular-pie--der">{tx("invitacion.saveTheDate.placa").toUpperCase()} 01</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 02 Falta poco ──────────────────────────────────────────────
            El tránsito: cuatro órbitas con su anillo punteado girando y la
            cifra en el centro. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.cuentaRegresiva.kicker")} className="obs-section obs-countdown">
          <div className="obs-folio">
            <span data-xin="1" data-dist="-40">{nCountdown} — {tx("invitacion.saveTheDate.transito").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nCountdown)}</span>
          </div>
          <div className="obs-marquesina" aria-hidden="true">
            <div className="obs-marquesina-tira">
              {[0, 1].map((i) => (
                <span key={i}>
                  {tx("invitacion.cuentaRegresiva.faltan")} {tx("invitacion.cuentaRegresiva.dias").toLowerCase()}, {tx("invitacion.cuentaRegresiva.horas").toLowerCase()}, {tx("invitacion.cuentaRegresiva.minutos").toLowerCase()} {tx("invitacion.rsvp.y")} {tx("invitacion.cuentaRegresiva.segundos").toLowerCase()} — {diaNum} {tx("invitacion.evento.de")} {mesLargo} — {tx("invitacion.saveTheDate.laCuentaSigue")} —&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="obs-spread">
            <div className="obs-pagina obs-pagina--entera">
              <CuentaObservatorio targetDate={fechaHora} />
            </div>
          </div>
          <div className="obs-folio obs-folio--chico">
            <span>{tx("invitacion.saveTheDate.horaLocal").toUpperCase()} · UTC−3</span>
            <span>{[lugarNombre, dressCode].filter(Boolean).join(" · ").toUpperCase()}</span>
          </div>
        </section>

        {/* ── 03 Unas palabras ───────────────────────────────────────────
            La bitácora: una constelación de fondo, la frase en Cormorant y
            la nota que flota con su estrella. */}
        {hayFrase && (
          <section data-tone="dark" data-screen-label={tx("invitacion.frase.etiqueta")} className="obs-section obs-frase-seccion">
            <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="obs-constelacion-fondo" aria-hidden="true">
              <polyline points="30,240 90,180 150,210 220,120 300,150 370,60" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".6" className="obs-oro" />
              <g fill="currentColor"><circle cx="30" cy="240" r="1.5" /><circle cx="90" cy="180" r="2" /><circle cx="150" cy="210" r="1.2" /><circle cx="220" cy="120" r="2.4" /><circle cx="300" cy="150" r="1.4" /><circle cx="370" cy="60" r="2" /></g>
            </svg>
            <div className="obs-folio">
              <span data-xin="1" data-dist="-40">{nFrase} — {tx("invitacion.saveTheDate.bitacora").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nFrase)}</span>
            </div>
            <div className="obs-spread">
              <h2 ref={fraseRef} className="obs-frase">
                {palabras.map((p, i) => (
                  // El espacio va fuera del span: el motor pone cada palabra
                  // en inline-block y un espacio adentro se colapsa a cero.
                  <span key={i}>
                    <span data-w="1" className={tonoDePalabra(i)}>{p}</span>{" "}
                  </span>
                ))}
              </h2>
              <div data-xin="1" data-delay="900" data-dist="60" className="obs-nota">
                <span className="obs-nota-estrella" aria-hidden="true"><span /></span>
                <span>{tx("invitacion.frase.conAmor")} · {titulo} · {tx("invitacion.saveTheDate.registro").toLowerCase()} {String(fechaEvento.getDate()).padStart(2, "0")}.{String(fechaEvento.getMonth() + 1).padStart(2, "0")}.{anio}</span>
              </div>
            </div>
            <div className="obs-folio obs-folio--chico obs-folio--pie">
              <span>{tx("invitacion.saveTheDate.observacion").toUpperCase()} Nº {pase}</span>
              <span className="obs-barra" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── 04 Cuándo y dónde ──────────────────────────────────────────
            Las coordenadas: una observación por lugar, con la ficha de
            filete fino y la etiqueta en la esquina. */}
        <div
          id="details"
          data-pan="1"
          data-scroll={scrollVertical || panelesLugar.length <= 1 ? "vertical" : "lateral"}
          data-screen-label={tx("invitacion.ubicacion.cuandoYDonde")}
          className="obs-pan"
          style={{ "--st-pasos": Math.max(0, panelesLugar.length - 1) } as React.CSSProperties}
        >
          <div className="obs-pan-fijo">
            <div data-strip="1" className="obs-tira">
              <div data-tone="dark" className="obs-panel">
                <div className="obs-folio">
                  <span>{nCuando} — {tx("invitacion.ubicacion.fiestaSalon").toUpperCase()}</span><span>{deLugar("recepcion")}</span>
                </div>
                <div className="obs-spread">
                  <div className="obs-pagina">
                    <span className="obs-panel-sub">{tx("invitacion.saveTheDate.observacion")} {deLugar("recepcion").split(" ")[0]}</span>
                    <h2 className="obs-panel-titulo">{lugarNombre || ciudad}</h2>
                  </div>
                  <div className="obs-ficha">
                    <span className="obs-ficha-coord">{(ciudad || `${hora} H`).toUpperCase()}</span>
                    <div className="obs-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{hora} h</span></div>
                    {direccion && <div className="obs-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{direccion}</span></div>}
                    {dressCode && <div className="obs-linea"><span>{tx("invitacion.ubicacion.dressCode")}</span><span>{dressCode}</span></div>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="obs-cta">
                        {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}<span>→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="obs-folio obs-folio--chico obs-folio--pie">
                  <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                  {!scrollVertical && panelesLugar.length > 1 && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                </div>
              </div>

              {ceremoniaHabilitada && (
                <div id="ceremonia" data-tone="dark" className="obs-panel obs-panel--bg2">
                  <div className="obs-folio">
                    <span>{nCuando} — {ceremoniaTitulo.toUpperCase()}</span><span>{deLugar("ceremonia")}</span>
                  </div>
                  <div className="obs-spread">
                    <div className="obs-pagina">
                      <span className="obs-panel-sub">{tx("invitacion.saveTheDate.observacion")} {deLugar("ceremonia").split(" ")[0]}</span>
                      <h2 className="obs-panel-titulo">{ceremoniaNombre || ceremoniaTitulo}</h2>
                    </div>
                    <div className="obs-ficha obs-ficha--claro">
                      <span className="obs-ficha-coord">{(ceremoniaHora ? `${ceremoniaHora} H` : ceremoniaTitulo).toUpperCase()}</span>
                      {ceremoniaHora && <div className="obs-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{ceremoniaHora} h</span></div>}
                      {ceremoniaDireccion && <div className="obs-linea"><span>{tx("invitacion.ubicacion.direccion")}</span><span>{ceremoniaDireccion}</span></div>}
                    </div>
                  </div>
                  <div className="obs-folio obs-folio--chico obs-folio--pie">
                    <span>{tx("invitacion.ubicacion.ceremoniaCivil").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {hayComoLlegar && (
                <div id="location" data-tone="dark" className="obs-panel">
                  <div className="obs-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.comoLlegar").toUpperCase()}</span><span>{deLugar("llegar")}</span>
                  </div>
                  <div className="obs-spread">
                    <div className="obs-pagina">
                      <span className="obs-panel-sub">{tx("invitacion.saveTheDate.observacion")} {deLugar("llegar").split(" ")[0]}</span>
                      <h2 className="obs-panel-titulo">{tx("invitacion.ubicacion.comoLlegar")}</h2>
                    </div>
                    <div className="obs-ficha">
                      <span className="obs-ficha-coord">{(ciudad || lugarNombre).toUpperCase()}</span>
                      {embedMapUrl && (
                        <div className="obs-mapa">
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
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="obs-cta">
                        {tx("invitacion.ubicacion.abrirEnMapas").toUpperCase()}<span>→</span>
                      </a>
                    </div>
                  </div>
                  <div className="obs-folio obs-folio--chico obs-folio--pie">
                    <span>{[direccion, ciudad].filter(Boolean).join(" · ").toUpperCase()}</span>
                    {!scrollVertical && <span>{tx("invitacion.portada.desliza").toUpperCase()} →</span>}
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div id="schedule" data-tone="light" className="obs-panel obs-panel--azul">
                  <div className="obs-folio">
                    <span>{nCuando} — {tx("invitacion.ubicacion.cronograma").toUpperCase()}</span><span>{deLugar("cronograma")}</span>
                  </div>
                  <div className="obs-spread">
                    <div className="obs-pagina">
                      <span className="obs-panel-sub">{tx("invitacion.saveTheDate.observacion")} {deLugar("cronograma").split(" ")[0]}</span>
                      <h2 className="obs-panel-titulo">{tx("invitacion.ubicacion.laNochePasoAPaso").split(",")[0]}</h2>
                    </div>
                    <div className="obs-ficha">
                      <span className="obs-ficha-coord">{hora} H</span>
                      {cronograma.map((item, i) => (
                        <div key={i} className="obs-linea"><span>{item.time || ""}</span><span>{item.title}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="obs-folio obs-folio--chico obs-folio--pie">
                    <span>{fechaPuntos}</span>
                  </div>
                </div>
              )}
            </div>
            {!scrollVertical && panelesLugar.length > 1 && <Puntos cantidad={panelesLugar.length} />}
          </div>
        </div>

        {/* ── 05 Check-in ────────────────────────────────────────────────
            El registro del observador: pliego azul, la ficha oscura con el
            libro de observadores y el sello REGISTRADO. */}
        {rsvpHabilitado && (
          <section id="rsvp" data-tone="dark" data-screen-label={tx("invitacion.rsvp.confirmar")} className="obs-section obs-checkin">
            <div className="obs-folio obs-folio--tinta">
              <span data-xin="1" data-dist="-40">{nCheckin} — {tx("invitacion.saveTheDate.registro").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nCheckin)}</span>
            </div>
            <div className="obs-spread">
              <div className="obs-pagina">
                <h2 data-xin="1" data-dist="-80" className="obs-h2">
                  {tx("invitacion.rsvp.confirmaLinea1")}<br /><em>{tx("invitacion.rsvp.confirmaLinea2")}</em>
                </h2>
              </div>
              <div data-xin="1" data-delay="160" data-dist="80" className="obs-cupon">
                <CheckinObservatorio
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
            Las placas fotográficas: en negativo hasta que pasan por el
            centro, donde se revelan con su baño de color. */}
        {todasLasFotos.length > 0 && (
          <div
            id="album"
            data-pan="1"
            data-scroll={scrollVertical || hojasDeFotos.length <= 1 ? "vertical" : "lateral"}
            data-screen-label={tx("invitacion.album.titulo")}
            className="obs-pan"
            style={{ "--st-pasos": Math.max(0, hojasDeFotos.length - 1) } as React.CSSProperties}
          >
            <div className="obs-pan-fijo obs-pan-fijo--bg2">
              <div data-strip="1" className="obs-tira">
                {hojasDeFotos.map((hoja, iHoja) => (
                  <div key={iHoja} data-tone="dark" className={`obs-panel obs-panel--album${iHoja % 2 === 1 ? " obs-panel--album-b" : ""}`}>
                    <div className="obs-folio">
                      <span>{nAlbum} — {tx("invitacion.saveTheDate.placas").toUpperCase()}</span>
                      <span>{tx("invitacion.saveTheDate.serie").toUpperCase()} {String(iHoja + 1).padStart(2, "0")} / {String(hojasDeFotos.length).padStart(2, "0")} · {folio(nAlbum)}</span>
                    </div>
                    <h2 className="obs-h2 obs-h2--album">{tx("invitacion.saveTheDate.placas")} <em>{tx("invitacion.saveTheDate.reveladas")}</em></h2>
                    <div className="obs-placas" data-cantidad={hoja.length}>
                      {hoja.map((url, i) => (
                        <div
                          key={i}
                          data-sheet="1"
                          className="obs-placa"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFotoAmpliada(url)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFotoAmpliada(url); }}
                          aria-label={tx("invitacion.album.ampliarFoto", { n: i + 1 })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" loading="lazy" className="obs-placa-img" />
                          <span data-colorwash="1" className={`obs-bano obs-bano--${(i % 3) + 1}`} aria-hidden="true" />
                          <span data-neg="1" className="obs-negativo" aria-hidden="true" />
                          <span className="obs-placa-n">PL. {String(i + 1).padStart(2, "0")}</span>
                          <span className="obs-placa-nota">{[ciudad, anio].filter(Boolean).join(" · ").toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="obs-folio obs-folio--chico obs-folio--pie">
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
            Las frecuencias: cada tema con su dial en mono y el
            ecualizador de seis líneas finas. */}
        {sugerenciaMusicaHabilitada && (
          <section id="songs" data-tone="dark" data-screen-label={tx("invitacion.musica.titulo")} className="obs-section obs-musica">
            <div className="obs-folio">
              <span data-xin="1" data-dist="-40">{nMusica} — {tx("invitacion.saveTheDate.frecuencias").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nMusica)}</span>
            </div>
            <div className="obs-spread">
              <div className="obs-pagina">
                <h2 data-xin="1" data-dist="-80" className="obs-h2">
                  {tituloEnDosLineas(tx("invitacion.sabor.preguntaCancionFaltar"), "obs-italica obs-oro")}
                </h2>
                <div data-xin="1" data-delay="120" className="obs-eq" aria-hidden="true">
                  {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
              <div className="obs-pagina">
                <CancionesObservatorio
                  invitationId={String(invitation.id ?? "")}
                  guestToken={guest?.uniqueToken}
                  guestName={nombreInvitado || tx("invitacion.evento.invitado")}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 08 Regalos ─────────────────────────────────────────────────
            Fichas de filete fino sobre el azul profundo. */}
        {hayRegalos && (
          <section id="banco" data-tone="dark" data-screen-label={tx("invitacion.regalos.titulo")} className="obs-section obs-regalos">
            <div className="obs-folio">
              <span data-xin="1" data-dist="-40">{nRegalos} — {tx("invitacion.regalos.titulo").toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{folio(nRegalos)}</span>
            </div>
            <div className="obs-spread">
              <div className="obs-pagina">
                <h2 data-xin="1" data-dist="-80" className="obs-h2">
                  {tx("invitacion.regalos.siQueresLinea1")}<br /><em className="obs-oro">{tx("invitacion.regalos.siQueresLinea2")}</em>
                </h2>
                {Boolean(invitation.regaloMensaje) && (
                  <p data-xin="1" data-delay="120" className="obs-parrafo">{String(invitation.regaloMensaje)}</p>
                )}
              </div>
              <div className="obs-pagina">
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
            La trivia astral: el único pliego dorado, con tinta oscura. */}
        {quizHabilitado && (
          <section id="quiz" data-tone="light" data-screen-label="Quiz" className="obs-section obs-quiz">
            <div className="obs-folio obs-folio--tinta">
              <span data-xin="1" data-dist="-40">{nQuiz} — {triviaTitulo.toUpperCase()}</span>
              <span data-xin="1" data-dist="40">{tx("invitacion.saveTheDate.triviaAstral").toUpperCase()} · {folio(nQuiz)}</span>
            </div>
            <div className="obs-spread">
              <TriviaObservatorio
                preguntas={triviaPreguntas}
                invitationId={String(invitation.id ?? "")}
                guestToken={guest?.uniqueToken}
                guestName={nombreInvitado || tx("invitacion.evento.invitado")}
              />
            </div>
          </section>
        )}

        {/* ── 10 Tu pase ─────────────────────────────────────────────────
            El pase del observatorio: talón con texto vertical, el nombre,
            la cúpula (la mesa) en terracota, código de barras y el QR. */}
        <section data-tone="dark" data-screen-label={tx("invitacion.pase.tuPase")} className="obs-section obs-pase">
          <div className="obs-folio">
            <span data-xin="1" data-dist="-40">{nPase} — {tx("invitacion.pase.tuPase").toUpperCase()}</span>
            <span data-xin="1" data-dist="40">{folio(nPase)}</span>
          </div>
          <div className="obs-spread">
            <div data-xin="1" data-dist="-60" className="obs-pagina obs-pagina--ticket">
              <div className="obs-ticket">
                <span className="obs-ticket-troquel" aria-hidden="true" />
                <span className="obs-ticket-talon">Observatorio · {inicialesY} · {diaNum} {mesCorto}</span>
                <div className="obs-ticket-datos">
                  <div className="obs-ticket-etqs"><span>{tx("invitacion.saveTheDate.observador")}</span><span>{tx("invitacion.saveTheDate.cupula")}</span></div>
                  <div className="obs-ticket-fila"><span className="obs-ticket-nombre">{nombreInvitado || titulo}</span><span className="obs-ticket-cupula">{guest?.mesas?.[0] ?? pase}</span></div>
                  <CodigoDeBarras />
                  <span className="obs-ticket-codigo">{codigoDelPase}</span>
                </div>
                <div className="obs-ticket-qr">
                  <QrDeIngreso guest={guest as never} />
                </div>
              </div>
            </div>
            <div className="obs-pagina">
              <div data-xin="1" data-delay="100" className="obs-pase-cabeza">
                <div className="obs-pase-numero">
                  <span className="obs-etq-mono">{tx("invitacion.pase.pase").toUpperCase()} Nº</span>
                  <span>{pase}</span>
                </div>
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="obs-pase-mesa">
                    <span className="obs-etq-mono">{tx("invitacion.pase.tuMesa").toUpperCase()}</span>
                    <span>{guest.mesas[0]}</span>
                  </div>
                )}
              </div>
              <div data-xin="1" data-delay="160" className="obs-lineas-pase">
                <div className="obs-linea"><span>{saludaAlInvitado ? tx("invitacion.pase.reservadoPara") : tx("invitacion.evento.invitado")}</span><span>{nombreInvitado || titulo}</span></div>
                {lugaresDelPase > 0 && (
                  <div className="obs-linea"><span>{tx("invitacion.pase.lugares")}</span><span>{lugaresDelPase}</span></div>
                )}
                {guest?.mesas && guest.mesas.length > 0 && (
                  <div className="obs-linea"><span>Sector</span><span>{guest.mesas.join(" · ")}</span></div>
                )}
                <div className="obs-linea"><span>{tx("invitacion.ubicacion.horario")}</span><span>{fechaPuntos} · {hora} H</span></div>
              </div>
              <div className="obs-info-extra">
                <InfoAdicionalSection invitation={invitation} />
              </div>
            </div>
          </div>
          <div data-xin="1" data-delay="220" className="obs-pase-pie">
            <span className="obs-despedida">{tx("invitacion.saveTheDate.nosVemosBajoLasEstrellas")} — {inicialesY}</span>
            <div className="obs-folio obs-folio--chico obs-folio--colofon">
              <span className="obs-credito"><LogoFooterCredit bgColor="transparent" textColor={PALETA.ink} /></span>
              <span className="obs-replay" role="button" tabIndex={0} onClick={volverAVerla} onKeyDown={(e) => { if (e.key === "Enter") volverAVerla(); }}>
                {tx("invitacion.saveTheDate.volverALaCarta").toUpperCase()} ↺
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Riel de progreso ───────────────────────────────────────────── */}
      <div ref={rielRef} className="obs-riel">
        <span ref={rielTopRef} className="obs-riel-top">{pase}</span>
        <div ref={rielLineaRef} className="obs-riel-linea">
          <span ref={rielBarraRef} className="obs-riel-barra" />
        </div>
        <span ref={rielEtiquetaRef} className="obs-riel-etiqueta">{tx("invitacion.saveTheDate.guardaLaFecha").toUpperCase()}</span>
      </div>

      {/* ── La tapa ─────────────────────────────────────────────────────
          La carta celeste de la fecha: el cielo con estrellas que titilan,
          un cometa que cruza cada tanto, la carta con sus ejes detrás y la
          constelación que se traza sola con la fecha en sus estrellas. Es
          la bienvenida: dice de quién es la fiesta, cuándo, dónde y para
          cuántos. */}
      <div ref={portadaRef} data-tone={TONO} className="obs-portada">
        <div ref={escenaPortadaRef} className="obs-portada-hoja">
          <div className="obs-cielo" aria-hidden="true">
            <svg data-depth="0.4" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" className="obs-estrellas">
              <g fill="currentColor">
                {ESTRELLAS.map(([x, y, r, dur], i) => (
                  <circle key={i} cx={x} cy={y} r={r} className={dur ? "obs-estrella--titila" : undefined} style={dur ? { animationDuration: `${dur}s`, animationDelay: `${(i % 5) * 0.4}s` } : undefined} />
                ))}
              </g>
            </svg>
            <span className="obs-cometa" />
            <svg data-depth="-0.6" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" className="obs-carta">
              <g fill="none" stroke="currentColor" strokeWidth=".5">
                <circle cx="200" cy="200" r="190" strokeDasharray="2 5" /><circle cx="200" cy="200" r="150" /><circle cx="200" cy="200" r="100" strokeDasharray="1 4" />
                <line x1="200" y1="10" x2="200" y2="390" /><line x1="10" y1="200" x2="390" y2="200" /><line x1="66" y1="66" x2="334" y2="334" /><line x1="334" y1="66" x2="66" y2="334" />
              </g>
              <g className="obs-carta-puntos"><text x="204" y="20">N</text><text x="204" y="388">S</text><text x="14" y="196">O</text><text x="378" y="196">E</text></g>
            </svg>
          </div>

          <div data-cl="1" className="obs-folio obs-folio--tapa">
            <span>{tx("invitacion.saveTheDate.cartaCeleste")} Nº {pase}</span>
            <span>{(ciudad || lugarNombre || kickerDelEvento).toUpperCase()}</span>
          </div>

          <div data-cl="2" className="obs-tapa-centro">
            <div className="obs-constelacion" aria-hidden="true">
              <svg viewBox="0 0 500 200">
                <polyline points="40,140 110,70 190,110 250,40 330,90 400,50 460,130" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" opacity=".9" pathLength="1000" className="obs-constelacion-linea" />
                <g className="obs-constelacion-estrellas">
                  <circle cx="40" cy="140" r="3" /><circle cx="110" cy="70" r="4.5" /><circle cx="190" cy="110" r="2.5" /><circle cx="250" cy="40" r="5" /><circle cx="330" cy="90" r="3" /><circle cx="400" cy="50" r="4" /><circle cx="460" cy="130" r="3" />
                </g>
                <g className="obs-constelacion-halos" fill="none" strokeWidth=".8" opacity=".6"><circle cx="110" cy="70" r="9" /><circle cx="250" cy="40" r="11" /><circle cx="400" cy="50" r="8" /></g>
                <g className="obs-constelacion-etqs"><text x="96" y="100">{diaNum}</text><text x="238" y="72">{String(fechaEvento.getMonth() + 1).padStart(2, "0")}</text><text x="378" y="82">{anio}</text><text x="430" y="152">{hora}</text></g>
              </svg>
            </div>
            <span className="obs-tapa-kicker">{tx("invitacion.saveTheDate.bajoElMismoCielo")}</span>
            <h1 ref={cartelRef} className="obs-tapa-nombres" style={{ "--largo": renglonMasLargo } as React.CSSProperties}>
              {saludaAlInvitado ? (
                <span className="obs-tapa-linea"><span data-pieza="1">{nombreInvitado}</span></span>
              ) : (
                <>
                  <span className="obs-tapa-linea"><span data-pieza="1">{nombre1}</span></span>
                  {nombre2 && (
                    <>
                      <span className="obs-tapa-linea obs-tapa-linea--y"><span data-pieza="1" className="obs-tapa-y"><i /><em>{tx("invitacion.rsvp.y")}</em><i /></span></span>
                      <span className="obs-tapa-linea"><span data-pieza="1">{nombre2}</span></span>
                    </>
                  )}
                </>
              )}
            </h1>
            <div className="obs-tapa-datos">
              <span>{lugarNombre || "—"}<br /><span className="obs-oro">{[direccion, ciudad].filter(Boolean).join(" · ")}</span></span>
              <span className="obs-tapa-datos-der">
                {isPersonalized && guest
                  ? <>{tx("invitacion.pase.pase")} Nº {pase}<br /><span className="obs-oro">{lugaresDelPase} {tx(lugaresDelPase === 1 ? "invitacion.bienvenida.persona" : "invitacion.bienvenida.personas")}</span></>
                  : <>{diaSemana} {diaNum} · {mesCorto} · {anio}<br /><span className="obs-oro">{hora} h</span></>}
              </span>
            </div>
          </div>

          <div data-cl="3" className="obs-tapa-pie">
            <p className="obs-tapa-mensaje">
              {saludaAlInvitado
                ? `${tx("invitacion.bienvenida.hola", { nombre: nombreInvitado })}, ${String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}`
                : String(invitation.portadaMensaje || tx("invitacion.sabor.mensajeLoContamosNosotros"))}
            </p>
            <button type="button" onClick={abrir} className="obs-tapa-btn">
              {tx("invitacion.saveTheDate.abrirLaCarta").toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      <div ref={pistaRef} className="obs-pista">{tx("invitacion.portada.desliza").toUpperCase()} ↓</div>

      {fotoAmpliada && (
        <div className="obs-lupa" onClick={() => setFotoAmpliada(null)} onContextMenu={(e) => e.preventDefault()}>
          <button
            type="button"
            className="obs-lupa-cerrar"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label={tx("invitacion.cerrar")}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt={tx("invitacion.album.fotoAmpliada")} className="obs-lupa-img" draggable={false} onClick={(e) => e.stopPropagation()} />
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

/** El año en números romanos, como en las placas de los observatorios. */
function aRomano(n: number): string {
  const tabla: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let resto = n;
  let salida = "";
  for (const [valor, letra] of tabla) {
    while (resto >= valor) { salida += letra; resto -= valor; }
  }
  return salida;
}

/**
 * La fase de la luna esa noche, a partir de la luna nueva del 6 de enero de
 * 2000 y el mes sinódico (29,53 días). Devuelve la clave del nombre, el
 * porcentaje iluminado y cuánto correr la sombra del disco (negativo cuando
 * crece, positivo cuando mengua, como en el mockup).
 */
const FASES_DE_LUNA = [
  "invitacion.saveTheDate.lunaNueva", "invitacion.saveTheDate.lunaCreciente", "invitacion.saveTheDate.cuartoCreciente", "invitacion.saveTheDate.crecienteGibosa",
  "invitacion.saveTheDate.lunaLlena", "invitacion.saveTheDate.menguanteGibosa", "invitacion.saveTheDate.cuartoMenguante", "invitacion.saveTheDate.lunaMenguante",
] as const;
function faseLunar(fecha: Date): { clave: (typeof FASES_DE_LUNA)[number]; porcentaje: number; desplazamiento: number } {
  const SINODICO = 29.530588853;
  const referencia = Date.UTC(2000, 0, 6, 18, 14);
  const dias = (fecha.getTime() - referencia) / 86400000;
  const edad = ((dias % SINODICO) + SINODICO) % SINODICO;
  const iluminacion = (1 - Math.cos((2 * Math.PI * edad) / SINODICO)) / 2;
  const crece = edad < SINODICO / 2;
  const indice = edad < 1.85 ? 0 : edad < 7.4 ? 1 : edad < 9.2 ? 2 : edad < 14.8 ? 3 : edad < 16.6 ? 4 : edad < 22.1 ? 5 : edad < 23.9 ? 6 : edad < 27.7 ? 7 : 0;
  const corrimiento = Math.round((2 * iluminacion - 1) * 100);
  return { clave: FASES_DE_LUNA[indice], porcentaje: Math.round(iluminacion * 100), desplazamiento: crece ? -corrimiento : corrimiento };
}

/**
 * El astrolabio del Save the Date: tres anillos, el texto de la fecha
 * girando una vuelta cada 90 s, cuatro puntos orbitando en contra y la
 * fecha adentro con el año en romanos.
 */
function Astrolabio({ arco, dia, mes, anio }: { arco: string; dia: string; mes: string; anio: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 200" className="obs-astrolabio-svg" aria-hidden="true">
      <defs><path id={`arc-${id}`} d="M100 100 m -80 0 a 80 80 0 1 1 160 0 a 80 80 0 1 1 -160 0" fill="none" /></defs>
      <g fill="none" stroke="currentColor"><circle cx="100" cy="100" r="96" strokeWidth=".6" /><circle cx="100" cy="100" r="88" strokeWidth=".6" strokeDasharray="1 3" /><circle cx="100" cy="100" r="62" strokeWidth=".8" /></g>
      <g className="obs-astrolabio-arco"><text><textPath href={`#arc-${id}`}>{arco.repeat(3).slice(0, 70)}</textPath></text></g>
      <g className="obs-astrolabio-orbita"><circle cx="100" cy="12" r="2" /><circle cx="188" cy="100" r="1.4" /><circle cx="100" cy="188" r="1.8" /><circle cx="12" cy="100" r="1.2" /></g>
      <text x="100" y="98" textAnchor="middle" className="obs-astrolabio-dia">{dia}</text>
      <text x="100" y="122" textAnchor="middle" className="obs-astrolabio-mes">{mes}</text>
      <text x="100" y="142" textAnchor="middle" className="obs-astrolabio-anio">{anio}</text>
    </svg>
  );
}

/** El código de barras del pase: cuarenta barras. */
function CodigoDeBarras() {
  const barras = [[0, 3], [5, 1], [9, 2], [14, 4], [20, 1], [24, 3], [30, 2], [34, 1], [38, 4], [45, 2], [49, 1], [53, 3], [59, 1], [62, 4], [69, 2], [73, 1], [77, 3], [83, 2], [87, 4], [94, 1], [97, 3], [103, 1], [107, 2], [112, 4], [118, 1], [122, 3], [128, 2], [132, 1], [136, 4], [143, 2], [147, 1], [151, 3], [157, 1], [160, 4], [167, 2], [171, 1], [175, 3], [181, 2], [185, 4], [192, 1], [196, 3]];
  return (
    <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="obs-barras" aria-hidden="true">
      <g fill="currentColor">{barras.map(([x, w]) => <rect key={x} x={x} width={w} height="40" />)}</g>
    </svg>
  );
}
