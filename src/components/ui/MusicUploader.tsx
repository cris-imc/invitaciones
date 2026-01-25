"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, Music, X, Play, Pause, Trash2 } from 'lucide-react';
import { uploadImage } from '@/lib/image-processing'; // Reusing upload logic since it's generic file upload
import { cn } from '@/lib/utils';
import { Button } from './button';

interface MusicUploaderProps {
    onMusicUploaded: (url: string) => void;
    currentMusicUrl?: string;
    className?: string;
}

export function MusicUploader({ onMusicUploaded, currentMusicUrl, className }: MusicUploaderProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Internal state to track the active URL (either previously saved or newly uploaded)
    const [activeUrl, setActiveUrl] = useState<string | null>(currentMusicUrl || null);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Sync prop changes
    useEffect(() => {
        if (currentMusicUrl !== activeUrl) {
            setActiveUrl(currentMusicUrl || null);
        }
    }, [currentMusicUrl]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setError(null);
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError('El archivo supera los 10MB');
            return;
        }

        setSelectedFile(file);
        handleUpload(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'audio/*': ['.mp3', '.wav', '.ogg'] },
        maxFiles: 1,
        multiple: false
    });

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        try {
            // Using the existing upload utility which hits /api/upload
            const uploadedUrl = await uploadImage(file);
            setActiveUrl(uploadedUrl);
            onMusicUploaded(uploadedUrl);
            setSelectedFile(null); // Clear file selection as it's now remote
        } catch (err) {
            console.error(err);
            setError('Error al subir el audio');
            setSelectedFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveUrl(null);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        onMusicUploaded(""); // Clear in parent
    };

    return (
        <div className={cn("w-full", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden min-h-[120px] flex flex-col items-center justify-center gap-4 bg-slate-50 hover:bg-slate-100",
                    isDragActive ? "border-primary bg-primary/5" : "border-slate-300",
                    activeUrl ? "border-solid border-slate-200 p-4" : "p-8"
                )}
            >
                <input {...getInputProps()} disabled={!!activeUrl || isUploading} />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Subiendo audio...</p>
                    </div>
                ) : activeUrl ? (
                    <div className="w-full flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border" onClick={(e) => e.stopPropagation()}>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Music className="w-5 h-5 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {selectedFile ? selectedFile.name : activeUrl.split('/').pop()}
                            </p>
                            <p className="text-xs text-muted-foreground">Audio cargado</p>
                        </div>

                        <audio
                            ref={audioRef}
                            src={activeUrl}
                            onEnded={() => setIsPlaying(false)}
                            onPause={() => setIsPlaying(false)}
                            onPlay={() => setIsPlaying(true)}
                        />

                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-slate-600 hover:text-primary hover:bg-primary/10 rounded-full"
                            onClick={togglePlay}
                        >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </Button>

                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-full"
                            onClick={handleRemove}
                        >
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                            <Music className="w-6 h-6 text-slate-500" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-slate-900">
                                Click para subir o arrastra aquí
                            </p>
                            <p className="text-xs text-slate-500">
                                MP3, WAV (Máx 10MB)
                            </p>
                        </div>
                    </>
                )}
            </div>

            {error && (
                <p className="text-destructive text-sm mt-2 flex items-center gap-1">
                    <X className="w-3 h-3" /> {error}
                </p>
            )}
        </div>
    );
}
