"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface CollaborativeAlbumUploadProps {
    invitationSlug: string;
    guestName?: string; // Auto-detected from personalized link
    onUploadSuccess?: () => void;
}

export function CollaborativeAlbumUpload({
    invitationSlug,
    guestName,
    onUploadSuccess,
}: CollaborativeAlbumUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploaderName, setUploaderName] = useState(guestName || "");
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const { showToast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                showToast("Solo se permiten archivos de imagen", "error");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast("El archivo debe ser menor a 5MB", "error");
                return;
            }
            setSelectedFile(file);
            setUploadSuccess(false);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !uploaderName.trim()) {
            showToast("Por favor selecciona una foto y escribe tu nombre", "error");
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("photo", selectedFile);
            formData.append("uploadedBy", uploaderName.trim());

            const response = await fetch(`/api/invitations/${invitationSlug}/album/upload`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Error al subir la foto");
            }

            setUploadSuccess(true);
            showToast("¡Foto subida exitosamente!", "success");

            // Reset form
            setTimeout(() => {
                setSelectedFile(null);
                setPreview(null);
                setUploaderName("");
                setUploadSuccess(false);
                onUploadSuccess?.();
            }, 2000);
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Error al subir la foto", "error");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="photo" className="text-sm font-medium">
                        Selecciona una foto
                    </Label>
                    <div className="mt-2">
                        {preview ? (
                            <div className="relative">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreview(null);
                                    }}
                                >
                                    Cambiar
                                </Button>
                            </div>
                        ) : (
                            <label
                                htmlFor="photo"
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                            >
                                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">
                                    Haz clic para seleccionar
                                </span>
                                <input
                                    id="photo"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {!guestName && (
                    <div>
                        <Label htmlFor="uploaderName" className="text-sm font-medium">
                            Tu nombre
                        </Label>
                        <Input
                            id="uploaderName"
                            type="text"
                            placeholder="Ej: Juan Pérez"
                            value={uploaderName}
                            onChange={(e) => setUploaderName(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                )}

                <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || !uploaderName.trim() || isUploading || uploadSuccess}
                    className="w-full"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Subiendo...
                        </>
                    ) : uploadSuccess ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            ¡Subida exitosa!
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 mr-2" />
                            Subir foto
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
