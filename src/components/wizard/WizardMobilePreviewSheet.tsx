"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, animate, type PanInfo } from "framer-motion";
import { WizardLivePreview } from "./WizardLivePreview";

// Corrección 4 (docs/correcciones.md): en mobile, la preview vive en un
// bottom sheet arrastrable en vez de estar oculta. En reposo solo se ve un
// "peek" del borde superior (handle + una porción de la miniatura); un swipe
// hacia arriba la revela completa, un swipe hacia abajo la vuelve a esconder.

const SHEET_WIDTH_PX = 280; // ancho total del side sheet
const PEEK_PX = 44; // cuánto asoma en reposo (handle + un poco de miniatura)

export function WizardMobilePreviewSheet() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [revealDistance, setRevealDistance] = useState(0);
    // x=0 -> completamente revelado. x=revealDistance -> escondido a la derecha.
    const x = useMotionValue(0);
    const wasRevealedRef = useRef(false);
    const observerRef = useRef<ResizeObserver | null>(null);

    const attachRef = useCallback((el: HTMLDivElement | null) => {
        observerRef.current?.disconnect();
        if (!el) return;
        const update = () => {
            const distance = Math.max(0, el.offsetWidth - PEEK_PX);
            setRevealDistance(distance);
            if (!wasRevealedRef.current) {
                x.set(distance);
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
        const current = x.get();
        // Si la velocidad a la izquierda es alta o cruzó la mitad hacia la izq
        const goingLeft = info.velocity.x < -200 || (info.velocity.x <= 200 && current < revealDistance / 2);
        const target = goingLeft ? 0 : revealDistance;
        wasRevealedRef.current = target === 0;
        animate(x, target, { type: "spring", stiffness: 400, damping: 40 });
    };

    if (!mounted) return null;

    return createPortal(
        <motion.div
            ref={attachRef}
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
            <div className="wiz-mobile-sheet-body">
                <WizardLivePreview />
            </div>
        </motion.div>,
        document.body
    );
}
