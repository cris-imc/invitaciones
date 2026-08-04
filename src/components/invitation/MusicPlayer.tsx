"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Music2 } from "lucide-react";

interface MusicPlayerProps {
    musicaUrl: string;
    autoplay?: boolean;
    loop?: boolean;
}

export function MusicPlayer({
    musicaUrl,
    autoplay = true,
    loop = true,
}: MusicPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(autoplay);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        if (autoplay) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    setIsPlaying(false);
                });
            }
        }

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
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

    return (
        <>
            <audio ref={audioRef} loop={loop} src={musicaUrl} />

            <Button
                onClick={togglePlay}
                size="icon"
                aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
                className="fixed top-3 right-3 z-[99999] rounded-full w-9 h-9 shadow-md backdrop-blur-md border transition-opacity hover:opacity-100"
                style={{
                    backgroundColor: 'rgba(var(--color-primary-rgb), 0.15)',
                    borderColor: 'rgba(var(--color-primary-rgb), 0.35)',
                    color: 'var(--color-primary)',
                    opacity: isPlaying ? 1 : 0.55,
                }}
            >
                <Music2 className="w-4 h-4" strokeWidth={1.75} />
            </Button>
        </>
    );
}

