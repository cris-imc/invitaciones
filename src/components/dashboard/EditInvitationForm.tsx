"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

import { MusicUploader } from "@/components/ui/MusicUploader";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Label } from "@/components/ui/label";

interface Invitation {
    id: string;
    tipo: string;
    estado: string; // BORRADOR, ACTIVA, FINALIZADA
    nombreEvento: string;
    fechaEvento: Date;
    nombreNovio?: string | null;
    nombreNovia?: string | null;
    nombreQuinceanera?: string | null;
    lugarNombre?: string | null;
    direccion?: string | null;
    hora?: string | null;
    mapUrl?: string | null;
    colorPrincipal?: string;
    tema?: string;
    musicaUrl?: string | null;
    templateId: string;
    temaColores: string;

    // Music
    musicaHabilitada: boolean;

    // Cover
    portadaHabilitada: boolean;
    portadaTitulo?: string | null;
    portadaTextoBoton?: string | null;
    portadaImagenFondo?: string | null;

    // Gallery
    galeriaPrincipalHabilitada: boolean;
    galeriaPrincipalFotos: string | null;

    // Trivia
    triviaHabilitada?: boolean;
    triviaPreguntas?: string | null;
}

interface EditInvitationFormProps {
    invitation: Invitation;
}

export function EditInvitationForm({ invitation }: EditInvitationFormProps) {
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    // Parse temaColores
    const temaColores = typeof invitation.temaColores === 'string'
        ? JSON.parse(invitation.temaColores)
        : invitation.temaColores;

    const [formData, setFormData] = useState({
        type: invitation.tipo,
        estado: invitation.estado,
        nombreEvento: invitation.nombreEvento,
        fecha: invitation.fechaEvento.toISOString().split('T')[0],
        hora: invitation.hora || '',
        nombreNovio: invitation.nombreNovio || '',
        nombreNovia: invitation.nombreNovia || '',
        nombreQuinceanera: invitation.nombreQuinceanera || '',
        lugarNombre: invitation.lugarNombre || '',
        direccion: invitation.direccion || '',
        mapUrl: invitation.mapUrl || '',

        // Theme
        colorPrincipal: temaColores?.primaryColor || temaColores?.colorPrincipal || '#e11d48',
        tema: temaColores?.tema || 'moderno',

        // Music
        musicaHabilitada: invitation.musicaHabilitada,
        musicaUrl: invitation.musicaUrl || '',

        // Cover
        portadaHabilitada: invitation.portadaHabilitada,
        portadaTitulo: invitation.portadaTitulo || '',
        portadaTextoBoton: invitation.portadaTextoBoton || '',
        portadaImagenFondo: invitation.portadaImagenFondo || '',

        // Gallery
        galeriaPrincipalHabilitada: invitation.galeriaPrincipalHabilitada,
        galeriaPrincipalFotos: invitation.galeriaPrincipalFotos ? JSON.parse(invitation.galeriaPrincipalFotos) : [],

        // Trivia
        triviaHabilitada: invitation.triviaHabilitada || false,
        triviaPreguntas: invitation.triviaPreguntas || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await fetch(`/api/invitations?id=${invitation.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || 'Error al actualizar invitación');
            }

            router.push('/dashboard/invitaciones');
        } catch (error) {
            console.error('Error updating invitation:', error);
            alert(`Error al actualizar la invitación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/invitaciones">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Editar Invitación</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Estado de la invitación */}
                        <div className="border p-4 rounded-lg bg-blue-50">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base font-semibold">Estado de la Invitación</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {formData.estado === 'ACTIVA'
                                            ? 'La invitación está visible y accesible para todos'
                                            : formData.estado === 'BORRADOR'
                                                ? 'La invitación está en modo borrador'
                                                : 'El evento ha finalizado'}
                                    </p>
                                </div>
                                <select
                                    value={formData.estado}
                                    onChange={(e) => handleInputChange('estado', e.target.value)}
                                    className="p-2 border rounded-md font-medium"
                                >
                                    <option value="BORRADOR">📝 Borrador</option>
                                    <option value="ACTIVA">✅ Activa</option>
                                    <option value="FINALIZADA">🎉 Finalizada</option>
                                </select>
                            </div>
                        </div>

                        {/* Tipo de evento */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo de Evento</label>
                            <select
                                value={formData.type}
                                onChange={(e) => handleInputChange('type', e.target.value)}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="CASAMIENTO">Casamiento</option>
                                <option value="QUINCE_ANOS">15 Años</option>
                                <option value="CUMPLEANOS">Cumpleaños</option>
                                <option value="BAUTISMO">Bautismo</option>
                                <option value="COMUNION">Comunión</option>
                                <option value="OTRO">Otro</option>
                            </select>
                        </div>

                        {/* Nombre del evento */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre del Evento</label>
                            <input
                                type="text"
                                value={formData.nombreEvento}
                                onChange={(e) => handleInputChange('nombreEvento', e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>

                        {/* Fecha y hora */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Fecha</label>
                                <input
                                    type="date"
                                    value={formData.fecha}
                                    onChange={(e) => handleInputChange('fecha', e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Hora</label>
                                <input
                                    type="time"
                                    value={formData.hora}
                                    onChange={(e) => handleInputChange('hora', e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        </div>

                        {/* Nombres según tipo */}
                        {formData.type === 'CASAMIENTO' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nombre del Novio</label>
                                    <input
                                        type="text"
                                        value={formData.nombreNovio}
                                        onChange={(e) => handleInputChange('nombreNovio', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nombre de la Novia</label>
                                    <input
                                        type="text"
                                        value={formData.nombreNovia}
                                        onChange={(e) => handleInputChange('nombreNovia', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                            </div>
                        )}

                        {formData.type === 'QUINCE_ANOS' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre de la Quinceañera</label>
                                <input
                                    type="text"
                                    value={formData.nombreQuinceanera}
                                    onChange={(e) => handleInputChange('nombreQuinceanera', e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        )}

                        {/* Lugar */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Lugar del Evento</label>
                            <input
                                type="text"
                                value={formData.lugarNombre}
                                onChange={(e) => handleInputChange('lugarNombre', e.target.value)}
                                className="w-full p-2 border rounded-md"
                                placeholder="Ej: Salón Los Robles"
                            />
                        </div>

                        {/* Dirección */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Dirección</label>
                            <input
                                type="text"
                                value={formData.direccion}
                                onChange={(e) => handleInputChange('direccion', e.target.value)}
                                className="w-full p-2 border rounded-md"
                                placeholder="Dirección completa"
                            />
                        </div>

                        {/* Map URL */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">URL del Mapa</label>
                            <input
                                type="url"
                                value={formData.mapUrl}
                                onChange={(e) => handleInputChange('mapUrl', e.target.value)}
                                className="w-full p-2 border rounded-md"
                                placeholder="https://maps.google.com/..."
                            />
                        </div>

                        {/* Color principal */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Color Principal</label>
                            <input
                                type="color"
                                value={formData.colorPrincipal}
                                onChange={(e) => handleInputChange('colorPrincipal', e.target.value)}
                                className="w-full p-2 border rounded-md h-10"
                            />
                        </div>

                        {/* Portada */}
                        <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="portadaHabilitada"
                                    checked={formData.portadaHabilitada}
                                    onCheckedChange={(checked) => handleInputChange('portadaHabilitada', checked)}
                                />
                                <Label htmlFor="portadaHabilitada" className="font-semibold cursor-pointer">Portada de Bienvenida</Label>
                            </div>

                            {formData.portadaHabilitada && (
                                <div className="space-y-4 pl-6 border-l-2 border-slate-200 ml-1">
                                    <div className="space-y-2">
                                        <Label>Imagen de Fondo</Label>
                                        <ImageUploader
                                            currentImage={formData.portadaImagenFondo}
                                            onImageUploaded={(url) => handleInputChange('portadaImagenFondo', url)}
                                            aspectRatio={16 / 9}
                                        />
                                        <p className="text-xs text-muted-foreground">Se recomienda una imagen horizontal de alta calidad.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Título</Label>
                                        <input
                                            type="text"
                                            value={formData.portadaTitulo}
                                            onChange={(e) => handleInputChange('portadaTitulo', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Texto del Botón</Label>
                                        <input
                                            type="text"
                                            value={formData.portadaTextoBoton}
                                            onChange={(e) => handleInputChange('portadaTextoBoton', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Música */}
                        <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                            {/* Note: I didn't add musicaHabilitada to state in previous step, checking... I missed it in formData init. I should add it. */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="musicaHabilitada"
                                    checked={formData.musicaHabilitada}
                                    onCheckedChange={(checked) => handleInputChange('musicaHabilitada', checked)}
                                />
                                <Label htmlFor="musicaHabilitada" className="font-semibold cursor-pointer">Música de Fondo</Label>
                            </div>
                            {formData.musicaHabilitada && (
                                <div className="space-y-4 pl-6 border-l-2 border-slate-200 ml-1">
                                    <MusicUploader
                                        currentMusicUrl={formData.musicaUrl}
                                        onMusicUploaded={(url) => handleInputChange('musicaUrl', url)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Galería Simple (Edición rápida) */}
                        <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="galeriaPrincipalHabilitada"
                                    checked={formData.galeriaPrincipalHabilitada}
                                    onCheckedChange={(checked) => handleInputChange('galeriaPrincipalHabilitada', checked)}
                                />
                                <Label htmlFor="galeriaPrincipalHabilitada" className="font-semibold cursor-pointer">Galería de Fotos ({formData.galeriaPrincipalFotos.length})</Label>
                            </div>
                            {formData.galeriaPrincipalHabilitada && (
                                <div className="space-y-4 pl-6 border-l-2 border-slate-200 ml-1">
                                    <p className="text-xs text-muted-foreground">Para editar la galería completa, usa el Wizard completo (próximamente) o sube nuevas fotos aquí para reemplazar.</p>
                                    <ImageUploader
                                        currentImage=""
                                        onImageUploaded={(url) => {
                                            // Simple append 
                                            const newPhotos = [...formData.galeriaPrincipalFotos, url];
                                            setFormData(prev => ({ ...prev, galeriaPrincipalFotos: newPhotos }));
                                        }}
                                        aspectRatio={1 / 1}
                                    />
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {formData.galeriaPrincipalFotos.map((foto: string, idx: number) => (
                                            <div key={idx} className="relative aspect-square rounded overflow-hidden group">
                                                <img src={foto} className="object-cover w-full h-full" alt="Gallery" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newPhotos = formData.galeriaPrincipalFotos.filter((_: string, i: number) => i !== idx);
                                                        setFormData(prev => ({ ...prev, galeriaPrincipalFotos: newPhotos }));
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quiz/Trivia Section */}
                        <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="triviaHabilitada"
                                    checked={formData.triviaHabilitada}
                                    onCheckedChange={(checked) => handleInputChange('triviaHabilitada', checked)}
                                />
                                <Label htmlFor="triviaHabilitada" className="font-semibold cursor-pointer">
                                    Quiz/Trivia
                                </Label>
                            </div>
                            {formData.triviaHabilitada && (
                                <div className="space-y-4 pl-6 border-l-2 border-slate-200 ml-1">
                                    <p className="text-sm text-muted-foreground">
                                        El quiz/trivia completo se puede editar desde el wizard de creación.
                                        Aquí puedes ver cuántas preguntas hay configuradas.
                                    </p>
                                    {formData.triviaPreguntas && (() => {
                                        try {
                                            const preguntas = JSON.parse(formData.triviaPreguntas);
                                            return (
                                                <div className="text-sm bg-blue-50 p-3 rounded">
                                                    <strong>{preguntas.length}</strong> preguntas configuradas
                                                </div>
                                            );
                                        } catch {
                                            return <p className="text-sm text-muted-foreground">No hay preguntas</p>;
                                        }
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Guardar Cambios
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}