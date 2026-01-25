"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, ImagePlus, X, Crop as CropIcon } from 'lucide-react';
import ImageCropper from './ImageCropper';
import { validateImage, optimizeImage, uploadImage } from '@/lib/image-processing';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from './button';

interface ImageUploaderProps {
    onImageUploaded: (url: string) => void;
    aspectRatio?: number;
    className?: string;
    currentImage?: string;
}

export function ImageUploader({ onImageUploaded, aspectRatio = 1, className, currentImage }: ImageUploaderProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setError(null);
        try {
            await validateImage(file, { minWidth: 400, minHeight: 400 });
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setSelectedFile(file);
            setShowCropper(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al validar la imagen');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        maxFiles: 1,
        multiple: false
    });

    const handleCropComplete = async (croppedImageUrl: string) => {
        setShowCropper(false);
        setIsUploading(true);

        try {
            // Convert base64 to blob/file
            const response = await fetch(croppedImageUrl);
            const blob = await response.blob();
            const croppedFile = new File([blob], selectedFile?.name || 'image.jpg', { type: 'image/jpeg' });

            // Optimize
            const optimizedFile = await optimizeImage(croppedFile);

            // Upload
            const uploadedUrl = await uploadImage(optimizedFile);
            onImageUploaded(uploadedUrl);

            // Clean up
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setSelectedFile(null);
        } catch (err) {
            console.error(err);
            setError('Error al subir la imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancelCrop = () => {
        setShowCropper(false);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
    };

    return (
        <div className={cn("w-full", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden min-h-[200px] flex flex-col items-center justify-center gap-4 bg-slate-50 hover:bg-slate-100",
                    isDragActive ? "border-primary bg-primary/5" : "border-slate-300",
                    (currentImage && !isUploading) ? "border-solid border-slate-200 p-0" : "p-8"
                )}
            >
                <input {...getInputProps()} />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-2 p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Procesando imagen...</p>
                    </div>
                ) : currentImage ? (
                    <div className="relative w-full h-full min-h-[200px] group">
                        <Image
                            src={currentImage}
                            alt="Preview"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <Upload className="w-6 h-6 text-white" />
                            <span className="text-white font-medium text-sm">Cambiar Imagen</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                            <ImagePlus className="w-6 h-6 text-slate-500" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-slate-900">
                                Click para subir o arrastra aquí
                            </p>
                            <p className="text-xs text-slate-500">
                                JPG, PNG, WEBP (Máx 10MB)
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

            {showCropper && previewUrl && (
                <ImageCropper
                    image={previewUrl}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCancelCrop}
                    aspectRatio={aspectRatio}
                />
            )}
        </div>
    );
}
