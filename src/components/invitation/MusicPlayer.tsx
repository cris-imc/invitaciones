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
        if (audioRef.current && autoplay) {
            // Intentar reproducir automáticamente
            audioRef.current.play().catch(() => {
                setIsPlaying(false);
            });
        }
    }, [autoplay]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <>
            <audio ref={audioRef} loop={loop} src={musicaUrl} />
            
            <Button
                onClick={togglePlay}
                size="icon"
                className="fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 shadow-lg"
                style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-text-light)',
                }}
            >
                {isPlaying ? (
                    <Volume2 className="w-6 h-6" />
                ) : (
                    <VolumeX className="w-6 h-6" />
                )}
            </Button>
        </>
    );
}

