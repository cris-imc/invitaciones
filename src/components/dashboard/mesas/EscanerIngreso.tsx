"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff, Loader2, RotateCcw } from "lucide-react";
import { useTextos } from "@/components/i18n/ProveedorIdioma";

interface MesaDelInvitado {
  numero: number;
  alias: string | null;
  lugares: number;
}
interface Resultado {
  nombre: string;
  rechazado: boolean;
  motivo: string | null;
  esGrupo: boolean;
  personas: number;
  confirmo: boolean;
  desglose: { adultos: number; adolescentes: number; ninos: number } | null;
  restricciones: string | null;
  notas: string | null;
  yaHabiaEntrado: boolean;
  ingresoEn: string;
  mesas: MesaDelInvitado[];
}

interface Props {
  slug: string;
}

// Cada cuánto se mira un cuadro de la cámara. A 10 por segundo el lector
// engancha enseguida y el teléfono no se calienta ni se queda sin batería a
// mitad de la entrada, que es cuando esto se usa.
const MS_ENTRE_LECTURAS = 100;

// Cuánto se queda en pantalla el resultado antes de volver a escanear. Alcanza
// para leerlo en voz alta y que la familia siga camino.
const MS_MOSTRANDO = 4500;

export function EscanerIngreso({ slug }: Props) {
  const t = useTextos();
  const videoRef = useRef<HTMLVideoElement>(null);
  const lienzoRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // El último código consultado, para no pegarle a la API veinte veces con el
  // mismo QR mientras la persona lo sostiene frente a la cámara.
  const ultimoRef = useRef<string>("");
  const ocupadoRef = useRef(false);

  const [encendida, setEncendida] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [noEncontrado, setNoEncontrado] = useState<string | null>(null);
  const [consultando, setConsultando] = useState(false);

  const consultar = useCallback(
    async (texto: string) => {
      if (ocupadoRef.current || texto === ultimoRef.current) return;
      ocupadoRef.current = true;
      ultimoRef.current = texto;
      setConsultando(true);
      try {
        const res = await fetch(`/api/invitations/${slug}/checkin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: texto }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setResultado(null);
          setNoEncontrado(data.error || t("panel.escaner.noPudeLeer"));
        } else {
          setNoEncontrado(null);
          setResultado(data);
        }
        // Se limpia sola y se vuelve a habilitar el mismo código: si la misma
        // familia vuelve a acercar su QR, tiene que poder leerse de nuevo.
        window.setTimeout(() => {
          setResultado(null);
          setNoEncontrado(null);
          ultimoRef.current = "";
        }, MS_MOSTRANDO);
      } catch {
        setNoEncontrado(t("panel.escaner.noPudeLeer"));
        ultimoRef.current = "";
      } finally {
        ocupadoRef.current = false;
        setConsultando(false);
      }
    },
    [slug, t]
  );

  const apagar = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setEncendida(false);
  }, []);

  const encender = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // La de atrás: nadie escanea el QR de otro con la cámara frontal.
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setEncendida(true);
    } catch (e) {
      const nombre = (e as { name?: string })?.name;
      setError(
        nombre === "NotAllowedError"
          ? t("panel.escaner.sinPermiso")
          : nombre === "NotFoundError"
          ? t("panel.escaner.sinCamara")
          : t("panel.escaner.noPudeAbrir")
      );
      setEncendida(false);
    }
  }, [t]);

  // Apagar la cámara al salir de la pantalla, siempre: dejarla prendida en
  // segundo plano gasta batería y deja la luz encendida sin motivo.
  useEffect(() => () => apagar(), [apagar]);

  useEffect(() => {
    if (!encendida) return;
    let vivo = true;

    const mirar = () => {
      if (!vivo) return;
      const video = videoRef.current;
      const lienzo = lienzoRef.current;
      if (video && lienzo && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ancho = video.videoWidth;
        const alto = video.videoHeight;
        if (ancho > 0 && alto > 0) {
          lienzo.width = ancho;
          lienzo.height = alto;
          const ctx = lienzo.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, ancho, alto);
            const datos = ctx.getImageData(0, 0, ancho, alto);
            // jsQR y no el BarcodeDetector del navegador: Safari no lo tiene, y
            // el anfitrión en la puerta es tan probable que use un iPhone como
            // un Android.
            const codigo = jsQR(datos.data, ancho, alto, {
              inversionAttempts: "dontInvert",
            });
            if (codigo?.data) consultar(codigo.data);
          }
        }
      }
      window.setTimeout(mirar, MS_ENTRE_LECTURAS);
    };

    mirar();
    return () => {
      vivo = false;
    };
  }, [encendida, consultar]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-[var(--campo-borde-suave)] bg-[var(--tinte-2)] aspect-[3/4] max-h-[60vh] mx-auto max-w-sm">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={lienzoRef} className="hidden" />

        {!encendida && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <Camera className="w-8 h-8 text-[var(--foreground)]/35" />
            <p className="text-sm text-muted-foreground">
              {t("panel.escaner.apuntaAlQr")}
            </p>
            <button
              type="button"
              onClick={encender}
              className="rounded-full bg-[var(--accent)] text-[var(--ink)] text-sm font-semibold px-4 py-2 hover:brightness-110"
            >
              {t("panel.escaner.encenderCamara")}
            </button>
          </div>
        )}

        {/* Marco guía: sin una referencia, la gente acerca el QR demasiado y
            queda fuera de foco. */}
        {encendida && !resultado && !noEncontrado && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-2/3 aspect-square rounded-2xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,.35)]" />
          </div>
        )}

        {/* El resultado tapa la cámara a propósito: en la puerta se mira de
            reojo y a un metro, así que tiene que leerse de un golpe. */}
        {(resultado || noEncontrado) && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center gap-2 px-5 text-center backdrop-blur-sm ${
              resultado?.rechazado ? "bg-red-950/90" : "bg-black/85"
            }`}
          >
            {resultado ? (
              <div className="w-full max-h-full overflow-y-auto flex flex-col items-center gap-1.5 py-2">
                {/* El rechazo va arriba de todo y ocupa lugar: en la puerta,
                    con gente esperando, el dato que no puede pasarse por alto
                    es este. No es una tranquera -- el ingreso queda registrado
                    igual y la decisión de dejarlo pasar sigue siendo tuya. */}
                {resultado.rechazado ? (
                  <>
                    <span className="text-2xl font-bold tracking-wide text-red-300">
                      {t("panel.escaner.rechazado")}
                    </span>
                    <span className="text-sm text-red-200/90 leading-snug max-w-[15rem]">
                      {t("panel.escaner.contactarAnfitrion", { motivo: resultado.motivo ?? "" })}
                    </span>
                  </>
                ) : (
                  <span
                    className={`text-xs uppercase tracking-[0.2em] ${
                      resultado.yaHabiaEntrado ? "text-amber-300" : "text-emerald-400"
                    }`}
                  >
                    {resultado.yaHabiaEntrado
                      ? t("panel.escaner.yaHabiaEntrado", {
                          hora: new Date(resultado.ingresoEn).toLocaleTimeString(t("panel.localeFecha"), { hour: "2-digit", minute: "2-digit" }),
                        })
                      : t("panel.escaner.ingresoRegistrado")}
                  </span>
                )}

                <span className="text-xl font-semibold leading-tight">{resultado.nombre}</span>

                <span className="text-sm text-white/60">
                  {t(resultado.personas === 1 ? "panel.escaner.unaPersona" : "panel.escaner.variasPersonas", { cantidad: resultado.personas })}
                  {!resultado.confirmo && t("panel.escaner.sinConfirmar")}
                </span>

                {resultado.desglose && (
                  <span className="text-xs text-white/45">
                    {[
                      resultado.desglose.adultos > 0 && t("panel.escaner.adultos", { cantidad: resultado.desglose.adultos }),
                      resultado.desglose.adolescentes > 0 &&
                        t("panel.escaner.adolescentes", { cantidad: resultado.desglose.adolescentes }),
                      resultado.desglose.ninos > 0 && t("panel.escaner.ninos", { cantidad: resultado.desglose.ninos }),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}

                {resultado.mesas.length === 0 ? (
                  <span className="mt-2 text-base text-amber-300">{t("panel.escaner.sinMesa")}</span>
                ) : (
                  <div className="mt-2 space-y-0.5">
                    {resultado.mesas.map((m) => (
                      <div key={m.numero} className="text-2xl font-bold text-[var(--accent)] leading-tight">
                        {t("panel.mesas.mesaNumero", { numero: m.numero })}
                        {resultado.mesas.length > 1 && (
                          <span className="text-sm font-normal text-white/60">
                            {" "}
                            · {t(m.lugares === 1 ? "panel.escaner.unLugar" : "panel.escaner.variosLugares", { cantidad: m.lugares })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Lo que hay que saber justo al recibirlos, no después: una
                    restricción alimentaria se avisa a cocina al entrar. */}
                {resultado.restricciones && (
                  <span className="mt-2 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-1.5 text-xs text-amber-200 max-w-[15rem]">
                    {resultado.restricciones}
                  </span>
                )}
                {resultado.notas && (
                  <span className="mt-1 text-xs text-white/45 max-w-[15rem]">{resultado.notas}</span>
                )}
              </div>
            ) : (
              <span className="text-base text-red-300">{noEncontrado}</span>
            )}
          </div>
        )}

        {consultando && !resultado && !noEncontrado && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <Loader2 className="w-5 h-5 animate-spin text-white/70" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center max-w-sm mx-auto">{error}</p>
      )}

      {encendida && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={apagar}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--campo-borde)] text-sm px-4 py-2 hover:bg-[var(--tinte-2)]"
          >
            <CameraOff className="w-4 h-4" />
            {t("panel.escaner.apagar")}
          </button>
          <button
            type="button"
            onClick={() => {
              ultimoRef.current = "";
              setResultado(null);
              setNoEncontrado(null);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--campo-borde)] text-sm px-4 py-2 hover:bg-[var(--tinte-2)]"
          >
            <RotateCcw className="w-4 h-4" />
            {t("panel.escaner.escanearOtro")}
          </button>
        </div>
      )}
    </div>
  );
}
