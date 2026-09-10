"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/Toast";
import { Info, ChevronDown, ChevronUp, Gift, CreditCard, ShieldAlert, Lock } from "lucide-react";
import { SaveStepButtons } from "./SaveStepButtons";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { isAdmin as isAdminRole } from "@/lib/roles";
import { PAISES, validarCampoBancario, type CampoBancario, type CodigoPais } from "@/lib/paises";
import { paisDe, camposDelPais, leerJson, escribirJson, type Seccion } from "@/lib/datos-bancarios";
import { useTextos } from "@/components/i18n/ProveedorIdioma";
import type { Traductor } from "@/lib/i18n/texto";

// OJO: las etiquetas de los campos bancarios (CBU, Clave PIX, CLABE) salen de
// paises.ts y NO se traducen -- son nombres propios de cada sistema bancario y
// se dicen igual en cualquier idioma. Lo que sí se traduce es todo lo que los
// rodea: títulos de sección, botones y avisos.
const titulosRegalo = (t: Traductor) => [
    t("wizard.banco.regaloTitulo1"),
    t("wizard.banco.regaloTitulo2"),
    t("wizard.banco.regaloTitulo3"),
];
const titulosTarjeta = (t: Traductor) => [
    t("wizard.banco.tarjetaTitulo1"),
    t("wizard.banco.tarjetaTitulo2"),
    t("wizard.banco.tarjetaTitulo3"),
];

/** Mismo look que el resto de los campos del wizard (ver ui/SelectorPais.tsx). */
const CLASES_SELECT =
    "campo-nativo h-12 w-full min-w-0 rounded-xl border border-[var(--campo-borde)] bg-[var(--ink-2)] px-4 py-2 text-[var(--on-ink)] shadow-xs transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 text-base md:text-sm focus-visible:ring-2 focus-visible:ring-[var(--paper)]/40 focus-visible:border-[var(--paper)]";

/**
 * Los campos que identifican la cuenta, sin el "banco".
 *
 * Chile, Uruguay, Colombia y México definen además un campo `banco` en
 * paises.ts, pero el banco ya tiene su propio input en este paso y su columna
 * propia en la base desde antes (regaloBanco / pagoTarjetaBanco), y
 * datosParaMostrar() lo agrega siempre al final desde esa columna. Dibujar
 * también el de paises.ts dejaría dos inputs "Banco" en el formulario y el
 * banco repetido en la invitación, así que acá se saca de la lista dinámica y
 * su definición se usa sólo para etiquetar y validar el input que ya existía.
 */
function camposDeCuenta(pais: CodigoPais): CampoBancario[] {
    return camposDelPais(pais).filter((campo) => campo.clave !== "banco");
}

/** La definición de "banco" del país, si la tiene (AR, BR y US no la tienen). */
function definicionBanco(pais: CodigoPais): CampoBancario | undefined {
    return camposDelPais(pais).find((campo) => campo.clave === "banco");
}

/** Cuántos caracteres entran, para el contador y el maxLength. Sólo campos numéricos. */
function largoMaximo(campo: CampoBancario): number | undefined {
    if (campo.validacion.tipo === "digitos") return campo.validacion.longitud;
    if (campo.validacion.tipo === "digitos-rango") return campo.validacion.max;
    return undefined;
}

/** Un campo numérico no acepta otra cosa que números: se limpia mientras se tipea. */
function normalizarValor(campo: CampoBancario, crudo: string): string {
    const maximo = largoMaximo(campo);
    if (maximo === undefined) return crudo;
    return crudo.replace(/\D/g, "").slice(0, maximo);
}

function CamposBancariosDelPais({
    pais,
    seccion,
    valores,
    errorVisible,
    onCambio,
    onBlur,
    t,
}: {
    pais: CodigoPais;
    seccion: Seccion;
    valores: Record<string, string>;
    /** El error a mostrar, o null si el campo está bien o todavía no hay que mostrarlo. */
    errorVisible: (clave: string) => string | null;
    onCambio: (campo: CampoBancario, valor: string) => void;
    onBlur: (clave: string) => void;
    t: Traductor;
}) {
    return (
        <div className="space-y-4">
            {camposDeCuenta(pais).map((campo) => {
                const valor = valores[campo.clave] ?? "";
                const error = errorVisible(campo.clave);
                const id = `${seccion}-${campo.clave}`;
                const maximo = largoMaximo(campo);
                const opciones = campo.validacion.tipo === "opciones" ? campo.validacion.valores : null;

                return (
                    <div key={campo.clave} className="space-y-1.5">
                        <div className="flex justify-between items-center gap-2 min-h-5">
                            <Label htmlFor={id} className="text-xs font-medium">
                                {campo.etiqueta}
                                {!campo.obligatorio && (
                                    <span className="ml-1 font-normal text-[var(--shell-fg-soft)]">{t("wizard.banco.opcional")}</span>
                                )}
                            </Label>
                            {maximo !== undefined && (
                                <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                                    {valor.length}/{maximo}
                                </span>
                            )}
                        </div>

                        {opciones ? (
                            <select
                                id={id}
                                value={valor}
                                onChange={(e) => onCambio(campo, e.target.value)}
                                onBlur={() => onBlur(campo.clave)}
                                className={cn(CLASES_SELECT, error && "border-red-500/60")}
                            >
                                <option value="">{t("wizard.banco.elegiOpcion")}</option>
                                {opciones.map((opcion) => (
                                    <option key={opcion} value={opcion}>
                                        {opcion}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <Input
                                id={id}
                                value={valor}
                                placeholder={campo.placeholder}
                                maxLength={maximo}
                                // Un CBU, un alias o una clave PIX se escriben tal cual: el
                                // autoformato de Input pone mayúscula inicial y arruinaría el dato.
                                disableAutoFormat
                                onChange={(e) => onCambio(campo, e.target.value)}
                                onBlur={() => onBlur(campo.clave)}
                                className={cn(
                                    "text-sm",
                                    maximo !== undefined && "font-mono tracking-wider",
                                    error && "border-red-500/60"
                                )}
                            />
                        )}

                        {error && <p className="text-[11px] text-[var(--danger)]">{error}</p>}
                    </div>
                );
            })}
        </div>
    );
}

export function StepBankDetails() {
    const { data, setData, nextStep } = useWizardStore();
    const t = useTextos();
    const PREDEFINED_TITULOS_REGALO = titulosRegalo(t);
    const PREDEFINED_TITULOS_TARJETA = titulosTarjeta(t);
    const usePremiumCredit = useWizardStore((state) => state.usePremiumCredit);
    const useDiamondCredit = useWizardStore((state) => state.useDiamondCredit);
    const { showToast } = useToast();
    const { data: session } = useSession();
    const isAdmin = isAdminRole(session?.user?.role) || session?.user?.planTier === "ADMIN";
    const [showInfo, setShowInfo] = useState(false);
    const [showRedWarning, setShowRedWarning] = useState(false);
    const [attemptedNext, setAttemptedNext] = useState(false);
    // Los campos que el usuario ya visitó, para no mostrarle un error de formato
    // en un campo que todavía no llegó a completar. Clave: "seccion.campo".
    const [tocados, setTocados] = useState<Record<string, boolean>>({});

    const d = data as any;
    const isEditing = Boolean(d.id);

    const pais = paisDe({ pais: d.pais });
    const defBanco = definicionBanco(pais);
    const moneda = PAISES[pais].moneda;
    const etiquetasDeCuenta = camposDeCuenta(pais).map((campo) => campo.etiqueta);

    // Si la invitación ya tiene un ID (edición) usamos su planTier, sino usamos usePremiumCredit/useDiamondCredit (creación)
    const rawLocked = isEditing ? data.planTier === "FREE" : !usePremiumCredit && !useDiamondCredit;
    // Visitante sin cuenta armando el wizard antes de registrarse (ver
    // /dashboard/invitaciones/crear sin sesión): puede configurar todo,
    // incluidas las funciones de Premium -- recién al registrarse eligiendo
    // Gratis se descartan server-side (ver saveInvitationFromWizard). Acá
    // solo cambia el candado por un cartel informativo "Solo en Premium o Diamond".
    const isAnonymous = !session?.user && !isEditing;
    const isLocked = !isAdmin && rawLocked && !isAnonymous;
    const showPremiumOnlyBadge = !isAdmin && rawLocked && isAnonymous;

    const [isCustomRegaloTitulo, setIsCustomRegaloTitulo] = useState(() => {
        const current = d.regaloTitulo || PREDEFINED_TITULOS_REGALO[0];
        return !PREDEFINED_TITULOS_REGALO.includes(current);
    });
    const [isCustomTarjetaTitulo, setIsCustomTarjetaTitulo] = useState(() => {
        const current = d.pagoTarjetaTitulo || PREDEFINED_TITULOS_TARJETA[0];
        return !PREDEFINED_TITULOS_TARJETA.includes(current);
    });

    /**
     * Los valores que muestra el formulario: lo que hay en el JSON del país y,
     * cuando ese JSON está vacío, las columnas viejas de Argentina.
     *
     * Sin este respaldo, abrir una invitación argentina ya creada (JSON vacío,
     * regaloCbu/regaloAlias cargados) mostraría los campos en blanco y el
     * primer guardado le borraría los datos a una invitación cuyo link ya está
     * circulando. Es el mismo criterio de datosParaMostrar() en
     * src/lib/datos-bancarios.ts.
     */
    const valoresDe = (seccion: Seccion): Record<string, string> => {
        const valores = leerJson(
            seccion === "regalo" ? d.regaloDatosBancarios : d.pagoTarjetaDatosBancarios
        );
        if (pais !== "AR") return valores;

        const legado = {
            cbu: (seccion === "regalo" ? d.regaloCbu : d.pagoTarjetaCbu) ?? "",
            alias: (seccion === "regalo" ? d.regaloAlias : d.pagoTarjetaAlias) ?? "",
        };
        for (const clave of ["cbu", "alias"] as const) {
            if (!(valores[clave] ?? "").trim() && legado[clave].trim()) valores[clave] = legado[clave];
        }
        return valores;
    };

    const guardarCampo = (seccion: Seccion, campo: CampoBancario, crudo: string) => {
        const valor = normalizarValor(campo, crudo);
        const nuevos = { ...valoresDe(seccion), [campo.clave]: valor };

        const cambios: Record<string, string> = {
            [seccion === "regalo" ? "regaloDatosBancarios" : "pagoTarjetaDatosBancarios"]:
                escribirJson(nuevos) ?? "",
        };
        // Espejo hacia las columnas viejas: las plantillas y la tarjeta pública
        // todavía leen regaloCbu / regaloAlias directo de la base, así que en
        // Argentina las dos versiones tienen que quedar sincronizadas.
        if (pais === "AR" && (campo.clave === "cbu" || campo.clave === "alias")) {
            cambios[`${seccion}${campo.clave === "cbu" ? "Cbu" : "Alias"}`] = valor;
        }
        setData(cambios as any);
    };

    const valoresRegalo = valoresDe("regalo");
    const valoresTarjeta = valoresDe("pagoTarjeta");

    /** Los errores de los campos de cuenta de una sección, según el país. */
    const erroresDe = (valores: Record<string, string>): Record<string, string> => {
        const errores: Record<string, string> = {};
        for (const campo of camposDeCuenta(pais)) {
            const error = validarCampoBancario(campo, valores[campo.clave] ?? "");
            if (error) errores[campo.clave] = error;
        }
        return errores;
    };

    // Default toggle logic:
    // When CREATING (!isEditing): starts disabled (false) by default.
    // When EDITING (isEditing): active if enabled explicitly or if data is present.
    const hayDatosRegalo = Object.keys(valoresRegalo).length > 0 || Boolean(d.regaloBanco || d.regaloTitular);
    const hayDatosTarjeta = Object.keys(valoresTarjeta).length > 0 || Boolean(d.pagoTarjetaBanco || d.pagoTarjetaTitular);
    const isRegaloActive = d.regaloHabilitado ?? (isEditing && hayDatosRegalo);
    const isPagoTarjetaActive = d.pagoTarjetaHabilitado ?? (isEditing && hayDatosTarjeta);

    const erroresRegalo = isRegaloActive ? erroresDe(valoresRegalo) : {};
    const erroresTarjeta = isPagoTarjetaActive ? erroresDe(valoresTarjeta) : {};
    // El banco se valida con la definición del país cuando existe (en Chile,
    // Uruguay y Colombia es obligatorio); donde el país no lo define, sigue
    // siendo un dato opcional como hasta ahora.
    const errorBancoRegalo =
        isRegaloActive && defBanco ? validarCampoBancario(defBanco, d.regaloBanco || "") : null;
    const errorBancoTarjeta =
        isPagoTarjetaActive && defBanco ? validarCampoBancario(defBanco, d.pagoTarjetaBanco || "") : null;

    /**
     * Una sección activa sin ningún dato de cuenta cargado.
     *
     * En casi todos los países alcanza con exigir los campos obligatorios, pero
     * en Argentina el CBU y el alias son intercambiables y ninguno lo es por
     * separado (ver paises.ts): sin esta regla se podría activar la sección de
     * regalos y dejarla sin un solo dato para transferir.
     */
    const sinDatosDeCuenta = (valores: Record<string, string>) =>
        camposDeCuenta(pais).every((campo) => !(valores[campo.clave] ?? "").trim());

    const vacioRegalo = isRegaloActive && sinDatosDeCuenta(valoresRegalo);
    const vacioTarjeta = isPagoTarjetaActive && sinDatosDeCuenta(valoresTarjeta);

    const missingRegaloTitular = isRegaloActive && !String(d.regaloTitular || "").trim();
    const missingTarjetaTitular = isPagoTarjetaActive && !String(d.pagoTarjetaTitular || "").trim();
    const missingRegaloMonto = isPagoTarjetaActive && !d.regaloMonto;

    const hasMissingRequired =
        missingRegaloTitular ||
        missingTarjetaTitular ||
        missingRegaloMonto ||
        vacioRegalo ||
        vacioTarjeta ||
        Object.keys(erroresRegalo).length > 0 ||
        Object.keys(erroresTarjeta).length > 0 ||
        Boolean(errorBancoRegalo) ||
        Boolean(errorBancoTarjeta);

    const marcarTocado = (seccion: Seccion, clave: string) =>
        setTocados((previos) => ({ ...previos, [`${seccion}.${clave}`]: true }));

    const bancoRegaloEnRojo = Boolean(errorBancoRegalo) && (attemptedNext || tocados["regalo.banco"]);
    const bancoTarjetaEnRojo = Boolean(errorBancoTarjeta) && (attemptedNext || tocados["pagoTarjeta.banco"]);

    const errorVisibleDe =
        (seccion: Seccion, errores: Record<string, string>) => (clave: string) =>
            attemptedNext || tocados[`${seccion}.${clave}`] ? errores[clave] ?? null : null;

    const handleNext = () => {
        if (hasMissingRequired) {
            setAttemptedNext(true);
            showToast(t("wizard.banco.revisarDatos"), "error");
            return;
        }
        setAttemptedNext(false);
        nextStep();
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">{t("wizard.banco.titulo")}</h2>
                <p className="text-muted-foreground text-sm">
                    {t("wizard.banco.subtitulo", { pais: PAISES[pais].nombre })}
                </p>
            </div>

            {/* Caja informativa de Usabilidad (Collapsible - Minimizada por defecto) */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs overflow-hidden transition-all duration-200 shadow-sm">
                <button
                    type="button"
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-amber-500/15 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2.5 font-semibold text-amber-300 text-sm">
                        <Info className="w-4.5 h-4.5 shrink-0 text-amber-400" />
                        <span>{t("wizard.banco.infoTitulo")}</span>
                    </div>
                    <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showInfo && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200 space-y-2">
                        <p>{t("wizard.banco.infoTexto1")}</p>
                        <p>{t("wizard.banco.infoTexto2")}</p>
                        <p className="text-amber-300 font-medium">{t("wizard.banco.infoTexto3")}</p>
                    </div>
                )}
            </div>

            {/* Advertencia de Seguridad ROJA sobre los datos de la cuenta (Collapsible - Minimizada por defecto) */}
            <div className="rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs overflow-hidden transition-all duration-200 shadow-lg">
                <button
                    type="button"
                    onClick={() => setShowRedWarning(!showRedWarning)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-rose-500/20 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2 font-bold text-rose-300 text-sm sm:text-base">
                        <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
                        <span>{t("wizard.banco.avisoTitulo")}</span>
                    </div>
                    <div className="text-rose-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showRedWarning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showRedWarning && (
                    <div className="px-4 pb-4 pt-1 border-t border-rose-500/25 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200 space-y-2">
                        <p>{t("wizard.banco.avisoTexto", { campos: etiquetasDeCuenta.join(", ") })}</p>
                        <p className="text-[12px] text-rose-300/90 font-mono italic pt-1 border-t border-rose-500/20">
                            {t("wizard.banco.avisoLegal")}
                        </p>
                    </div>
                )}
            </div>

            {rawLocked && isAdmin && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                    👑 <strong>{t("wizard.plan.modoAdmin")}</strong> {t("wizard.banco.modoAdminTexto")}
                </div>
            )}

            {/* SECCIÓN 1: CUENTA PARA REGALOS */}
            <div className="space-y-4 bg-[var(--ink-2)] border border-[var(--line)] p-5 rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                            <Gift className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <Label htmlFor="enableGift" className={`flex items-center gap-2 text-base font-semibold ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                {t("wizard.banco.seccionRegalo")}
                                {isLocked && <Lock className="w-4 h-4 text-red-400" />}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {t("wizard.banco.seccionRegaloAyuda")}
                            </p>
                            {showPremiumOnlyBadge && (
                                <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wide font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5">
                                    {t("wizard.plan.soloPremiumODiamond")}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="relative group self-end sm:self-auto shrink-0">
                        <Switch
                            id="enableGift"
                            checked={isRegaloActive && (!isLocked || isAdmin)}
                            disabled={isLocked}
                            onCheckedChange={(checked) => setData({ regaloHabilitado: checked })}
                        />
                        {isLocked && (
                            <div className="absolute -top-10 right-0 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {t("wizard.plan.disponibleEnPremium")}
                                <div className="absolute -bottom-1 right-3 border-4 border-transparent border-t-black"></div>
                            </div>
                        )}
                    </div>
                </div>

                {isRegaloActive && !isLocked && (
                    <div className="space-y-4 pt-4 border-t border-[var(--line)] animate-in fade-in duration-200">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">{t("wizard.banco.tituloSeccion")}</Label>
                            <div className="relative">
                            <div className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible no-scrollbar pb-1" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}>
                                {PREDEFINED_TITULOS_REGALO.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                            setData({ regaloTitulo: opt });
                                            setIsCustomRegaloTitulo(false);
                                        }}
                                        className={cn(
                                            "text-xs px-3 py-2 rounded-xl border transition-all duration-200 whitespace-nowrap shrink-0",
                                            (d.regaloTitulo || PREDEFINED_TITULOS_REGALO[0]) === opt && !isCustomRegaloTitulo
                                                ? "bg-amber-500/25 border-amber-400 text-amber-200 font-semibold shadow-sm"
                                                : "bg-[var(--tinte-1)] border-[var(--line)] hover:bg-[var(--tinte-2)] text-[var(--shell-fg-mid)]"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCustomRegaloTitulo(true);
                                        if (PREDEFINED_TITULOS_REGALO.includes(d.regaloTitulo || PREDEFINED_TITULOS_REGALO[0])) {
                                            setData({ regaloTitulo: "" });
                                        }
                                    }}
                                    className={cn(
                                        "text-xs px-3 py-2 rounded-xl border transition-all duration-200 whitespace-nowrap shrink-0",
                                        isCustomRegaloTitulo
                                            ? "bg-amber-500/25 border-amber-400 text-amber-200 font-semibold shadow-sm"
                                            : "bg-[var(--tinte-1)] border-[var(--line)] hover:bg-[var(--tinte-2)] text-[var(--shell-fg-mid)]"
                                    )}
                                >
                                    {t("wizard.banco.personalizado")}
                                </button>
                            </div>
                            <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-[var(--ink-2)] to-transparent md:hidden" />
                            </div>
                            {isCustomRegaloTitulo && (
                                <Input
                                    placeholder={t("wizard.banco.tituloPersonalizadoPlaceholder")}
                                    value={d.regaloTitulo || ""}
                                    onChange={(e) => setData({ regaloTitulo: e.target.value })}
                                    className="mt-2"
                                />
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="bankName" className="text-xs font-medium">
                                {defBanco?.etiqueta ?? t("wizard.banco.banco")}
                                {!defBanco?.obligatorio && (
                                    <span className="ml-1 font-normal text-[var(--shell-fg-soft)]">{t("wizard.banco.opcional")}</span>
                                )}
                            </Label>
                            <Input
                                id="bankName"
                                placeholder={defBanco?.placeholder ?? t("wizard.banco.bancoPlaceholderRegalo")}
                                value={d.regaloBanco || ""}
                                onChange={(e) => setData({ regaloBanco: e.target.value })}
                                onBlur={() => marcarTocado("regalo", "banco")}
                                className={cn(bancoRegaloEnRojo && "border-red-500/60")}
                            />
                            {bancoRegaloEnRojo && (
                                <p className="text-[11px] text-red-400">{errorBancoRegalo}</p>
                            )}
                        </div>

                        <div className="space-y-4 pt-1">
                            <CamposBancariosDelPais
                                pais={pais}
                                seccion="regalo"
                                valores={valoresRegalo}
                                errorVisible={errorVisibleDe("regalo", erroresRegalo)}
                                onCambio={(campo, valor) => guardarCampo("regalo", campo, valor)}
                                onBlur={(clave) => marcarTocado("regalo", clave)}
                                t={t}
                            />

                            {attemptedNext && vacioRegalo && (
                                <p className="text-[11px] text-red-400">
                                    {t("wizard.banco.alMenosUno", { campos: etiquetasDeCuenta.join(" / ") })}
                                </p>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="titular" className="text-xs font-medium">{t("wizard.banco.titular")}</Label>
                                <Input
                                    id="titular"
                                    placeholder={t("wizard.banco.titularPlaceholderRegalo")}
                                    value={d.regaloTitular || ""}
                                    onChange={(e) => setData({ regaloTitular: e.target.value })}
                                    className={`text-sm ${attemptedNext && missingRegaloTitular ? 'border-red-500/60' : ''}`}
                                />
                                {attemptedNext && missingRegaloTitular && (
                                    <p className="text-[11px] text-red-400">{t("wizard.banco.titularObligatorio")}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SECCIÓN 2: CUENTA PARA PAGO DE TARJETAS / PASES */}
            <div className="space-y-4 bg-[var(--ink-2)] border border-[var(--line)] p-5 rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <Label htmlFor="enableCardPayment" className={`flex items-center gap-2 text-base font-semibold ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                {t("wizard.banco.seccionTarjeta")}
                                {isLocked && <Lock className="w-4 h-4 text-red-400" />}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {t("wizard.banco.seccionTarjetaAyuda")}
                            </p>
                            {showPremiumOnlyBadge && (
                                <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wide font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5">
                                    {t("wizard.plan.soloPremiumODiamond")}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="relative group self-end sm:self-auto shrink-0">
                        <Switch
                            id="enableCardPayment"
                            checked={isPagoTarjetaActive && (!isLocked || isAdmin)}
                            disabled={isLocked}
                            onCheckedChange={(checked) => setData({ pagoTarjetaHabilitado: checked })}
                        />
                        {isLocked && (
                            <div className="absolute -top-10 right-0 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {t("wizard.plan.disponibleEnPremium")}
                                <div className="absolute -bottom-1 right-3 border-4 border-transparent border-t-black"></div>
                            </div>
                        )}
                    </div>
                </div>

                {isPagoTarjetaActive && !isLocked && (
                    <div className="space-y-4 pt-4 border-t border-[var(--line)] animate-in fade-in duration-200">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">{t("wizard.banco.tituloSeccion")}</Label>
                            <div className="relative">
                            <div className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible no-scrollbar pb-1" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}>
                                {PREDEFINED_TITULOS_TARJETA.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                            setData({ pagoTarjetaTitulo: opt });
                                            setIsCustomTarjetaTitulo(false);
                                        }}
                                        className={cn(
                                            "text-xs px-3 py-2 rounded-xl border transition-all duration-200 whitespace-nowrap shrink-0",
                                            (d.pagoTarjetaTitulo || PREDEFINED_TITULOS_TARJETA[0]) === opt && !isCustomTarjetaTitulo
                                                ? "bg-amber-500/25 border-amber-400 text-amber-200 font-semibold shadow-sm"
                                                : "bg-[var(--tinte-1)] border-[var(--line)] hover:bg-[var(--tinte-2)] text-[var(--shell-fg-mid)]"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCustomTarjetaTitulo(true);
                                        if (PREDEFINED_TITULOS_TARJETA.includes(d.pagoTarjetaTitulo || PREDEFINED_TITULOS_TARJETA[0])) {
                                            setData({ pagoTarjetaTitulo: "" });
                                        }
                                    }}
                                    className={cn(
                                        "text-xs px-3 py-2 rounded-xl border transition-all duration-200 whitespace-nowrap shrink-0",
                                        isCustomTarjetaTitulo
                                            ? "bg-amber-500/25 border-amber-400 text-amber-200 font-semibold shadow-sm"
                                            : "bg-[var(--tinte-1)] border-[var(--line)] hover:bg-[var(--tinte-2)] text-[var(--shell-fg-mid)]"
                                    )}
                                >
                                    {t("wizard.banco.personalizado")}
                                </button>
                            </div>
                            <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-[var(--ink-2)] to-transparent md:hidden" />
                            </div>
                            {isCustomTarjetaTitulo && (
                                <Input
                                    placeholder={t("wizard.banco.tituloPersonalizadoPlaceholder")}
                                    value={d.pagoTarjetaTitulo || ""}
                                    onChange={(e) => setData({ pagoTarjetaTitulo: e.target.value })}
                                    className="mt-2"
                                />
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="cardBank" className="text-xs font-medium">
                                {defBanco?.etiqueta ?? t("wizard.banco.banco")}
                                {!defBanco?.obligatorio && (
                                    <span className="ml-1 font-normal text-[var(--shell-fg-soft)]">{t("wizard.banco.opcional")}</span>
                                )}
                            </Label>
                            <Input
                                id="cardBank"
                                placeholder={defBanco?.placeholder ?? t("wizard.banco.bancoPlaceholderTarjeta")}
                                value={d.pagoTarjetaBanco || ""}
                                onChange={(e) => setData({ pagoTarjetaBanco: e.target.value })}
                                onBlur={() => marcarTocado("pagoTarjeta", "banco")}
                                className={cn(bancoTarjetaEnRojo && "border-red-500/60")}
                            />
                            {bancoTarjetaEnRojo && (
                                <p className="text-[11px] text-red-400">{errorBancoTarjeta}</p>
                            )}
                        </div>

                        <div className="space-y-4 pt-1">
                            <CamposBancariosDelPais
                                pais={pais}
                                seccion="pagoTarjeta"
                                valores={valoresTarjeta}
                                errorVisible={errorVisibleDe("pagoTarjeta", erroresTarjeta)}
                                onCambio={(campo, valor) => guardarCampo("pagoTarjeta", campo, valor)}
                                onBlur={(clave) => marcarTocado("pagoTarjeta", clave)}
                                t={t}
                            />

                            {attemptedNext && vacioTarjeta && (
                                <p className="text-[11px] text-red-400">
                                    {t("wizard.banco.alMenosUno", { campos: etiquetasDeCuenta.join(" / ") })}
                                </p>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="cardHolder" className="text-xs font-medium">{t("wizard.banco.titular")}</Label>
                                <Input
                                    id="cardHolder"
                                    placeholder={t("wizard.banco.titularPlaceholderTarjeta")}
                                    value={d.pagoTarjetaTitular || ""}
                                    onChange={(e) => setData({ pagoTarjetaTitular: e.target.value })}
                                    className={`text-sm ${attemptedNext && missingTarjetaTitular ? 'border-red-500/60' : ''}`}
                                />
                                {attemptedNext && missingTarjetaTitular && (
                                    <p className="text-[11px] text-red-400">{t("wizard.banco.titularObligatorio")}</p>
                                )}
                            </div>
                        </div>

                        {/* Configuración de Categorías de Precios (Adultos, Adolescentes, Niños) */}
                        <div className="space-y-4 pt-3 border-t border-[var(--line)]">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                                {t("wizard.banco.tarifas", { simbolo: moneda.simbolo, codigo: moneda.codigo })}
                            </h4>

                            {/* Categoria 1: ADULTOS (Obligatoria si se cobra tarjeta) */}
                            <div className="p-3.5 rounded-xl bg-[var(--tinte-1)] border border-[var(--line)] space-y-2">
                                <Label htmlFor="regaloMonto" className="text-xs font-semibold text-[var(--shell-fg-strong)]">
                                    {t("wizard.banco.valorAdulto", { simbolo: moneda.simbolo, codigo: moneda.codigo })}
                                </Label>
                                <Input
                                    id="regaloMonto"
                                    type="number"
                                    min={0}
                                    step={100}
                                    placeholder="Ej: 15000"
                                    value={d.regaloMonto || ""}
                                    onChange={(e) => setData({ regaloMonto: e.target.value ? Number(e.target.value) : undefined } as any)}
                                    className={`bg-[var(--ink)] border-[var(--campo-borde)] ${attemptedNext && missingRegaloMonto ? 'border-red-500/60' : ''}`}
                                />
                                {attemptedNext && missingRegaloMonto && (
                                    <p className="text-[11px] text-red-400">{t("wizard.banco.valorAdultoObligatorio")}</p>
                                )}
                            </div>

                            {/* Categoria 2: ADOLESCENTES (Opcional con Switch) */}
                            <div className="p-3.5 rounded-xl bg-[var(--tinte-1)] border border-[var(--line)] space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="precioAdolescenteHabilitado" className="text-xs font-semibold text-[var(--shell-fg-strong)] cursor-pointer">
                                            {t("wizard.banco.tarifaAdolescente")}
                                        </Label>
                                        <p className="text-[11px] text-muted-foreground">
                                            {t("wizard.banco.tarifaAdolescenteAyuda")}
                                        </p>
                                    </div>
                                    <Switch
                                        id="precioAdolescenteHabilitado"
                                        checked={d.precioAdolescenteHabilitado ?? false}
                                        onCheckedChange={(checked) => setData({ precioAdolescenteHabilitado: checked })}
                                    />
                                </div>
                                {d.precioAdolescenteHabilitado && (
                                    <Input
                                        id="precioAdolescente"
                                        type="number"
                                        min={0}
                                        step={100}
                                        placeholder="Ej: 11000"
                                        value={d.precioAdolescente || ""}
                                        onChange={(e) => setData({ precioAdolescente: e.target.value ? Number(e.target.value) : undefined } as any)}
                                        className="bg-[var(--ink)] border-[var(--campo-borde)] animate-in fade-in duration-200"
                                    />
                                )}
                            </div>

                            {/* Categoria 3: NIÑOS (Opcional con Switch) */}
                            <div className="p-3.5 rounded-xl bg-[var(--tinte-1)] border border-[var(--line)] space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="precioNinoHabilitado" className="text-xs font-semibold text-[var(--shell-fg-strong)] cursor-pointer">
                                            {t("wizard.banco.tarifaNino")}
                                        </Label>
                                        <p className="text-[11px] text-muted-foreground">
                                            {t("wizard.banco.tarifaNinoAyuda")}
                                        </p>
                                    </div>
                                    <Switch
                                        id="precioNinoHabilitado"
                                        checked={d.precioNinoHabilitado ?? false}
                                        onCheckedChange={(checked) => setData({ precioNinoHabilitado: checked })}
                                    />
                                </div>
                                {d.precioNinoHabilitado && (
                                    <Input
                                        id="precioNino"
                                        type="number"
                                        min={0}
                                        step={100}
                                        placeholder="Ej: 8000"
                                        value={d.precioNino || ""}
                                        onChange={(e) => setData({ precioNino: e.target.value ? Number(e.target.value) : undefined } as any)}
                                        className="bg-[var(--ink)] border-[var(--campo-borde)] animate-in fade-in duration-200"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <SaveStepButtons onNext={handleNext} />
        </div>
    );
}
