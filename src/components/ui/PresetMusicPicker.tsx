"use client";

import { useRef, useState } from "react";
import { PRESET_SONGS, type PresetSong } from "@/lib/preset-music";
import { Button } from "./button";
import { Play, Pause, Check, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface PresetMusicPickerProps {
    selectedUrl?: string;
    onSelect: (song: PresetSong) => void;
}

export function PresetMusicPicker({ selectedUrl, onSelect }: PresetMusicPickerProps) {
    const [previewingId, setPreviewingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePreview = (song: PresetSong) => {
        const audio = audioRef.current;
        if (!audio) return;

        if (previewingId === song.id) {
            audio.pause();
            setPreviewingId(null);
            return;
        }

        audio.src = song.url;
        audio.currentTime = 0;
        audio.play().catch(() => {});
        setPreviewingId(song.id);
    };

    return (
        <div className="space-y-2">
            <audio ref={audioRef} onEnded={() => setPreviewingId(null)} onPause={() => setPreviewingId(null)} />

            <div className="max-h-72 overflow-y-auto rounded-xl border divide-y bg-white">
                {PRESET_SONGS.map((song) => {
                    const isSelected = selectedUrl === song.url;
                    const isPreviewing = previewingId === song.id;
                    return (
                        <div
                            key={song.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => onSelect(song)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(song); }}
                            className={cn(
                                "flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors",
                                isSelected && "bg-primary/5"
                            )}
                        >
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="shrink-0 rounded-full text-slate-500 hover:text-primary hover:bg-primary/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePreview(song);
                                }}
                            >
                                {isPreviewing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{song.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                            </div>

                            {isSelected ? (
                                <Check className="w-4 h-4 text-primary shrink-0" />
                            ) : (
                                <Music className="w-4 h-4 text-slate-300 shrink-0" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
