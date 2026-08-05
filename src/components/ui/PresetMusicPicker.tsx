"use client";

import { useRef, useState } from "react";
import { PRESET_SONGS, type PresetSong } from "@/lib/preset-music";
import { Play, Pause, Check } from "lucide-react";
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
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
                                "group flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 border cursor-pointer transition-colors",
                                isSelected
                                    ? "border-primary bg-primary/15"
                                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60"
                            )}
                        >
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePreview(song);
                                }}
                                className={cn(
                                    "shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                                    isPreviewing
                                        ? "bg-primary text-white"
                                        : "bg-slate-800 text-slate-300 group-hover:text-primary"
                                )}
                            >
                                {isPreviewing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                            </button>

                            <div className="min-w-0 flex-1">
                                <p className={cn("text-xs font-medium truncate", isSelected ? "text-white" : "text-slate-200")}>
                                    {song.title}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">{song.artist}</p>
                            </div>

                            {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
