"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import Image from "next/image";

interface Photo {
    id: string;
    url: string;
    descripcion?: string | null;
    uploadedBy: string;
    createdAt: Date;
}

interface PhotoGalleryProps {
    albumId: string;
    photos: Photo[];
}

export function PhotoGallery({ albumId, photos }: PhotoGalleryProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // TODO: Implementar upload a storage (S3, Cloudflare R2, etc.)
            const formData = new FormData();
            formData.append('file', file);
            formData.append('albumId', albumId);

            const response = await fetch('/api/photos/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Error al subir foto');

            // Recargar la página para mostrar la nueva foto
            window.location.reload();
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Error al subir la foto');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="container px-6 mx-auto max-w-6xl">
                <div className="text-center mb-12">
                    <span 
                        className="text-xs uppercase tracking-[0.25em] block mb-3"
                        style={{ color: 'var(--color-text-secondary)', fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Recuerdos
                    </span>
                    <h2 
                        className="text-3xl md:text-4xl mb-4"
                        style={{ color: 'var(--color-primary)', fontFamily: "'Parisienne', cursive" }}
                    >
                        Galería de Fotos
                    </h2>
                    <p 
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)', fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Compartí tus mejores momentos del evento
                    </p>
                </div>

                <div className="space-y-10">
                    {/* Upload Button */}
                    <div className="flex justify-center">
                        <label htmlFor="photo-upload">
                            <Button 
                                variant="outline" 
                                className="gap-2 cursor-pointer rounded-full px-8 py-5 border-2 hover:opacity-80 transition-opacity" 
                                disabled={isUploading} 
                                asChild
                                style={{ 
                                    borderColor: 'var(--color-primary)', 
                                    color: 'var(--color-primary)',
                                    fontFamily: "'Montserrat', sans-serif",
                                    fontWeight: '500'
                                }}
                            >
                                <span>
                                    {isUploading ? (
                                        <>Subiendo...</>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Subir Foto
                                        </>
                                    )}
                                </span>
                            </Button>
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleUpload}
                                disabled={isUploading}
                            />
                        </label>
                    </div>

                    {/* Photo Grid - Better layout for few photos */}
                    {photos.length > 0 ? (
                        <div className={`grid gap-4 ${
                            photos.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                            photos.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' :
                            'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                        }`}>
                                {photos.map((photo) => (
                                    <div
                                        key={photo.id}
                                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group hover:opacity-90 transition-opacity"
                                        onClick={() => setSelectedPhoto(photo)}
                                    >
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <Camera className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-sm">Ver foto</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: 'var(--color-text-secondary)' }} />
                                <p style={{ color: 'var(--color-text-secondary)', fontFamily: "'Montserrat', sans-serif" }}>
                                    Aún no hay fotos. ¡Sé el primero en compartir!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <div className="max-w-4xl max-h-[90vh] relative">
                        <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
                            <Camera className="w-16 h-16 text-muted-foreground" />
                        </div>
                        {selectedPhoto.descripcion && (
                            <p className="text-white text-center mt-4">{selectedPhoto.descripcion}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
