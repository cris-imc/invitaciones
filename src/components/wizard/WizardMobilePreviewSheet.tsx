"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, animate, type PanInfo } from "framer-motion";
import { ChevronsLeft } from "lucide-react";
import { WizardLivePreview } from "./WizardLivePreview";
import { useWizardStore } from "@/store/wizard-store";
import { getWizardSteps } from "./wizard-steps-config";

// Corrección 4 (docs/correcciones.md): en mobile, la preview vive en un
// bottom sheet arrastrable en vez de estar oculta. En reposo solo se ve un
// "peek" del borde superior (handle + una porción de la miniatura); un swipe
// hacia arriba la revela completa, un swipe hacia abajo la vuelve a esconder.
//
// Pedido del usuario: como el peek por sí solo pasa desapercibido, se agrega
// un gesto de apertura automático (asoma un poco más y vuelve) + flechitas
// semitransparentes, dos veces como máximo -- al entrar al wizard y, si el
// usuario todavía no arrastró la hoja por su cuenta, de nuevo a mitad del
// wizard. En cuanto el usuario la arrastra una vez (la abra o no), no se
// vuelve a animar nunca más.

const SHEET_WIDTH_PX = 280; // ancho total del side sheet
const PEEK_PX = 44; // cuánto asoma en reposo (handle + un poco de miniatura)
const HINT_PEEK_EXTRA_PX = 60; // cuánto asoma de más durante el gesto automático
const HINT_ARROWS_MS = 2600; // cuánto quedan visibles las flechitas

export function WizardMobilePreviewSheet() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // x=0 -> completamente revelado. x=revealDistance -> escondido a la derecha.
    const revealDistance = SHEET_WIDTH_PX - PEEK_PX;
    const x = useMotionValue(revealDistance);
    const sheetRef = useRef<HTMLDivElement>(null);

    // Una vez que el usuario interactúa por su cuenta (la arrastra, para
    // cualquier lado), se acabaron los gestos y flechitas automáticos.
    const userInteractedRef = useRef(false);
    const midpointHintFiredRef = useRef(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const [showHintArrows, setShowHintArrows] = useState(false);

    const { data, currentStep } = useWizardStore();

    // Eliminamos el ResizeObserver porque el ancho de la hoja es estático y
    // estaba causando un loop infinito que congelaba la app en móviles.
    useEffect(() => {
        if (!userInteractedRef.current) {
            x.set(revealDistance);
        }
    }, [revealDistance, x]);

    const playHintGesture = useCallback(() => {
        if (userInteractedRef.current) return;
        setShowHintArrows(true);
        animate(x, revealDistance - HINT_PEEK_EXTRA_PX, {
            type: "spring",
            stiffness: 260,
            damping: 22,
            onComplete: () => {
                if (userInteractedRef.current) return;
                animate(x, revealDistance, { type: "spring", stiffness: 260, damping: 26 });
            },
        });
        window.setTimeout(() => setShowHintArrows(false), HINT_ARROWS_MS);
    }, [x, revealDistance]);

    // Gesto inicial, apenas se entra al wizard.
    useEffect(() => {
        if (!mounted) return;
        const t = window.setTimeout(playHintGesture, 900);
        return () => window.clearTimeout(t);
        // Solo al montar -- no debe repetirse por cambios de datos.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mounted]);

    // Segundo (y último) gesto a mitad del wizard, solo si el usuario nunca
    // tocó la hoja por su cuenta.
    useEffect(() => {
        if (userInteractedRef.current || midpointHintFiredRef.current) return;
        const isEditing = Boolean(data.id);
        const isCasamiento = data.type === "CASAMIENTO";
        const steps = getWizardSteps({ isEditing, isCasamiento, hasGallery: data.galeriaPrincipalHabilitada !== false, templateTipo: data.templateTipo });
        const midpoint = Math.floor(steps.length / 2);
        if (currentStep >= midpoint) {
            midpointHintFiredRef.current = true;
            playHintGesture();
        }
    }, [currentStep, data.id, data.type, playHintGesture]);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        userInteractedRef.current = true;
        setShowHintArrows(false);
        const current = x.get();
        // Si la velocidad a la izquierda es alta o cruzó la mitad hacia la izq
        const goingLeft = info.velocity.x < -200 || (info.velocity.x <= 200 && current < revealDistance / 2);
        const target = goingLeft ? 0 : revealDistance;
        setIsRevealed(target === 0);
        animate(x, target, { type: "spring", stiffness: 400, damping: 40 });
    };

    // Tocar afuera de la hoja mientras está revelada la vuelve a esconder.
    useEffect(() => {
        if (!isRevealed) return;
        const handlePointerDown = (e: PointerEvent) => {
            if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
                setIsRevealed(false);
                animate(x, revealDistance, { type: "spring", stiffness: 400, damping: 40 });
            }
        };
        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [isRevealed, x, revealDistance]);

    if (!mounted) return null;

    return createPortal(
        <motion.div
            ref={sheetRef}
            className="wiz-mobile-sheet"
            style={{ x, width: SHEET_WIDTH_PX }}
            drag="x"
            dragConstraints={{ left: 0, right: revealDistance }}
            dragElastic={0.06}
            onDragEnd={handleDragEnd}
        >
            <div className="wiz-mobile-sheet-handle" aria-hidden="true">
                <span />
            </div>
            {showHintArrows && (
                <div className="wiz-mobile-sheet-hint" aria-hidden="true">
                    <ChevronsLeft className="wiz-mobile-sheet-hint-icon" />
                </div>
            )}
            <div className="wiz-mobile-sheet-body">
                <WizardLivePreview />
            </div>
        </motion.div>,
        document.body
    );
}
