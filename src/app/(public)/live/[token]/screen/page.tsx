"use client";

import { useEffect, useMemo, useRef, useState, use } from "react";
import { QRCodeSVG } from "qrcode.react";
import { LiveItem } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import Marquee from "react-fast-marquee";
import { LandingLogo } from "@/components/ui/Logo";
import { getHonoreeNames } from "@/lib/invitation-copy";
import { REACCIONES, totalDeReacciones } from "@/lib/live-reacciones";

/**
 * La pantalla grande del salón.
 *
 * Se proyecta durante toda la fiesta y nadie la toca: no hay clicks, no hay
 * scroll, no hay teclado. Todo lo que pasa acá pasa solo. Por eso el archivo
 * es sobre todo composición y tiempos.
 *
 * Las tres decisiones que gobiernan el resto:
 *
 *  - El fondo se mueve, pero despacio (ver .live-escena en globals.css). Una
 *    pared negra y quieta en medio de una fiesta parece un proyector colgado.
 *  - Cuando llega algo nuevo se muestra GRANDE unos segundos y recién después
 *    se suma a la fila. Es el momento que hace que la gente mire la pared: si
 *    la foto entra directo a la cinta, nadie se entera de que llegó.
 *  - Las reacciones se proyectan. Es lo que cierra el círculo con el teléfono:
 *    el invitado toca un corazón y lo ve aparecer en la pared del salón.
 */

/** Cuánto dura el momento grande de cada foto o mensaje nuevo. */
const SEGUNDOS_EN_GRANDE = 7000;
/** Cuánto sigue marcado con el borde dorado después de bajar a la fila. */
const SEGUNDOS_MARCADO = 9000;

/**
 * Las luces del fondo, fijas y no al azar.
 *
 * Con Math.random() el servidor dibuja unas posiciones y el navegador otras,
 * y React avisa que la hidratación no coincide. Una lista escrita a mano no
 * tiene ese problema y además deja elegir el reparto: ninguna en el centro,
 * que es donde van las fotos.
 */
const LUCES = [
  { left: "4%", size: 5, dur: 30, delay: 0, dx: "22px" },
  { left: "11%", size: 3, dur: 38, delay: 6, dx: "-16px" },
  { left: "17%", size: 6, dur: 26, delay: 13, dx: "30px" },
  { left: "24%", size: 4, dur: 34, delay: 3, dx: "-24px" },
  { left: "31%", size: 3, dur: 42, delay: 17, dx: "18px" },
  { left: "38%", size: 5, dur: 29, delay: 9, dx: "-12px" },
  { left: "62%", size: 4, dur: 36, delay: 2, dx: "26px" },
  { left: "69%", size: 6, dur: 31, delay: 15, dx: "-20px" },
  { left: "76%", size: 3, dur: 40, delay: 7, dx: "14px" },
  { left: "83%", size: 5, dur: 27, delay: 20, dx: "-28px" },
  { left: "90%", size: 4, dur: 35, delay: 11, dx: "20px" },
  { left: "96%", size: 3, dur: 44, delay: 4, dx: "-18px" },
];

function LucesDeFondo() {
  return (
    <div className="live-luces" aria-hidden>
      {LUCES.map((luz, i) => (
        <i
          key={i}
          style={
            {
              left: luz.left,
              width: luz.size,
              height: luz.size,
              animationDuration: `${luz.dur}s`,
              animationDelay: `${luz.delay}s`,
              "--dx": luz.dx,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/**
 * Una inclinación mínima y estable por ítem, sacada de su id.
 *
 * Estable importa: si el ángulo saliera de Math.random(), cada refresco de la
 * lista -- uno cada tres segundos -- sacudiría todas las tarjetas a la vez.
 * Con el id, la misma foto se inclina siempre igual y la pared parece un
 * corcho con fotos pegadas, no una grilla.
 */
function inclinacion(id: string): number {
  let suma = 0;
  for (let i = 0; i < id.length; i++) suma += id.charCodeAt(i);
  return ((suma % 5) - 2) * 0.7;
}

/**
 * Las reacciones que ya tiene el ítem, arriba de la foto.
 *
 * Sólo las que tienen algo: si aparecieran las cinco siempre, cuatro ceros
 * acompañando a un corazón hacen que el corazón valga menos. Y como son
 * cinco, van en píldoras oscuras traslúcidas -- sobre una foto clara, un
 * emoji suelto se pierde.
 */
function ReaccionesEnPantalla({ item, grande = false }: { item: LiveItem; grande?: boolean }) {
  if (totalDeReacciones(item) === 0) return null;

  return (
    <div className={`flex items-center flex-wrap justify-center ${grande ? "gap-2.5" : "gap-1.5"}`}>
      {REACCIONES.filter((r) => (item[r.campo] ?? 0) > 0).map((r) => (
        <span
          key={r.id}
          className={`flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 ${
            grande ? "px-3 py-1.5" : "px-2 py-1"
          }`}
        >
          <span className={grande ? "text-xl leading-none" : "text-sm leading-none"}>{r.emoji}</span>
          <span
            className={`font-semibold tabular-nums text-[#F6F3EC] ${grande ? "text-base" : "text-xs"}`}
          >
            {item[r.campo]}
          </span>
        </span>
      ))}
    </div>
  );
}

/** El cuerpo de una foto. */
function CuerpoFoto({ item, alto }: { item: LiveItem; alto: string }) {
  return (
    <div className={`live-foto relative w-full ${alto} overflow-hidden`}>
      <img src={item.fileUrl} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      {/* La marca se corrió del centro a la derecha: abajo a la izquierda
          ahora va el "Enviado por", y centrada se le montaba encima. */}
      <img
        src="/landing/logo-blanco-v2.png"
        alt=""
        aria-hidden
        className="absolute bottom-2.5 right-2.5 w-1/3 max-w-[96px] opacity-80 pointer-events-none"
      />
    </div>
  );
}

/**
 * El cuerpo de un mensaje.
 *
 * Antes esto era una caja índigo con un globito de chat, un color que no está
 * en ninguna otra parte del producto y que al lado de una foto de fiesta se
 * veía como un error. Ahora es una tarjeta de papel: comillas grandes en
 * dorado y el texto en la serif de la marca, que es como se lee un mensaje
 * escrito a mano.
 */
function CuerpoMensaje({ item, alto }: { item: LiveItem; alto: string }) {
  return (
    <div
      className={`relative w-full ${alto} flex flex-col items-center justify-center p-8 text-center overflow-hidden`}
      style={{ background: "linear-gradient(160deg, #16231E 0%, #0D1512 100%)" }}
    >
      <span
        aria-hidden
        className="absolute top-2 left-5 font-serif text-[110px] leading-none text-[#C79A4B]/20 select-none"
      >
        &ldquo;
      </span>
      <p className="relative font-serif text-xl md:text-2xl leading-snug text-[#F6F3EC]/95 line-clamp-6">
        {item.fileUrl}
      </p>
    </div>
  );
}

/**
 * Una tarjeta de la fila: foto o mensaje, con quién lo mandó y sus reacciones.
 *
 * Las reacciones van ARRIBA y el "Enviado por" abajo a la izquierda, chico.
 * Antes compartían una barra al pie y con cinco reacciones no entraban: el
 * nombre se cortaba o las píldoras se salían de la tarjeta. Arriba tienen la
 * fila entera para ellas, y el nombre abajo es un dato, no un título.
 */
function TarjetaLive({ item, marcada }: { item: LiveItem; marcada?: boolean }) {
  const alto = "h-64 md:h-80";

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-[#F6F3EC]/10 bg-[#111A17] shrink-0 w-64 md:w-80 ${
        marcada ? "live-recien" : ""
      }`}
      style={{
        transform: `rotate(${inclinacion(item.id)}deg)`,
        boxShadow: "0 20px 60px rgba(0,0,0,.5)",
      }}
    >
      {item.type === "PHOTO" ? (
        <CuerpoFoto item={item} alto={alto} />
      ) : (
        <CuerpoMensaje item={item} alto={alto} />
      )}

      <div className="absolute inset-x-0 top-0 px-2.5 pt-2.5 pb-7 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <ReaccionesEnPantalla item={item} />
      </div>

      {item.guestName && (
        <span className="absolute bottom-2.5 left-2.5 max-w-[52%] truncate rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-[11px] text-[#F6F3EC]/75">
          Enviado por <strong className="text-[#C79A4B] font-semibold">{item.guestName}</strong>
        </span>
      )}
    </div>
  );
}

/**
 * El momento grande: lo que acaba de llegar, ocupando la pantalla unos
 * segundos antes de sumarse a la fila.
 */
function Protagonista({ item }: { item: LiveItem }) {
  return (
    <motion.div
      key={item.id}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-[#050807]/75 backdrop-blur-xl" />

      <motion.div
        className="relative flex flex-col items-center gap-5 max-w-[80vw]"
        initial={{ scale: 0.86, y: 34, rotate: -1.5 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.94, y: 18 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
      >
        <p className="text-[#C79A4B] text-xs md:text-sm font-mono uppercase tracking-[0.3em]">
          {item.type === "PHOTO" ? "Recién llegada" : "Nuevo mensaje"}
        </p>

        <div
          className="relative rounded-3xl overflow-hidden border border-[#C79A4B]/30"
          style={{ boxShadow: "0 30px 90px rgba(0,0,0,.7), 0 0 0 1px rgba(199,154,75,.18)" }}
        >
          {item.type === "PHOTO" ? (
            <img
              src={item.fileUrl}
              alt=""
              className="max-h-[58vh] max-w-[72vw] w-auto object-contain block"
            />
          ) : (
            <div className="max-w-[70vw] px-12 py-14 text-center" style={{ background: "linear-gradient(160deg, #16231E 0%, #0D1512 100%)" }}>
              <p className="font-serif text-3xl md:text-5xl leading-snug text-[#F6F3EC]">
                &ldquo;{item.fileUrl}&rdquo;
              </p>
            </div>
          )}
          <div className="live-destello" aria-hidden />
        </div>

        {item.guestName && (
          <p className="font-serif text-2xl md:text-3xl text-[#F6F3EC]/90">
            <span className="opacity-50 text-lg md:text-xl">Enviado por </span>
            <span className="text-[#C79A4B]">{item.guestName}</span>
          </p>
        )}

        {/* Si ya venía con reacciones, se ven acá también: es la foto que
            más mira el salón, y esconder el número justo en ese momento
            sería esconderlo cuando más se luce. */}
        <ReaccionesEnPantalla item={item} grande />
      </motion.div>
    </motion.div>
  );
}

/**
 * Lo que devuelve /api/live/public/[token].
 *
 * `false` es "la busqué y no está" -- distinto de `null`, que es "todavía no
 * pregunté". La pantalla necesita separar los dos casos: con null muestra
 * "Cargando", con false muestra que el LIVE terminó.
 */
type SesionLive = {
    isActive: boolean;
    invitation?: {
        nombreEvento?: string | null;
        tipo?: string | null;
        nombreNovia?: string | null;
        nombreNovio?: string | null;
        nombreQuinceanera?: string | null;
    } | null;
} | false | null;

export default function LiveScreenPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [session, setSession] = useState<SesionLive>(null);
    const [items, setItems] = useState<LiveItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Lo que se está mostrando en grande, y lo que hace un rato bajó a la fila.
    const [protagonista, setProtagonista] = useState<LiveItem | null>(null);
    const [marcado, setMarcado] = useState<string | null>(null);
    const yaVistosRef = useRef<Set<string>>(new Set());
    const primeraCargaRef = useRef(true);

    const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/live/${token}` : '';

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch(`/api/live/public/${token}`);
                if (res.ok) {
                    setSession(await res.json());
                } else {
                    setSession(false);
                }
            } catch {
                setSession(false);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [token]);

    useEffect(() => {
        if (!session) return;
        const fetchItems = async () => {
            try {
                const res = await fetch(`/api/live/public/${token}/items`);
                if (res.ok) {
                    setItems(await res.json());
                }
            } catch {}
        };
        fetchItems();
        const interval = setInterval(fetchItems, 3000);
        return () => clearInterval(interval);
    }, [session, token]);

    /**
     * De la lista al momento grande.
     *
     * La primera carga no cuenta: si la pantalla se enciende a mitad de la
     * fiesta, las cuarenta fotos que ya están no tienen que desfilar de a una
     * en grande. Se marcan como vistas y se muestra la fila directamente.
     *
     * Después, de a uno: mientras haya alguien en grande no se saca al
     * siguiente, así que si llegan cinco fotos juntas se muestran en fila,
     * una detrás de la otra, en vez de pisarse.
     */
    useEffect(() => {
        if (items.length === 0) return;

        if (primeraCargaRef.current) {
            items.forEach((i) => yaVistosRef.current.add(i.id));
            primeraCargaRef.current = false;
            return;
        }

        if (protagonista) return;

        // items viene ordenado del más nuevo al más viejo, así que el primero
        // sin ver es el más reciente que todavía no mostramos.
        const nuevo = items.find((i) => !yaVistosRef.current.has(i.id));
        if (!nuevo) return;

        yaVistosRef.current.add(nuevo.id);
        setProtagonista(nuevo);
    }, [items, protagonista]);

    useEffect(() => {
        if (!protagonista) return;
        const id = protagonista.id;
        const bajar = setTimeout(() => {
            setProtagonista(null);
            setMarcado(id);
        }, SEGUNDOS_EN_GRANDE);
        return () => clearTimeout(bajar);
    }, [protagonista]);

    useEffect(() => {
        if (!marcado) return;
        const apagar = setTimeout(() => setMarcado(null), SEGUNDOS_MARCADO);
        return () => clearTimeout(apagar);
    }, [marcado]);

    const cuentas = useMemo(() => {
        const fotos = items.filter((i) => i.type === "PHOTO").length;
        return { fotos, mensajes: items.length - fotos };
    }, [items]);

    if (loading) return <div className="min-h-dvh bg-[#050807] flex items-center justify-center text-white">Cargando...</div>;

    // `!session` cubre los dos casos que quedan después de cargar: que la
    // busqueda haya fallado (false) y que no haya nada (null). En los dos el
    // salón tiene que leer lo mismo.
    if (!session || !session.isActive) {
        return (
            <div className="min-h-dvh bg-[#050807] flex items-center justify-center text-white/50 font-serif text-2xl">
                Momentos está inactivo o finalizó.
            </div>
        );
    }

    return (
        <div className="live-escena min-h-dvh text-[#F6F3EC] p-8 flex flex-col font-sans">
            <div className="live-aura" aria-hidden />
            <LucesDeFondo />

            <header className="flex justify-between items-start border-b border-[#F6F3EC]/10 pb-8 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#C79A4B] text-xs font-mono uppercase tracking-widest">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        En Vivo
                    </div>
                    <h1 className="text-4xl font-serif font-bold mb-1">
                        {session.invitation?.nombreEvento || "Nuestra Fiesta"}
                    </h1>
                    {session.invitation && getHonoreeNames(session.invitation) && (
                        <p className="text-[#C79A4B] text-lg font-serif mb-2">
                            {getHonoreeNames(session.invitation)}
                        </p>
                    )}
                    <p className="text-[#F6F3EC]/60 mt-2">Escaneá el código para compartir tus fotos y mensajes al instante.</p>

                    {/* El contador es la parte divertida del encabezado: la gente
                        sube una foto para ver subir el número. */}
                    {items.length > 0 && (
                        <p className="mt-3 text-sm text-[#F6F3EC]/45 font-mono">
                            {cuentas.fotos} {cuentas.fotos === 1 ? "foto" : "fotos"}
                            {cuentas.mensajes > 0 && (
                                <> · {cuentas.mensajes} {cuentas.mensajes === 1 ? "mensaje" : "mensajes"}</>
                            )}
                        </p>
                    )}
                </div>

                <div className="bg-[#F6F3EC] p-4 rounded-xl shadow-2xl shrink-0 flex flex-col items-center gap-3">
                    <QRCodeSVG value={publicUrl} size={150} level="H" />
                    <LandingLogo href="" src="/landing/logo-negro-v2.png" className="h-4 w-auto" />
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative flex items-center">
                {items.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
                        <p className="font-serif text-3xl text-[#F6F3EC]/70">La pared está esperando</p>
                        <p className="text-[#F6F3EC]/35">Escaneá el código y sé el primero en subir una foto</p>
                    </div>
                ) : items.length < 5 ? (
                    <div className="flex justify-center items-center gap-6 w-full">
                        <AnimatePresence>
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                                >
                                    <TarjetaLive item={item} marcada={marcado === item.id} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    // Los bordes se desvanecen con una máscara y no con el
                    // degradado que trae el marquee: ese degradado pinta una
                    // franja del color de fondo, y el fondo dejó de ser un
                    // color plano -- quedaban dos manchas oscuras quietas
                    // sobre las auroras. La máscara recorta la opacidad, así
                    // que se lleva bien con cualquier cosa que haya detrás.
                    <div className="w-full [mask-image:linear-gradient(to_right,transparent,black_9%,black_91%,transparent)]">
                        <Marquee speed={40} gradient={false} autoFill>
                            {items.map((item) => (
                                <div key={item.id} className="mx-4 py-4">
                                    <TarjetaLive item={item} marcada={marcado === item.id} />
                                </div>
                            ))}
                        </Marquee>
                    </div>
                )}

                <AnimatePresence>
                    {protagonista && <Protagonista item={protagonista} />}
                </AnimatePresence>
            </div>
        </div>
    );
}
