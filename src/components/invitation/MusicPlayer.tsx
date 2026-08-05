"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Music2 } from "lucide-react";

interface UseMusicPlayerOptions {
    musicaUrl: string;
    autoplay?: boolean;
}

export function useMusicPlayer({ musicaUrl, autoplay = true }: UseMusicPlayerOptions) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(autoplay);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        if (!autoplay) {
            return () => {
                audio.removeEventListener('play', handlePlay);
                audio.removeEventListener('pause', handlePause);
            };
        }

        // Intento inmediato. La mayoría de los navegadores bloquean el
        // autoplay con sonido si todavía no hubo ninguna interacción del
        // usuario en la página, así que esto suele fallar en silencio.
        audio.play().catch(() => setIsPlaying(false));

        // Reintenta en la primera interacción real (click/touch/tecla) en
        // cualquier parte de la página -por ejemplo, al tocar "Abrir
        // invitación"-, que sí cuenta como gesto válido para el navegador.
        const removeGestureListeners = () => {
            document.removeEventListener('pointerdown', retryOnGesture);
            document.removeEventListener('keydown', retryOnGesture);
        };
        const retryOnGesture = () => {
            audio.play().then(removeGestureListeners).catch(() => {});
        };
        document.addEventListener('pointerdown', retryOnGesture);
        document.addEventListener('keydown', retryOnGesture);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            removeGestureListeners();
        };
    }, [autoplay]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (audioRef.current.paused) {
            audioRef.current.play().catch(e => console.error("Play error:", e));
        } else {
            audioRef.current.pause();
        }
    };

    const audioElement = <audio ref={audioRef} loop={false} src={musicaUrl} />;

    return { isPlaying, togglePlay, audioElement };
}

interface MusicToggleButtonProps {
    isPlaying: boolean;
    onToggle: () => void;
    className?: string;
}

export function MusicToggleButton({ isPlaying, onToggle, className = "" }: MusicToggleButtonProps) {
    return (
        <Button
            onClick={onToggle}
            size="icon"
            aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
            className={`rounded-full w-9 h-9 shrink-0 shadow-md backdrop-blur-md border transition-opacity hover:opacity-100 ${className}`}
            style={{
                backgroundColor: 'rgba(var(--color-primary-rgb), 0.15)',
                borderColor: 'rgba(var(--color-primary-rgb), 0.35)',
                color: 'var(--color-primary)',
                opacity: isPlaying ? 1 : 0.55,
            }}
        >
            <Music2 className="w-4 h-4" strokeWidth={1.75} />
        </Button>
    );
}

interface MusicPlayerProps {
    musicaUrl: string;
    autoplay?: boolean;
}

/**
 * Reproductor de música flotante autocontenido (audio + botón fijo vía portal).
 * Pensado para templates sin una "burbuja de pase" junto a la cual anclar el
 * botón. Los templates que sí tienen esa burbuja usan `useMusicPlayer` +
 * `MusicToggleButton` directamente junto a ella.
 */
export function MusicPlayer({
    musicaUrl,
    autoplay = true,
}: MusicPlayerProps) {
    const { isPlaying, togglePlay, audioElement } = useMusicPlayer({ musicaUrl, autoplay });
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <>
            {audioElement}
            {mounted && createPortal(
                <MusicToggleButton
                    isPlaying={isPlaying}
                    onToggle={togglePlay}
                    className="fixed top-3 right-3 z-[99998]"
                />,
                document.body
            )}
        </>
    );
}
