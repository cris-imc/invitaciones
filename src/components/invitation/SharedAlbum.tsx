"use client";

import { useState, useEffect } from "react";
import { CollaborativeAlbumUpload } from "./CollaborativeAlbumUpload";
import { ScrollReveal } from "./ScrollReveal";
import { Loader2 } from "lucide-react";

interface Photo {
    id: string;
    url: string;
    uploadedBy: string;
    createdAt: string;
}

interface SharedAlbumProps {
    invitationSlug: string;
    titulo?: string;
    descripcion?: string;
    colorPrimario?: string;
    fechaEvento?: Date;
    horaEvento?: string;
    guestName?: string; // From personalized link
    className?: string;
}

export function SharedAlbum({
    invitationSlug,
    titulo = "Álbum Colaborativo",
    descripcion = "Subí tus fotos favoritas del evento y mirá las de los demás invitados",
    colorPrimario = "#000000",
    fechaEvento,
    horaEvento,
    guestName,
    className,
}: SharedAlbumProps) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Check if event has started (compare in UTC to avoid timezone issues)
    const eventHasStarted = fechaEvento ? (() => {
        const now = new Date();
        const eventDate = new Date(fechaEvento);
        // Compare timestamps directly
        return now.getTime() >= eventDate.getTime();
    })() : true;

    const fetchPhotos = async () => {
        try {
            const response = await fetch(`/api/invitations/${invitationSlug}/album`);
            if (response.ok) {
                const data = await response.json();
                setPhotos(data.photos || []);
            }
        } catch (error) {
            console.error("Error fetching photos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, [invitationSlug]);

    return (
        <section className={`py-20 px-4 ${className || 'bg-slate-50'}`}>
            <ScrollReveal>
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="text-6xl mb-6">📸</div>
                        <h2
                            className="text-3xl md:text-4xl font-bold mb-4"
                            style={{ color: colorPrimario, fontFamily: "var(--font-ornamental)" }}
                        >
                            {titulo}
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {descripcion}
                        </p>
                    </div>

                    {/* Upload Component or Event Not Started Message */}
                    <div className="mb-16">
                        {!eventHasStarted ? (
                            <div className="max-w-md mx-auto p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
                                <p className="text-amber-800 font-medium">
                                    📅 El álbum colaborativo estará disponible una vez que inicie el evento
                                </p>
                                {fechaEvento && (
                                    <p className="text-sm text-amber-600 mt-2">
                                        {new Date(fechaEvento).toLocaleDateString('es-AR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            timeZone: 'UTC'
                                        })}
                                        {horaEvento && ` a las ${horaEvento}`}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <CollaborativeAlbumUpload
                                invitationSlug={invitationSlug}
                                guestName={guestName}
                                onUploadSuccess={fetchPhotos}
                            />
                        )}
                    </div>

                    {/* Photos Grid */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : photos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {photos.map((photo, index) => (
                                <div
                                    key={photo.id}
                                    className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                    style={{
                                        animation: `subtle-dance 3s ease-in-out infinite`,
                                        animationDelay: `${index * 0.1}s`
                                    }}
                                >
                                    <img
                                        src={photo.url}
                                        alt={`Foto de ${photo.uploadedBy}`}
                                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                                            <p className="text-white text-sm font-medium">
                                                📷 {photo.uploadedBy}
                                            </p>
                                            <a
                                                href={photo.url}
                                                download
                                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                    <style jsx>{`
                                        @keyframes subtle-dance {
                                            0%, 100% { transform: translateY(0px) rotate(0deg); }
                                            25% { transform: translateY(-3px) rotate(0.5deg); }
                                            50% { transform: translateY(0px) rotate(0deg); }
                                            75% { transform: translateY(-2px) rotate(-0.5deg); }
                                        }
                                    `}</style>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">
                                Aún no hay fotos. ¡Sé el primero en subir una!
                            </p>
                        </div>
                    )}
                </div>
            </ScrollReveal>
        </section>
    );
}
