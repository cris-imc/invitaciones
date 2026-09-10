"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Users, X, Minus, RotateCcw, Loader2, GripVertical, ScanLine, ArrowLeft } from "lucide-react";
import { EscanerIngreso } from "@/components/dashboard/mesas/EscanerIngreso";

interface LugarApi {
  id: string;
  guestId: string;
  lugares: number;
}
interface MesaApi {
  id: string;
  numero: number;
  alias: string | null;
  sillas: number;
  forma: string;
  posX: number;
  posY: number;
  orden: number;
  lugares: LugarApi[];
}
interface InvitadoApi {
  id: string;
  name: string;
  type: string;
  status: string;
  expectedCount: number;
  attendingCount: number;
  aSentar: number;
}
interface Pendiente extends InvitadoApi {
  ubicados: number;
}

interface Props {
  slug: string;
}

// El salón se dibuja en píxeles y las mesas se guardan en porcentaje. De ahí
// sale la respuesta a "¿y si tengo 20 mesas?": agrandar el salón separa todo
// proporcionalmente, sin tener que reacomodar una por una. Por eso el control
// de abajo se llama "Espacio" y no "zoom" -- no acerca la cámara, agranda el
// salón.
const ESPACIO_MIN = 0.6;
const ESPACIO_MAX = 1.6;
const ESPACIO_PASO = 0.15;
const ANCHO_BASE = 880;
const ALTO_BASE = 660;

// Cinco columnas por cinco filas de cunas: 25 posiciones, más que las mesas
// que entran en un salón real. La separación está calculada contra el tamaño
// dibujado de una mesa (hasta 130px de tablero + 18 de sillas): pegadas, las
// mesas nuevas nacían una encima de otra y había que despegarlas a mano antes
// de poder trabajar.
const COLUMNAS = [12, 31, 50, 69, 88];
const FILA_ALTO = 18;
const FILA_PRIMERA = 15;

/** Cuántos invitados sin ubicar se listan por página. */
const POR_PAGINA = 8;

/**
 * Cómo se llama la mesa para el anfitrión. El alias manda si lo puso, porque
 * es con lo que él piensa el salón ("los primos van con los tíos"); el número
 * queda al lado, chico, porque es lo que va a leer el invitado y tiene que
 * poder cruzar una cosa con la otra de un vistazo.
 */
function rotulo(mesa: MesaApi): { titulo: string; secundario: string | null } {
  return mesa.alias
    ? { titulo: mesa.alias, secundario: `MESA ${mesa.numero}` }
    : { titulo: `Mesa ${mesa.numero}`, secundario: null };
}

// Cuánto tienen que separarse los centros de dos mesas para no pisarse, en
// porcentaje del salón. Sale del tamaño dibujado: una mesa grande ocupa unos
// 148px (130 de tablero más las sillas alrededor) sobre un salón base de
// 880x660.
const SEPARACION_X = 15;
const SEPARACION_Y = 17;

// Un color por grupo DENTRO de cada mesa, no por familia en todo el salón:
// lo que hay que poder ver de un vistazo es si una mesa está formada por
// varios grupos o por uno solo. Empezando de nuevo en cada mesa, dos grupos
// sentados juntos nunca pueden tocarle el mismo color por casualidad, y que
// se repitan entre mesas distintas no molesta -- ahí no se comparan.
const PALETA = [
  "#E0B252", // el dorado de la marca, para el caso más común: mesa de un grupo
  "#5BA8D4",
  "#7ECF9A",
  "#E08A6B",
  "#B79BE0",
  "#E0D06B",
  "#6BD4C4",
  "#E07BA8",
];

type Punto = { posX: number; posY: number };

/** 0 = encima; 1 = justo a la distancia mínima; más de 1 = separadas. */
function separacion(a: Punto, b: Punto): number {
  return Math.hypot((a.posX - b.posX) / SEPARACION_X, (a.posY - b.posY) / SEPARACION_Y);
}

const CUNAS: Punto[] = COLUMNAS.flatMap((posX, col) =>
  Array.from({ length: 5 }, (_, fila) => ({ posX, posY: FILA_PRIMERA + fila * FILA_ALTO }))
    .map((c) => ({ ...c, col }))
).sort((a, b) => a.posY - b.posY || a.col - b.col);

/**
 * Dónde nace la próxima mesa: la primera cuna que no le quede encima a ninguna
 * de las que ya están.
 *
 * Antes se comparaban las coordenadas exactas, y eso fallaba apenas alguien
 * arrastraba una mesa: una mesa movida a 11,19 no coincide con la cuna 12,15,
 * así que esa cuna figuraba libre y la mesa nueva aparecía justo encima. Lo
 * que importa no es si el punto está tomado, sino si hay lugar.
 */
function cunaLibre(mesas: MesaApi[]): Punto {
  const libre = CUNAS.find((c) => mesas.every((m) => separacion(c, m) >= 1));
  if (libre) return { posX: libre.posX, posY: libre.posY };

  // Salón lleno: en vez de apilarla en el centro, va al hueco más grande que
  // quede. Va a estar apretada igual, pero es el mejor lugar disponible y el
  // anfitrión la puede arrastrar o agrandar el salón con "+".
  let mejor = CUNAS[0];
  let mejorDistancia = -1;
  for (const c of CUNAS) {
    const cercana = Math.min(...mesas.map((m) => separacion(c, m)));
    if (cercana > mejorDistancia) {
      mejorDistancia = cercana;
      mejor = c;
    }
  }
  return { posX: mejor.posX, posY: mejor.posY };
}

export function MesasPanel({ slug }: Props) {
  const [mesas, setMesas] = useState<MesaApi[]>([]);
  const [invitados, setInvitados] = useState<InvitadoApi[]>([]);
  const [habilitadas, setHabilitadas] = useState(false);
  const [escaneo, setEscaneo] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [mesaAbierta, setMesaAbierta] = useState<string | null>(null);
  const [espacio, setEspacio] = useState(1);
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(0);
  const [escaneando, setEscaneando] = useState(false);

  const lienzoRef = useRef<HTMLDivElement>(null);
  const fantasmaRef = useRef<HTMLDivElement>(null);
  // Distingue arrastrar de hacer click: si se movió, el pointerup no abre el
  // editor ni cambia la selección.
  const arrastreMesa = useRef<{ id: string; movio: boolean } | null>(null);
  const arrastreInv = useRef<{ id: string; x0: number; y0: number; movio: boolean } | null>(null);
  // Dónde está el dedo. El fantasma se pinta recién en el render siguiente al
  // que arranca el arrastre; sin esto aparecía un instante en la esquina
  // superior izquierda antes de saltar a su lugar.
  const ultimaPos = useRef({ x: 0, y: 0 });

  const mostrarAviso = useCallback((texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso((a) => (a === texto ? null : a)), 4000);
  }, []);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`/api/invitations/${slug}/mesas`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        mostrarAviso(data.error || "No se pudieron cargar las mesas");
        return;
      }
      const data = await res.json();
      setMesas(data.mesas ?? []);
      setInvitados(data.invitados ?? []);
      setHabilitadas(Boolean(data.habilitadas));
      setEscaneo(Boolean(data.escaneo));
    } finally {
      setCargando(false);
    }
  }, [slug, mostrarAviso]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // ── Cuentas ──────────────────────────────────────────────────────
  const porInvitado = useMemo(() => {
    const m = new Map<string, number>();
    for (const mesa of mesas) {
      for (const l of mesa.lugares) {
        m.set(l.guestId, (m.get(l.guestId) ?? 0) + l.lugares);
      }
    }
    return m;
  }, [mesas]);

  const infoPorId = useMemo(
    () => new Map(invitados.map((i) => [i.id, i])),
    [invitados]
  );

  // Los que todavía tienen gente sin ubicar. Una familia aparece acá aunque ya
  // esté sentada a medias: si de 6 se ubicaron 4, quedan 2 para repartir en
  // otra mesa, y ese resto es justamente lo que hay que resolver.
  const pendientes = useMemo<Pendiente[]>(
    () =>
      invitados
        .map((i) => ({ ...i, ubicados: porInvitado.get(i.id) ?? 0 }))
        .filter((i) => i.aSentar > 0 && i.ubicados < i.aSentar),
    [invitados, porInvitado]
  );

  const ocupacion = useCallback(
    (mesa: MesaApi) => mesa.lugares.reduce((a, l) => a + l.lugares, 0),
    []
  );

  const totales = useMemo(() => {
    const aSentar = invitados.reduce((a, i) => a + i.aSentar, 0);
    const ubicados = mesas.reduce((a, m) => a + ocupacion(m), 0);
    const sillas = mesas.reduce((a, m) => a + m.sillas, 0);
    return { aSentar, ubicados, sillas };
  }, [invitados, mesas, ocupacion]);

  const invitadoSel = seleccionado
    ? pendientes.find((p) => p.id === seleccionado) ?? null
    : null;

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return q ? pendientes.filter((p) => p.name.toLowerCase().includes(q)) : pendientes;
  }, [pendientes, busqueda]);

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  // Al ir ubicando gente la lista se acorta, y la página en la que estabas
  // puede dejar de existir: sin esto quedaría en blanco.
  const paginaActual = Math.min(pagina, paginas - 1);
  const visibles = filtrados.slice(paginaActual * POR_PAGINA, (paginaActual + 1) * POR_PAGINA);

  useEffect(() => {
    if (pagina !== paginaActual) setPagina(paginaActual);
  }, [pagina, paginaActual]);

  useEffect(() => {
    setPagina(0);
  }, [busqueda]);

  // El salón crece solo con la cantidad de mesas, además de lo que sume el
  // control de espacio: con 20 mesas en el lienzo de 8, nacen amontonadas.
  const extra = Math.max(0, mesas.length - 10);
  const anchoPx = Math.round((ANCHO_BASE + extra * 70) * espacio);
  const altoPx = Math.round((ALTO_BASE + extra * 45) * espacio);

  // Hasta dónde llega el salón que se ve. El lienzo por dentro mide siempre lo
  // mismo -- las posiciones son porcentajes suyos, y achicarlo de verdad
  // comprimiría las mesas entre sí hasta pisarse --, pero se recorta a la
  // altura de la mesa más baja: sin esto quedaba media pantalla vacía debajo
  // de las mesas. Al arrastrar una hacia abajo, el recorte crece con ella.
  const masBaja = mesas.length > 0 ? Math.max(...mesas.map((m) => m.posY)) : 0;
  const altoVisible =
    mesas.length === 0
      ? Math.min(altoPx, 340)
      : Math.min(altoPx, Math.max(300, Math.round(((masBaja + 14) / 100) * altoPx)));

  // Al abrir, el salón se achica lo justo para entrar entero en pantalla: la
  // primera imagen tiene que ser el plano completo, no un pedazo con scroll.
  // Una sola vez -- después manda lo que elija el anfitrión con − / +.
  const yaAjustado = useRef(false);
  useEffect(() => {
    if (yaAjustado.current || cargando || mesas.length === 0) return;
    const caja = lienzoRef.current?.parentElement;
    if (!caja || caja.clientWidth === 0) return;
    yaAjustado.current = true;
    const necesario = ANCHO_BASE + Math.max(0, mesas.length - 10) * 70;
    const cabe = caja.clientWidth / necesario;
    if (cabe < 1) setEspacio(Math.max(ESPACIO_MIN, +cabe.toFixed(2)));
  }, [cargando, mesas.length]);

  // ── Acciones ─────────────────────────────────────────────────────
  const pedir = useCallback(
    async (url: string, init: RequestInit) => {
      setOcupado(true);
      try {
        const res = await fetch(url, {
          headers: { "Content-Type": "application/json" },
          ...init,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          mostrarAviso(data.error || "No se pudo guardar");
          return null;
        }
        return data;
      } catch {
        mostrarAviso("No se pudo guardar");
        return null;
      } finally {
        setOcupado(false);
      }
    },
    [mostrarAviso]
  );

  const alternarHabilitadas = async () => {
    const nuevo = !habilitadas;
    const r = await pedir(`/api/invitations/${slug}`, {
      method: "PATCH",
      body: JSON.stringify({ mesasHabilitadas: nuevo }),
    });
    if (r) {
      setHabilitadas(nuevo);
      mostrarAviso(
        nuevo
          ? "Listo: cada invitado va a ver su mesa en la portada de su invitación."
          : "Las mesas quedan sólo para vos. Los invitados no ven nada."
      );
    }
  };

  const alternarEscaneo = async () => {
    const nuevo = !escaneo;
    const r = await pedir(`/api/invitations/${slug}`, {
      method: "PATCH",
      body: JSON.stringify({ escaneoHabilitado: nuevo }),
    });
    if (r) {
      setEscaneo(nuevo);
      if (escaneando && !nuevo) setEscaneando(false);
      mostrarAviso(
        nuevo
          ? "Listo: cada invitación termina con un QR y podés escanear en la puerta."
          : "Sin control en la puerta: el QR desaparece de las invitaciones."
      );
    }
  };

  const crearMesa = async () => {
    const nueva = await pedir(`/api/invitations/${slug}/mesas`, {
      method: "POST",
      body: JSON.stringify(cunaLibre(mesas)),
    });
    if (nueva) {
      await cargar();
      setMesaAbierta(nueva.id);
    }
  };

  const editarMesa = async (id: string, cambios: Record<string, unknown>) => {
    const r = await pedir(`/api/mesas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(cambios),
    });
    if (r) await cargar();
  };

  const borrarMesa = async (id: string) => {
    const r = await pedir(`/api/mesas/${id}`, { method: "DELETE" });
    if (r) {
      setMesaAbierta(null);
      await cargar();
    }
  };

  const asignar = async (mesaId: string, guestId: string, lugares: number) => {
    const r = await pedir(`/api/mesas/${mesaId}/lugares`, {
      method: "PUT",
      body: JSON.stringify({ guestId, lugares }),
    });
    if (r) await cargar();
    return r;
  };

  /** Sentar a una familia en una mesa: entra lo que quede libre. */
  const sentarEn = async (mesa: MesaApi, quien: Pendiente) => {
    const libres = Math.max(0, mesa.sillas - ocupacion(mesa));
    const faltan = quien.aSentar - quien.ubicados;
    if (libres === 0) {
      mostrarAviso(`${rotulo(mesa).titulo} ya está completa. Agrandala o elegí otra.`);
      return;
    }
    const yaAca = mesa.lugares.find((l) => l.guestId === quien.id)?.lugares ?? 0;
    const suman = Math.min(libres, faltan);
    const r = await asignar(mesa.id, quien.id, yaAca + suman);
    if (r) {
      if (suman < faltan) {
        mostrarAviso(
          `${quien.name}: ${suman} en ${rotulo(mesa).titulo}, quedan ${faltan - suman} por ubicar.`
        );
      }
      setSeleccionado(null);
    }
  };

  // ── Arrastre de mesas dentro del salón ───────────────────────────
  const mesaPointerDown = (e: React.PointerEvent, mesa: MesaApi) => {
    if (ocupado) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    arrastreMesa.current = { id: mesa.id, movio: false };
  };

  const mesaPointerMove = (e: React.PointerEvent) => {
    const a = arrastreMesa.current;
    if (!a || !lienzoRef.current) return;
    const r = lienzoRef.current.getBoundingClientRect();
    const x = Math.min(96, Math.max(4, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(94, Math.max(6, ((e.clientY - r.top) / r.height) * 100));
    a.movio = true;
    setMesas((prev) => prev.map((m) => (m.id === a.id ? { ...m, posX: x, posY: y } : m)));
  };

  const mesaPointerUp = (e: React.PointerEvent, mesa: MesaApi) => {
    const a = arrastreMesa.current;
    arrastreMesa.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (!a) return;
    e.stopPropagation();

    if (!a.movio) {
      if (invitadoSel) sentarEn(mesa, invitadoSel);
      else setMesaAbierta((prev) => (prev === mesa.id ? null : mesa.id));
      return;
    }
    const actual = mesas.find((m) => m.id === mesa.id);
    if (actual) {
      // Sin recargar: la posición ya está en pantalla y volver a pedir todo
      // haría saltar la mesa mientras se sigue acomodando el salón.
      pedir(`/api/mesas/${mesa.id}`, {
        method: "PATCH",
        body: JSON.stringify({ posX: actual.posX, posY: actual.posY }),
      });
    }
  };

  // ── Arrastre de una familia hasta una mesa ───────────────────────
  const invPointerDown = (e: React.PointerEvent, p: Pendiente) => {
    if (ocupado) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    arrastreInv.current = { id: p.id, x0: e.clientX, y0: e.clientY, movio: false };
  };

  const invPointerMove = (e: React.PointerEvent) => {
    const a = arrastreInv.current;
    if (!a) return;
    ultimaPos.current = { x: e.clientX, y: e.clientY };
    if (!a.movio) {
      // Un umbral chico antes de considerar que es un arrastre: sin esto, el
      // temblor del dedo al tocar convertía cada click en un drag fallido.
      if (Math.hypot(e.clientX - a.x0, e.clientY - a.y0) < 8) return;
      a.movio = true;
      setArrastrando(a.id);
    }
    if (fantasmaRef.current) {
      fantasmaRef.current.style.left = `${e.clientX}px`;
      fantasmaRef.current.style.top = `${e.clientY}px`;
    }
  };

  const invPointerUp = (e: React.PointerEvent, p: Pendiente) => {
    const a = arrastreInv.current;
    arrastreInv.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setArrastrando(null);
    if (!a) return;

    if (!a.movio) {
      setSeleccionado((prev) => (prev === p.id ? null : p.id));
      return;
    }
    // El fantasma no tapa el destino (pointer-events:none), así que lo que hay
    // bajo el dedo al soltar es la mesa de verdad.
    const destino = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest("[data-mesa-id]") as HTMLElement | null;
    const id = destino?.dataset.mesaId;
    const mesaDestino = id ? mesas.find((m) => m.id === id) : null;
    if (mesaDestino) sentarEn(mesaDestino, p);
  };

  const arrastrado = arrastrando ? pendientes.find((p) => p.id === arrastrando) ?? null : null;
  const eligiendo = Boolean(invitadoSel || arrastrado);
  const mesa = mesaAbierta ? mesas.find((m) => m.id === mesaAbierta) ?? null : null;

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Armando el salón…
      </div>
    );
  }

  // El escáner ocupa la pantalla entera y esconde el plano: se usa parado en
  // la puerta, con una mano, no mientras se acomoda el salón.
  if (escaneando) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setEscaneando(false)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al salón
        </button>
        <EscanerIngreso slug={slug} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Resumen + acciones ── */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={crearMesa}
          disabled={ocupado}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-[var(--ink)] text-sm font-semibold px-4 py-2 transition-all hover:brightness-110 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Agregar mesa
        </button>

        {/* Sólo cuando las mesas están activas: el QR de ingreso aparece en la
            invitación bajo la misma condición, así que sin eso no habría nada
            que escanear. */}
        {escaneo && (
          <button
            type="button"
            onClick={() => setEscaneando(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 text-sm font-semibold px-4 py-2 transition-all hover:bg-white/10"
          >
            <ScanLine className="w-4 h-4" />
            Escanear ingreso
          </button>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-ui">
          <span>
            <strong className="text-foreground">{totales.ubicados}</strong> de{" "}
            {totales.aSentar} ubicados
          </span>
          <span>
            {mesas.length} {mesas.length === 1 ? "mesa" : "mesas"} · {totales.sillas} lugares
          </span>
        </div>

        {/* Espacio del salón */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Espacio</span>
          <button
            type="button"
            onClick={() => setEspacio((z) => Math.max(ESPACIO_MIN, +(z - ESPACIO_PASO).toFixed(2)))}
            disabled={espacio <= ESPACIO_MIN}
            className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 disabled:opacity-40"
            aria-label="Achicar el salón"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setEspacio((z) => Math.min(ESPACIO_MAX, +(z + ESPACIO_PASO).toFixed(2)))}
            disabled={espacio >= ESPACIO_MAX}
            className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 disabled:opacity-40"
            aria-label="Agrandar el salón"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mostrarlas o no es una decisión aparte de armarlas: el anfitrión puede
          querer el plano para sí mismo y que la invitación no diga nada. */}
      <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-card p-3 cursor-pointer">
        <input
          type="checkbox"
          checked={habilitadas}
          disabled={ocupado}
          onChange={alternarHabilitadas}
          className="mt-0.5 w-4 h-4 accent-[var(--accent)] shrink-0"
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium">Mostrarle la mesa a cada invitado</span>
          <span className="block text-xs text-muted-foreground">
            Aparece en su pase, dentro de la invitación. Si una familia quedó
            repartida, ve las dos mesas, sin el detalle de quién va en cada una.
          </span>
        </span>
      </label>

      {/* Aparte del anterior a propósito: son dos decisiones distintas. Hay
          eventos que asignan mesas y reciben a la gente sin registrar nada, y
          otros que quieren saber quién llegó aunque sea todo libre. */}
      <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-card p-3 cursor-pointer">
        <input
          type="checkbox"
          checked={escaneo}
          disabled={ocupado}
          onChange={alternarEscaneo}
          className="mt-0.5 w-4 h-4 accent-[var(--accent)] shrink-0"
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium">Controlar el ingreso con QR</span>
          <span className="block text-xs text-muted-foreground">
            Cada invitación termina con un QR. Lo escaneás en la puerta y ves
            quiénes son, cuántos vienen y a qué mesa mandarlos. Queda registrado
            quién llegó y a qué hora.
          </span>
        </span>
      </label>

      {aviso && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          {aviso}
        </div>
      )}

      <div className="grid gap-4 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* ── El salón ── */}
        {/* `min-w-0` no es decorativo: sin él, en mobile la columna de la
            grilla se dimensiona por su contenido -- el salón entero, que es
            más ancho que el teléfono -- y el desborde se lo come toda la
            página en vez de quedar contenido en este recuadro con scroll. */}
        <div
          className="min-w-0 overflow-auto max-h-[72vh] rounded-xl border border-white/10"
          style={{ height: altoVisible }}
        >
          <div
            ref={lienzoRef}
            // Tocar el piso vacío suelta lo que estuviera elegido y cierra la
            // mesa abierta: sin esto había que volver a la lista para poder
            // cambiar de idea.
            onPointerDown={() => {
              setSeleccionado(null);
              setMesaAbierta(null);
            }}
            className="relative bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,.05),transparent_65%)] bg-black/25"
            // Sin mesas, el salón toma el ancho de la pantalla en vez de sus
            // 880px: el cartel de "todavía no hay mesas" se centra respecto
            // del lienzo, y en un teléfono ese centro caía fuera de lo que se
            // ve, así que el texto aparecía corrido y cortado. Un salón vacío
            // tampoco necesita ancho: no hay nada que acomodar todavía.
            style={
              mesas.length === 0
                ? { width: "100%", height: Math.min(altoPx, 340) }
                : { width: anchoPx, height: altoPx, minWidth: "100%" }
            }
          >
            {mesas.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6 pointer-events-none">
                <Users className="w-7 h-7 text-white/20" />
                <p className="text-sm text-muted-foreground max-w-xs">
                  Todavía no hay mesas. Agregá la primera y arrastrala para armar el
                  salón como va a estar el día del evento.
                </p>
              </div>
            )}

            {mesas.map((m) => (
              <MesaDibujo
                key={m.id}
                mesa={m}
                ocupadas={ocupacion(m)}
                abierta={mesaAbierta === m.id}
                resaltada={eligiendo}
                onPointerDown={(e) => mesaPointerDown(e, m)}
                onPointerMove={mesaPointerMove}
                onPointerUp={(e) => mesaPointerUp(e, m)}
              />
            ))}
          </div>
        </div>

        {/* ── Costado: editor de mesa / sin ubicar ── */}
        <div className="space-y-4">
          {mesa ? (
            <EditorMesa
              mesa={mesa}
              ocupadas={ocupacion(mesa)}
              infoPorId={infoPorId}
              ocupado={ocupado}
              onCerrar={() => setMesaAbierta(null)}
              onCambiar={(c) => editarMesa(mesa.id, c)}
              onBorrar={() => borrarMesa(mesa.id)}
              onLugares={(guestId, lugares) => asignar(mesa.id, guestId, lugares)}
            />
          ) : null}

          <div className="min-w-0 rounded-xl border border-white/10 bg-card p-3">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold">Sin ubicar</h3>
              <span className="text-xs text-muted-foreground shrink-0">
                {pendientes.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {invitadoSel
                ? "Ahora tocá una mesa del salón."
                : "Arrastrá un invitado o familia hasta la mesa, o tocalo y después tocá la mesa."}
            </p>

            {/* Con un evento chico sobra la lista sola; con 60 grupos, sin
                buscador hay que scrollear a mano hasta encontrar a alguien. */}
            {pendientes.length > POR_PAGINA && (
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar…"
                className="w-full mb-2 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)] placeholder:text-white/25"
              />
            )}

            {pendientes.length === 0 ? (
              // Distinto de "no hay nadie": si todavía nadie confirmó, la lista
              // vacía no significa que esté todo resuelto, y decir "están todos
              // ubicados" sería mentir.
              totales.aSentar === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  Todavía no confirmó nadie. Sólo se pueden ubicar los invitados
                  que confirmaron: sentar a quien no dijo si viene es acomodar el
                  salón con un número inventado.
                </p>
              ) : (
                <p className="text-xs text-emerald-400 py-2">Están todos ubicados.</p>
              )
            ) : visibles.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                Nadie sin ubicar coincide con “{busqueda}”.
              </p>
            ) : (
              <ul className="space-y-1 pr-1">
                {visibles.map((p) => {
                  const faltan = p.aSentar - p.ubicados;
                  const elegido = seleccionado === p.id;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onPointerDown={(e) => invPointerDown(e, p)}
                        onPointerMove={invPointerMove}
                        onPointerUp={(e) => invPointerUp(e, p)}
                        className={`w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm touch-none select-none transition-colors ${
                          elegido
                            ? "bg-[var(--accent)] text-[var(--ink)] font-semibold"
                            : "hover:bg-white/5"
                        } ${arrastrando === p.id ? "opacity-40" : ""}`}
                      >
                        <GripVertical
                          className={`w-3.5 h-3.5 shrink-0 ${
                            elegido ? "text-[var(--ink)]/50" : "text-white/25"
                          }`}
                        />
                        <span className="min-w-0 flex-1 truncate">{p.name}</span>
                        <span
                          className={`shrink-0 text-xs ${
                            elegido ? "text-[var(--ink)]/70" : "text-muted-foreground"
                          }`}
                        >
                          {p.ubicados > 0 ? `faltan ${faltan}` : faltan}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Paginado y no una tira con scroll: con muchos invitados, la
                tira obliga a recordar por dónde ibas cada vez que asignás uno
                y la lista se reordena sola bajo el dedo. */}
            {paginas > 1 && (
              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.max(0, p - 1))}
                  disabled={paginaActual === 0}
                  className="rounded-lg border border-white/15 px-2.5 py-1 text-xs hover:bg-white/10 disabled:opacity-30"
                >
                  ‹ Anterior
                </button>
                <span className="text-xs text-muted-foreground">
                  {paginaActual + 1} de {paginas}
                </span>
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.min(paginas - 1, p + 1))}
                  disabled={paginaActual >= paginas - 1}
                  className="rounded-lg border border-white/15 px-2.5 py-1 text-xs hover:bg-white/10 disabled:opacity-30"
                >
                  Siguiente ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fantasma que sigue al dedo mientras se arrastra un invitado. */}
      {arrastrado && (
        <div
          ref={fantasmaRef}
          style={{ left: ultimaPos.current.x, top: ultimaPos.current.y }}
          className="fixed z-[300] -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full bg-[var(--accent)] text-[var(--ink)] text-xs font-semibold px-3 py-1.5 shadow-lg"
        >
          {arrastrado.name} · {arrastrado.aSentar - arrastrado.ubicados}
        </div>
      )}
    </div>
  );
}

// ── Dibujo de una mesa ─────────────────────────────────────────────
function MesaDibujo({
  mesa,
  ocupadas,
  abierta,
  resaltada,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  mesa: MesaApi;
  ocupadas: number;
  abierta: boolean;
  resaltada: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}) {
  const excedida = ocupadas > mesa.sillas;
  const libres = Math.max(0, mesa.sillas - ocupadas);
  const redonda = mesa.forma !== "RECTANGULAR";

  // El tamaño crece con las sillas, pero poco: una mesa de 20 que ocupe el
  // doble que una de 8 deja el plano ilegible.
  const diametro = Math.min(130, 62 + mesa.sillas * 3.4);
  const porLado = Math.ceil(mesa.sillas / 2);
  const ancho = redonda ? diametro : Math.min(230, 46 + porLado * 19);
  const alto = redonda ? diametro : 58;

  const borde = excedida
    ? "border-red-500/80"
    : abierta
    ? "border-[var(--accent)]"
    : resaltada && libres > 0
    ? "border-emerald-400/70"
    : "border-white/25";

  const { titulo, secundario } = rotulo(mesa);

  // Las sillas se pintan en orden: las primeras del primer grupo con su color,
  // las siguientes del segundo, y las que sobran quedan grises. Así una mesa
  // de un solo grupo se ve de un color y una mezclada se ve mezclada, que es
  // justo lo que hay que poder distinguir de un vistazo.
  const colorDeSilla: (string | undefined)[] = [];
  mesa.lugares.forEach((l, i) => {
    for (let n = 0; n < l.lugares; n++) colorDeSilla.push(PALETA[i % PALETA.length]);
  });

  return (
    <div
      data-mesa-id={mesa.id}
      className="absolute touch-none select-none cursor-grab active:cursor-grabbing"
      style={{ left: `${mesa.posX}%`, top: `${mesa.posY}%`, transform: "translate(-50%,-50%)" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="relative" style={{ width: ancho, height: alto }}>
        {/* sillas */}
        {Array.from({ length: mesa.sillas }).map((_, i) => {
          const color = colorDeSilla[i];
          const estilo: React.CSSProperties = { position: "absolute" };
          if (redonda) {
            const ang = (i / mesa.sillas) * Math.PI * 2 - Math.PI / 2;
            const r = diametro / 2 + 9;
            estilo.left = `calc(50% + ${Math.cos(ang) * r}px)`;
            estilo.top = `calc(50% + ${Math.sin(ang) * r}px)`;
            estilo.transform = "translate(-50%,-50%)";
          } else {
            const arriba = i < porLado;
            const idx = arriba ? i : i - porLado;
            const cuantas = arriba ? porLado : mesa.sillas - porLado;
            estilo.left = `${((idx + 0.5) / cuantas) * 100}%`;
            estilo.top = arriba ? -9 : alto + 9;
            estilo.transform = "translate(-50%,-50%)";
          }
          return (
            <span
              key={i}
              style={{ ...estilo, background: color ?? "rgba(255,255,255,.2)" }}
              className="block w-2.5 h-2.5 rounded-full"
            />
          );
        })}

        {/* tablero */}
        <div
          className={`w-full h-full border-2 ${borde} bg-white/[0.06] flex flex-col items-center justify-center gap-0.5 transition-colors ${
            redonda ? "rounded-full" : "rounded-lg"
          }`}
        >
          <span className="text-[11px] font-semibold leading-none px-1 text-center truncate max-w-[92%]">
            {titulo}
          </span>
          {secundario && (
            <span className="text-[8px] leading-none text-white/40 tracking-wide">
              ({secundario})
            </span>
          )}
          <span
            className={`text-[10px] leading-none ${
              excedida ? "text-red-400 font-semibold" : "text-white/50"
            }`}
          >
            {ocupadas}/{mesa.sillas}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Editor de una mesa ─────────────────────────────────────────────
function EditorMesa({
  mesa,
  ocupadas,
  infoPorId,
  ocupado,
  onCerrar,
  onCambiar,
  onBorrar,
  onLugares,
}: {
  mesa: MesaApi;
  ocupadas: number;
  infoPorId: Map<string, InvitadoApi>;
  ocupado: boolean;
  onCerrar: () => void;
  onCambiar: (cambios: Record<string, unknown>) => void;
  onBorrar: () => void;
  onLugares: (guestId: string, lugares: number) => void;
}) {
  const [alias, setAlias] = useState(mesa.alias ?? "");
  const [confirmaBorrar, setConfirmaBorrar] = useState(false);

  // Lo último tipeado, lo último guardado y la función de guardar, en refs.
  // El editor se cierra al tocar el salón, y `pointerdown` corre ANTES que
  // `blur`: confiando sólo en blur, el apodo recién escrito se perdía junto
  // con el editor. Con esto se guarda solo mientras se escribe, y lo que
  // quede pendiente se descarga al cerrar.
  const aliasRef = useRef(alias);
  const guardadoRef = useRef(mesa.alias ?? "");
  const onCambiarRef = useRef(onCambiar);
  aliasRef.current = alias;
  onCambiarRef.current = onCambiar;

  const guardarAlias = useCallback((valor: string) => {
    if (valor === guardadoRef.current) return;
    guardadoRef.current = valor;
    onCambiarRef.current({ alias: valor });
  }, []);

  // Sólo al cambiar de mesa, no cada vez que llegan datos nuevos del servidor:
  // mientras el editor está abierto manda lo que hay en el campo, o una
  // recarga en medio de la escritura pisaría lo que se está tipeando.
  useEffect(() => {
    setAlias(mesa.alias ?? "");
    guardadoRef.current = mesa.alias ?? "";
    setConfirmaBorrar(false);
  }, [mesa.id]);

  useEffect(() => {
    if (alias === guardadoRef.current) return;
    const t = window.setTimeout(() => guardarAlias(alias), 600);
    return () => window.clearTimeout(t);
  }, [alias, guardarAlias]);

  useEffect(() => () => guardarAlias(aliasRef.current), [guardarAlias]);

  const excedida = ocupadas > mesa.sillas;

  return (
    <div className="rounded-xl border border-[var(--accent)]/40 bg-card p-3 space-y-3">
      <div className="flex items-start justify-between gap-2">
        {/* El número arriba y fijo: es lo que el invitado va a leer y lo que va
            a decir el cartel de la mesa. El alias es un apodo para organizarte
            y no sale de esta pantalla. */}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Mesa {mesa.numero}</div>
          <input
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            onBlur={() => alias !== (mesa.alias ?? "") && onCambiar({ alias })}
            maxLength={40}
            placeholder="Apodo para vos (ej: Primos)"
            className="w-full mt-1 bg-transparent border-b border-white/15 text-xs text-muted-foreground focus:outline-none focus:border-[var(--accent)] focus:text-foreground pb-1 placeholder:text-white/25"
          />
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* sillas */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Lugares</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={ocupado || mesa.sillas <= 2}
            onClick={() => onCambiar({ sillas: mesa.sillas - 1 })}
            className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 disabled:opacity-40"
            aria-label="Quitar un lugar"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-6 text-center text-sm font-semibold">{mesa.sillas}</span>
          <button
            type="button"
            disabled={ocupado || mesa.sillas >= 20}
            onClick={() => onCambiar({ sillas: mesa.sillas + 1 })}
            className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 disabled:opacity-40"
            aria-label="Agregar un lugar"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* forma */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Forma</span>
        <div className="flex rounded-full border border-white/15 p-0.5">
          {(["REDONDA", "RECTANGULAR"] as const).map((f) => (
            <button
              key={f}
              type="button"
              disabled={ocupado}
              onClick={() => mesa.forma !== f && onCambiar({ forma: f })}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                mesa.forma === f
                  ? "bg-[var(--accent)] text-[var(--ink)] font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "REDONDA" ? "Redonda" : "Rectangular"}
            </button>
          ))}
        </div>
      </div>

      {excedida && (
        <p className="text-xs text-red-400">
          Hay {ocupadas} personas para {mesa.sillas} lugares. Agrandá la mesa o pasá a
          alguien a otra.
        </p>
      )}

      {/* quiénes están sentados */}
      <div>
        <h4 className="text-xs text-muted-foreground mb-1.5">En esta mesa</h4>
        {mesa.lugares.length === 0 ? (
          <p className="text-xs text-muted-foreground/70 py-1">Todavía no hay nadie.</p>
        ) : (
          <ul className="space-y-1">
            {mesa.lugares.map((l, i) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.04] px-2 py-1.5"
              >
                {/* El mismo color que sus sillas en el plano: sin esto hay que
                    adivinar cuál de los grupos de la mesa es cada nombre. */}
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: PALETA[i % PALETA.length] }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate text-sm">
                    {infoPorId.get(l.guestId)?.name ?? "Invitado"}
                    {/* Estaba confirmado cuando lo sentaste y después se dio de
                        baja. Sigue ocupando sillas hasta que lo saques, y sin
                        este aviso quedarían lugares reservados para gente que
                        avisó que no viene. */}
                    {infoPorId.get(l.guestId) &&
                      infoPorId.get(l.guestId)!.status !== "CONFIRMED" && (
                        <span className="block text-[10px] text-amber-400 leading-tight">
                          ya no está confirmado
                        </span>
                      )}
                  </span>
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* El − / + sirve para repartir un grupo entre varias mesas.
                      A una persona sola no hay nada que repartirle, así que
                      ahí sobra: quedan dos botones que no hacen nada útil al
                      lado de cada invitado individual. */}
                  {(infoPorId.get(l.guestId)?.aSentar ?? 0) > 1 ? (
                    <>
                      <button
                        type="button"
                        disabled={ocupado}
                        onClick={() => onLugares(l.guestId, l.lugares - 1)}
                        className="w-6 h-6 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 disabled:opacity-40"
                        aria-label="Un lugar menos en esta mesa"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-4 text-center text-xs font-semibold">{l.lugares}</span>
                      <button
                        type="button"
                        disabled={ocupado}
                        onClick={() => onLugares(l.guestId, l.lugares + 1)}
                        className="w-6 h-6 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 disabled:opacity-40"
                        aria-label="Un lugar más en esta mesa"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => onLugares(l.guestId, 0)}
                    className="w-6 h-6 rounded-full border border-white/15 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:border-red-400/40 disabled:opacity-40"
                    aria-label="Sacar de esta mesa"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* borrar */}
      {confirmaBorrar ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={ocupado}
            onClick={onBorrar}
            className="flex-1 rounded-full bg-red-500/90 text-white text-xs font-semibold py-2 hover:bg-red-500 disabled:opacity-50"
          >
            Sí, borrar {rotulo(mesa).titulo}
          </button>
          <button
            type="button"
            onClick={() => setConfirmaBorrar(false)}
            className="rounded-full border border-white/20 text-xs px-3 py-2 hover:bg-white/10"
          >
            No
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmaBorrar(true)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Borrar mesa
        </button>
      )}
    </div>
  );
}
