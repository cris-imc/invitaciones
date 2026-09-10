"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { Trash2, Plus, Pencil, Lock, Info, ChevronDown, ChevronUp, Check, AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";
import { SaveStepButtons } from "./SaveStepButtons";
import { cn } from "@/lib/utils";
import { isAdmin as isAdminRole } from "@/lib/roles";
import { useTextos } from "@/components/i18n/ProveedorIdioma";
import type { Traductor } from "@/lib/i18n/texto";

const titulosSugeridos = (t: Traductor, tipo: string | undefined) => {
    if (tipo === "CASAMIENTO") {
        return [t("wizard.trivia.casamiento1"), t("wizard.trivia.casamiento2"), t("wizard.trivia.casamiento3")];
    }
    if (tipo === "QUINCE_ANOS") {
        return [t("wizard.trivia.quince1"), t("wizard.trivia.quince2"), t("wizard.trivia.quince3")];
    }
    return [t("wizard.trivia.otro1"), t("wizard.trivia.otro2"), t("wizard.trivia.otro3")];
};

/** De quién habla la trivia, según el tipo de evento. */
const sujetoDelEvento = (t: Traductor, tipo: string | undefined) =>
    tipo === "CASAMIENTO"
        ? t("wizard.trivia.sujetoPareja")
        : tipo === "QUINCE_ANOS"
        ? t("wizard.trivia.sujetoQuinceanera")
        : t("wizard.trivia.sujetoAgasajado");

interface TriviaQuestion {
    pregunta: string;
    opciones: string[];
    respuestaCorrecta: number; // índice de la respuesta correcta (0-3)
}

export function StepTrivia() {
    const { data, setData, nextStep, prevStep } = useWizardStore();
    const t = useTextos();
    const { showToast } = useToast();
    const usePremiumCredit = useWizardStore((state) => state.usePremiumCredit);
    const useDiamondCredit = useWizardStore((state) => state.useDiamondCredit);
    const [showTriviaInfo, setShowTriviaInfo] = useState(false);
    const { data: session } = useSession();
    const isAdmin = isAdminRole(session?.user?.role) || session?.user?.planTier === "ADMIN";

    // Si la invitación ya tiene un ID (edición) usamos su planTier, sino usamos usePremiumCredit/useDiamondCredit (creación)
    const isEditing = Boolean(data.id);
    const rawLocked = isEditing ? data.planTier === "FREE" : !usePremiumCredit && !useDiamondCredit;
    // Visitante sin cuenta armando el wizard antes de registrarse (ver
    // /dashboard/invitaciones/crear sin sesión): puede configurar todo,
    // incluidas las funciones de Premium -- recién al registrarse eligiendo
    // Gratis se descartan server-side (ver saveInvitationFromWizard). Acá
    // solo cambia el candado por un cartel informativo "Solo en Premium o Diamond".
    const isAnonymous = !session?.user && !isEditing;
    const isLocked = !isAdmin && rawLocked && !isAnonymous;
    const showPremiumOnlyBadge = !isAdmin && rawLocked && isAnonymous;

    // Parse existing questions or initialize empty array
    const [preguntas, setPreguntas] = useState<TriviaQuestion[]>(() => {
        try {
            return data.triviaPreguntas ? JSON.parse(data.triviaPreguntas) : [];
        } catch {
            return [];
        }
    });

    const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion>({
        pregunta: "",
        opciones: ["", "", "", ""],
        respuestaCorrecta: 0,
    });

    // El formulario de nueva pregunta arranca cerrado si ya hay preguntas cargadas
    // (típico al entrar a editar una invitación existente), para no mostrar un
    // formulario en blanco sin motivo.
    const [showAddForm, setShowAddForm] = useState(() => preguntas.length === 0);

    const tituloOptions = titulosSugeridos(t, data.type ?? undefined);
    const sujeto = sujetoDelEvento(t, data.type ?? undefined);

    const [isCustomTitulo, setIsCustomTitulo] = useState(() => {
        if (!data.triviaTitulo) return false;
        return !tituloOptions.includes(data.triviaTitulo);
    });

    // Estado de la pregunta que se está tipeando: vacía, completa, o a medio llenar.
    const hasPendingContent = Boolean(
        currentQuestion.pregunta.trim() || currentQuestion.opciones.some((op) => op.trim())
    );
    const isPendingComplete = Boolean(
        currentQuestion.pregunta.trim() && currentQuestion.opciones.every((op) => op.trim())
    );
    const isPendingPartial = hasPendingContent && !isPendingComplete;

    // Sincronizar en tiempo real para el Live Preview
    useEffect(() => {
        let finalPreguntas = [...preguntas];
        if (hasPendingContent) {
            finalPreguntas.push(currentQuestion);
        }
        setData({ triviaPreguntas: JSON.stringify(finalPreguntas) });
    }, [preguntas, currentQuestion, hasPendingContent, setData]);

    const handleAddQuestion = () => {
        if (isPendingComplete) {
            setPreguntas([...preguntas, currentQuestion]);
            setCurrentQuestion({
                pregunta: "",
                opciones: ["", "", "", ""],
                respuestaCorrecta: 0,
            });
            showToast(t("wizard.trivia.avisoAgregada"), "success");
        } else {
            showToast(t("wizard.trivia.avisoCompletar"), "error");
        }
    };

    const handleDeleteQuestion = (index: number) => {
        setPreguntas(preguntas.filter((_, i) => i !== index));
    };

    const handleEditQuestion = (index: number) => {
        if (isPendingPartial) {
            showToast(t("wizard.trivia.avisoPendienteEditar"), "error");
            return;
        }

        // Si había una pregunta completa sin agregar, la guardamos antes de
        // cargar la que se va a editar, para no perderla.
        let restantes = preguntas;
        if (isPendingComplete) {
            restantes = [...preguntas, currentQuestion];
        }

        // Load the selected question into the form
        setCurrentQuestion(preguntas[index]);
        // Remove it from the saved list so they can replace it upon adding
        setPreguntas(restantes.filter((_, i) => i !== index));
        // El formulario puede estar colapsado (ya había preguntas cargadas);
        // sin esto, la pregunta desaparecía de la lista sin ningún form
        // visible para seguir editándola.
        setShowAddForm(true);
    };

    const handleFinishAdding = () => {
        if (isPendingPartial) {
            showToast(t("wizard.trivia.avisoPendiente"), "error");
            return;
        }

        if (isPendingComplete) {
            setPreguntas([...preguntas, currentQuestion]);
            setCurrentQuestion({ pregunta: "", opciones: ["", "", "", ""], respuestaCorrecta: 0 });
            showToast(t("wizard.trivia.avisoGuardada"), "success");
        }
        
        setShowAddForm(false);
    };

    const handleNext = () => {
        if (isPendingPartial) {
            showToast(t("wizard.trivia.avisoPendiente"), "error");
            return;
        }

        let finalPreguntas = [...preguntas];
        if (isPendingComplete) {
            finalPreguntas.push(currentQuestion);
            setCurrentQuestion({ pregunta: "", opciones: ["", "", "", ""], respuestaCorrecta: 0 });
            showToast(t("wizard.trivia.avisoUltima"), "success");
        }

        if (data.triviaHabilitada && finalPreguntas.length === 0) {
            showToast(t("wizard.trivia.avisoSinPreguntas"), "error");
            return;
        }

        setData({ triviaPreguntas: JSON.stringify(finalPreguntas) });
        nextStep();
    };


    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">{t("wizard.trivia.titulo")}</h2>
                <p className="text-muted-foreground text-sm">
                    {t("wizard.trivia.subtitulo", { sujeto })}
                </p>
            </div>

            {/* Caja informativa de Usabilidad (Collapsible - Minimizada por defecto) */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs overflow-hidden transition-all duration-200 shadow-sm max-w-2xl mx-auto">
                <button
                    type="button"
                    onClick={() => setShowTriviaInfo(!showTriviaInfo)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-amber-500/15 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2.5 font-semibold text-amber-300 text-sm">
                        <Info className="w-4.5 h-4.5 shrink-0 text-amber-400" />
                        <span>{t("wizard.trivia.infoTitulo")}</span>
                    </div>
                    <div className="text-amber-400 opacity-80 hover:opacity-100 transition-opacity shrink-0">
                        {showTriviaInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </button>

                {showTriviaInfo && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 text-[13px] leading-relaxed opacity-95 animate-in fade-in duration-200">
                        {t("wizard.trivia.infoTexto", { sujeto })}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {rawLocked && isAdmin && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                        👑 <strong>{t("wizard.plan.modoAdmin")}</strong> {t("wizard.trivia.modoAdminTexto")}
                    </div>
                )}

                <div className="flex items-center space-x-2 relative group w-fit">
                    <Checkbox
                        id="triviaHabilitada"
                        checked={data.triviaHabilitada && (!isLocked || isAdmin)}
                        disabled={isLocked}
                        onCheckedChange={(checked) => setData({ triviaHabilitada: Boolean(checked) })}
                    />
                    <Label htmlFor="triviaHabilitada" className={`flex items-center gap-2 ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                        {t("wizard.trivia.activar")}
                        {isLocked && <Lock className="w-4 h-4 text-red-400" />}
                    </Label>
                    {isLocked && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {t("wizard.plan.disponibleEnPremium")}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                        </div>
                    )}
                    {showPremiumOnlyBadge && (
                        <span className="text-[10px] uppercase tracking-wide font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5 whitespace-nowrap">
                            {t("wizard.plan.soloPremiumODiamond")}
                        </span>
                    )}
                </div>

                {data.triviaHabilitada && (!isLocked || isAdmin) && (
                    <>
                        {/* Configuración básica */}
                        <div className="space-y-4 border border-[var(--ink-2)] p-4 rounded-lg bg-[var(--ink-2)]">
                            <div className="space-y-2">
                                <Label htmlFor="triviaTitulo">{t("wizard.trivia.tituloCampo")}</Label>
                                <div className="flex flex-wrap gap-2">
                                    {tituloOptions.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                setData({ triviaTitulo: opt });
                                                setIsCustomTitulo(false);
                                            }}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                                                data.triviaTitulo === opt && !isCustomTitulo
                                                    ? "bg-amber-500 text-white border-amber-600"
                                                    : "bg-[var(--ink)] text-[var(--shell-fg-mid)] hover:text-[var(--foreground)] border border-[var(--line)] hover:border-[var(--campo-borde)]"
                                            )}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCustomTitulo(true);
                                            if (tituloOptions.includes(data.triviaTitulo || "")) {
                                                setData({ triviaTitulo: "" });
                                            }
                                        }}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                                            isCustomTitulo
                                                ? "bg-amber-500 text-white border-amber-600"
                                                : "bg-[var(--ink)] text-[var(--shell-fg-mid)] hover:text-[var(--foreground)] border border-[var(--line)] hover:border-[var(--campo-borde)]"
                                        )}
                                    >
                                        {t("wizard.trivia.personalizado")}
                                    </button>
                                </div>
                                {isCustomTitulo && (
                                    <Input
                                        id="triviaTitulo"
                                        value={data.triviaTitulo || ""}
                                        onChange={(e) => setData({ triviaTitulo: e.target.value })}
                                        placeholder={t("wizard.trivia.tituloPlaceholder")}
                                        className="mt-2"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Lista de preguntas existentes */}
                        {preguntas.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold">{t("wizard.trivia.preguntasAgregadas", { cantidad: preguntas.length })}</h3>
                                <div className="space-y-2">
                                    {preguntas.map((q, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start justify-between p-3 bg-[var(--ink)] border border-[var(--ink-2)] rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{index + 1}. {q.pregunta}</p>
                                                <div className="mt-1 space-y-1">
                                                    {q.opciones.map((op, i) => (
                                                        <p
                                                            key={i}
                                                            className={`text-sm ${i === q.respuestaCorrecta ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}
                                                        >
                                                            {String.fromCharCode(65 + i)}. {op}
                                                            {i === q.respuestaCorrecta && " ✓"}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditQuestion(index)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Pencil className="w-4 h-4 text-blue-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteQuestion(index)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Formulario para nueva pregunta */}
                        {!showAddForm ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAddForm(true)}
                                className="w-full border-dashed h-11 border-amber-500/40 hover:bg-amber-500/10 text-amber-300"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {t("wizard.trivia.agregarNueva")}
                            </Button>
                        ) : (
                        <div className="border border-[var(--ink-2)] p-4 rounded-lg space-y-4 bg-yellow-500/10">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-yellow-500">{t("wizard.trivia.agregarNueva")}</h3>
                                {!hasPendingContent && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowAddForm(false)}
                                        className="h-7 px-2 text-xs text-muted-foreground"
                                    >
                                        {t("comun.cancelar")}
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pregunta">{t("wizard.trivia.pregunta")}</Label>
                                <Input
                                    id="pregunta"
                                    value={currentQuestion.pregunta}
                                    onChange={(e) =>
                                        setCurrentQuestion({ ...currentQuestion, pregunta: e.target.value })
                                    }
                                    placeholder={t("wizard.trivia.preguntaPlaceholder")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t("wizard.trivia.opciones")}</Label>
                                {currentQuestion.opciones.map((opcion, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="w-8 text-sm font-medium">
                                            {String.fromCharCode(65 + index)}.
                                        </span>
                                        <Input
                                            value={opcion}
                                            onChange={(e) => {
                                                const newOpciones = [...currentQuestion.opciones];
                                                newOpciones[index] = e.target.value;
                                                setCurrentQuestion({ ...currentQuestion, opciones: newOpciones });
                                            }}
                                            placeholder={t("wizard.trivia.opcionPlaceholder", { letra: String.fromCharCode(65 + index) })}
                                        />
                                        <Checkbox
                                            checked={currentQuestion.respuestaCorrecta === index}
                                            onCheckedChange={() =>
                                                setCurrentQuestion({ ...currentQuestion, respuestaCorrecta: index })
                                            }
                                        />
                                        <span className="text-xs text-muted-foreground">{t("wizard.trivia.correcta")}</span>
                                    </div>
                                ))}
                            </div>

                            {isPendingPartial && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{t("wizard.trivia.pendienteAviso")}</span>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    type="button"
                                    onClick={handleAddQuestion}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t("wizard.trivia.agregarYOtra")}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleFinishAdding}
                                    className="flex-1"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    {t("wizard.trivia.listoCerrar")}
                                </Button>
                            </div>
                        </div>
                        )}
                    </>
                )}
            </div>

            <SaveStepButtons onNext={handleNext} />
        </div>
    );
}
