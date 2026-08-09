"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, animate, type PanInfo } from "framer-motion";
import { WizardLivePreview } from "./WizardLivePreview";

// Corrección 4 (docs/correcciones.md): en mobile, la preview vive en un
// bottom sheet arrastrable en vez de estar oculta. En reposo solo se ve un
// "peek" del borde superior (handle + una porción de la miniatura); un swipe
// hacia arriba la revela completa, un swipe hacia abajo la vuelve a esconder.

const SHEET_HEIGHT_VH = 62; // alto del sheet cuando está completamente revelado
const PEEK_PX = 72; // cuánto asoma en reposo (handle + un poco de la miniatura)

export function WizardMobilePreviewSheet() {
    // Portal a document.body: el dashboard tiene un ancestro con `filter`
    // (blur de transición), que crea un containing block nuevo para
    // position:fixed -- sin portal, el sheet quedaba anclado a ese ancestro
    // en vez del viewport real. Mismo patrón que ya usan las plantillas
    // (createPortal) para la burbuja de pase / botón de música.
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [revealDistance, setRevealDistance] = useState(0);
    // y=0 -> sheet completamente revelado. y=revealDistance -> solo el peek visible.
    const y = useMotionValue(0);
    const wasRevealedRef = useRef(false);
    const observerRef = useRef<ResizeObserver | null>(null);

    // Callback ref (no useEffect con deps []) porque el nodo real recién
    // existe despues del segundo render (el gate de `mounted` hace que el
    // primer render devuelva null) -- un effect con deps [] corre una sola
    // vez, en ese primer render, cuando sheetRef.current todavia es null, y
    // nunca vuelve a intentarlo.
    const attachRef = useCallback((el: HTMLDivElement | null) => {
        observerRef.current?.disconnect();
        if (!el) return;
        const update = () => {
            const distance = Math.max(0, el.offsetHeight - PEEK_PX);
            setRevealDistance(distance);
            // Solo re-posiciona al valor de reposo si el usuario no lo tenía
            // revelado a mano (evita "saltos" en cada resize/orientación).
            if (!wasRevealedRef.current) {
                y.set(distance);
            }
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        observerRef.current = observer;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => () => observerRef.current?.disconnect(), []);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        const current = y.get();
        const goingUp = info.velocity.y < -200 || (info.velocity.y <= 200 && current < revealDistance / 2);
        const target = goingUp ? 0 : revealDistance;
        wasRevealedRef.current = target === 0;
        animate(y, target, { type: "spring", stiffness: 400, damping: 40 });
    };

    if (!mounted) return null;

    return createPortal(
        <motion.div
            ref={attachRef}
            className="wiz-mobile-sheet"
            style={{ y, height: `calc(var(--vh, 1vh) * ${SHEET_HEIGHT_VH})` }}
            drag="y"
            dragConstraints={{ top: 0, bottom: revealDistance }}
            dragElastic={0.06}
            onDragEnd={handleDragEnd}
        >
            <div className="wiz-mobile-sheet-handle" aria-hidden="true">
                <span />
            </div>
            <div className="wiz-mobile-sheet-body">
                <WizardLivePreview />
            </div>
        </motion.div>,
        document.body
    );
}
