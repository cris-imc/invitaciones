"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CollaborativeAlbumUpload } from "@/components/invitation/CollaborativeAlbumUpload";
import { Loader2 } from "lucide-react";

interface Photo {
    id: string;
    url: string;
    uploadedBy: string;
    createdAt: string;
}

interface CollaborativeAlbumModernProps {
    invitationSlug: string;
    fechaEvento?: Date;
    horaEvento?: string;
    guestName?: string;
}

export function CollaborativeAlbumModern({ invitationSlug, fechaEvento, horaEvento, guestName }: CollaborativeAlbumModernProps) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Check if event has started (compare timestamps to avoid timezone issues)
    const eventHasStarted = fechaEvento ? (() => {
        const now = new Date();
        const eventDate = new Date(fechaEvento);
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
        <section className="relative min-h-screen bg-black text-white py-32">
            <div className="container mx-auto px-6 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-16"
                >
                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-5xl md:text-7xl font-thin mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            Álbum Colaborativo
                        </h2>
                        <p className="text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
                            Compartí tus fotos favoritas del evento y mirá las de los demás invitados
                        </p>
                    </div>

                    {/* Upload Component or Event Not Started Message */}
                    <div className="max-w-md mx-auto">
                        {!eventHasStarted ? (
                            <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-center">
                                <p className="text-white font-light mb-2">
                                    📅 El álbum colaborativo estará disponible una vez que inicie el evento
                                </p>
                                {fechaEvento && (
                                    <p className="text-sm text-white/60 mt-2">
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
                            <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                        </div>
                    ) : photos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {photos.map((photo, index) => (
                                <motion.div
                                    key={photo.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative group overflow-hidden rounded-lg hover:-translate-y-1 transition-transform duration-300"
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
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                                            <p className="text-white text-sm font-light">
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
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-white/50 text-lg">
                                Aún no hay fotos. ¡Sé el primero en subir una!
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
