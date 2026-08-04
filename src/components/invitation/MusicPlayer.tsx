"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

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
                className="fixed top-4 right-4 z-40 rounded-full w-10 h-10 shadow-md opacity-80 hover:opacity-100 transition-opacity"
                style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-text-light)',
                }}
            >
                {isPlaying ? (
                    <Volume2 className="w-4 h-4" />
                ) : (
                    <VolumeX className="w-4 h-4" />
                )}
            </Button>
        </>
    );
}

