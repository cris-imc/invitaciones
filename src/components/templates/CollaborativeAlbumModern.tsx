"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/Toast";

interface CollaborativeAlbumModernProps {
  invitationSlug: string;
  fechaEvento?: Date | string;
  horaEvento?: string;
  guestName?: string;
  photos?: Array<{
    url: string;
    uploaderName?: string;
    uploadedAt?: string;
  }>;
}

export function CollaborativeAlbumModern({ 
  invitationSlug, 
  fechaEvento,
  horaEvento,
  guestName,
  photos = [] 
}: CollaborativeAlbumModernProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploaderName, setUploaderName] = useState(guestName || "");
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploaderName.trim()) {
      showToast("Por favor completa todos los campos", "error");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("uploaderName", uploaderName);
      formData.append("invitationSlug", invitationSlug);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir la foto");
      }

      showToast("Tu foto se ha subido correctamente", "success");

      setSelectedFile(null);
      setUploaderName("");
    } catch (error) {
      showToast("No se pudo subir la foto. Inténtalo nuevamente", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-8">
        <h3 className="text-2xl font-bold mb-4 text-center">
          Compartí tus fotos
        </h3>
        <p className="text-center text-muted-foreground mb-6">
          Ayudanos a crear un álbum colaborativo del evento
        </p>

        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <Input
              type="text"
              placeholder="Tu nombre"
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="relative">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>
                {selectedFile ? selectedFile.name : "Seleccionar foto"}
              </span>
            </label>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !uploaderName.trim() || isUploading}
            className="w-full"
          >
            {isUploading ? "Subiendo..." : "Subir foto"}
          </Button>
        </div>
      </div>

      {/* Gallery */}
      {photos.length > 0 && (
        <div>
          <h4 className="text-xl font-semibold mb-4 text-center">
            Fotos compartidas ({photos.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <motion.div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={photo.url}
                  alt={`Foto de ${photo.uploaderName || "invitado"}`}
                  className="w-full h-full object-cover"
                />
                {photo.uploaderName && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.uploaderName}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Sé el primero en compartir una foto</p>
        </div>
      )}
    </div>
  );
}
