"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, Lock } from "lucide-react";
import { BackLink } from "@/components/ui/BackLink";
import { isEventDateLocked } from "@/lib/expiration";

import { MusicUploader } from "@/components/ui/MusicUploader";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TemplateSelector } from "@/components/dashboard/TemplateSelector";

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
    templateTipo?: string;
    temaColores: string;
    planTier: string;

    // Music
    musicaHabilitada: boolean;
    sugerenciaMusicaHabilitada: boolean;

    // Cover
    portadaHabilitada: boolean;
    portadaKicker?: string | null;
    portadaTitulo?: string | null;
    portadaMensaje?: string | null;
    portadaTextoBoton?: string | null;
    portadaDressCode?: string | null;
    ciudad?: string | null;
    portadaImagenFondo?: string | null;

    // Gallery
    galeriaPrincipalHabilitada: boolean;
    galeriaPrincipalFotos: string | null;

    // Trivia
    triviaHabilitada?: boolean;
    triviaPreguntas?: string | null;

    // Regalo/Bank Details
    regaloHabilitado?: boolean;
    regaloTitulo?: string | null;
    regaloMensaje?: string | null;
    regaloMostrarDatos?: boolean;
    regaloBanco?: string | null;
    regaloCbu?: string | null;
    regaloAlias?: string | null;
    regaloTitular?: string | null;

    // RSVP
    rsvpDaysBeforeEvent?: number | null;
}

import { useSession } from "next-auth/react";

interface EditInvitationFormProps {
    invitation: Invitation;
}

export function EditInvitationForm({ invitation }: EditInvitationFormProps) {
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.planTier === "ADMIN";

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
        ciudad: invitation.ciudad || '',
        nombreNovio: invitation.nombreNovio || '',
        nombreNovia: invitation.nombreNovia || '',
        nombreQuinceanera: invitation.nombreQuinceanera || '',
        lugarNombre: invitation.lugarNombre || '',
        direccion: invitation.direccion || '',
        mapUrl: invitation.mapUrl || '',

        // Theme & Template
        templateTipo: invitation.templateTipo || 'ORIGINAL',
        colorPrincipal: temaColores?.primaryColor || temaColores?.colorPrincipal || '#e11d48',
        tema: temaColores?.tema || 'moderno',

        // Music
        musicaHabilitada: invitation.musicaHabilitada,
        sugerenciaMusicaHabilitada: invitation.sugerenciaMusicaHabilitada ?? true,
        musicaUrl: invitation.musicaUrl || '',

        // Cover
        portadaHabilitada: invitation.portadaHabilitada,
        portadaKicker: invitation.portadaKicker || '',
        portadaTitulo: invitation.portadaTitulo || '',
        portadaMensaje: invitation.portadaMensaje || '',
        portadaTextoBoton: invitation.portadaTextoBoton || '',
        portadaDressCode: invitation.portadaDressCode || '',
        portadaImagenFondo: invitation.portadaImagenFondo || '',

        // Gallery
        galeriaPrincipalHabilitada: invitation.galeriaPrincipalHabilitada,
        galeriaPrincipalFotos: invitation.galeriaPrincipalFotos ? JSON.parse(invitation.galeriaPrincipalFotos) : [],

        // Trivia
        triviaHabilitada: invitation.triviaHabilitada || false,
        triviaPreguntas: invitation.triviaPreguntas || '',

        // Regalo
        regaloHabilitado: invitation.regaloHabilitado || false,
        regaloTitulo: invitation.regaloTitulo || '',
        regaloMensaje: invitation.regaloMensaje || '',
        regaloMostrarDatos: invitation.regaloMostrarDatos || false,
        regaloBanco: invitation.regaloBanco || '',
        regaloCbu: invitation.regaloCbu || '',
        regaloAlias: invitation.regaloAlias || '',
        regaloTitular: invitation.regaloTitular || '',

        // RSVP
        rsvpDaysBeforeEvent: invitation.rsvpDaysBeforeEvent || 7,
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

            router.push('/dashboard');
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
                <BackLink href="/dashboard" />
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
                            <label className="text-sm font-medium">Título de la Invitación</label>
                            <input
                                type="text"
                                value={formData.nombreEvento}
                                onChange={(e) => handleInputChange('nombreEvento', e.target.value)}
                                className="w-full p-2 border rounded-md"
                                placeholder={
                                    formData.type === 'CASAMIENTO' ? "Ej: Nuestra Boda" :
                                        formData.type === 'QUINCE_ANOS' ? "Ej: Mis 15 Años" :
                                            "Ej: Mi Cumpleaños, Mi Bautismo, etc."
                                }
                                required
                            />
                            {formData.type === 'QUINCE_ANOS' && (
                                <p className="text-xs text-muted-foreground">
                                    Este es el título general. Tu nombre lo ingresarás en el campo siguiente.
                                </p>
                            )}
                        </div>

                        {/* Fecha y hora */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                {(() => {
                                    const rawLocked = isEventDateLocked(invitation.fechaEvento);
                                    const isLocked = !isAdmin && rawLocked;
                                    return (
                                        <>
                                            <label className="text-sm font-medium flex items-center justify-between">
                                                <span>Fecha</span>
                                                {rawLocked && (
                                                    <span className={`text-xs flex items-center gap-1 font-semibold ${isAdmin ? 'text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                        <Lock className="w-3 h-3" /> {isAdmin ? "👑 Desbloqueado (Admin)" : "Bloqueada (30d)"}
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.fecha}
                                                onChange={(e) => handleInputChange('fecha', e.target.value)}
                                                disabled={isLocked}
                                                className="w-full p-2 border rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-slate-800"
                                                required
                                            />
                                            {rawLocked && !isAdmin && (
                                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                                    No se puede modificar la fecha cuando faltan 30 días o menos para el evento.
                                                </p>
                                            )}
                                            {rawLocked && isAdmin && (
                                                <p className="text-xs text-green-400 font-medium">
                                                    👑 Modo Administrador: podés modificar la fecha libremente.
                                                </p>
                                            )}
                                        </>
                                    );
                                })()}
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

                        {/* Configuración de Sugerencia de Música */}
                        <div className="border p-4 rounded-lg bg-slate-50">
                            <h3 className="font-semibold mb-4 text-slate-800 flex items-center gap-2">
                                <span className="text-xl">🎵</span>
                                Sugerencia de Canciones
                            </h3>
                            <div className="space-y-4">
                                <label className={`flex items-center space-x-2 relative group w-fit ${invitation.planTier === "FREE" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                    <input
                                        type="checkbox"
                                        checked={formData.sugerenciaMusicaHabilitada && invitation.planTier !== "FREE"}
                                        disabled={invitation.planTier === "FREE"}
                                        onChange={(e) => handleInputChange('sugerenciaMusicaHabilitada', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm font-medium flex items-center gap-2">
                                        Permitir a los invitados sugerir canciones
                                        {invitation.planTier === "FREE" && <Lock className="w-4 h-4 text-red-400" />}
                                    </span>
                                    {invitation.planTier === "FREE" && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                            Disponible en Premium
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Ciudad */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ciudad / Localidad</label>
                            <input
                                type="text"
                                placeholder="Ej: Buenos Aires, Rosario..."
                                value={formData.ciudad}
                                onChange={(e) => handleInputChange('ciudad', e.target.value)}
                                className="w-full p-2 border rounded-md"
                            />
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
                                <label className="text-sm font-medium">Nombre o Apodo de la Quinceañera</label>
                                <input
                                    type="text"
                                    value={formData.nombreQuinceanera}
                                    onChange={(e) => handleInputChange('nombreQuinceanera', e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Ej: Sofi, Valentina, Mafe..."
                                />
                                <p className="text-xs text-muted-foreground">
                                    Ingresá el nombre o apodo de la quinceañera que aparecerá destacado en toda la tarjeta.
                                </p>
                            </div>
                        )}

                        {(formData.type === 'CUMPLEANOS' || formData.type === 'BAUTISMO') && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre del Festejado/a</label>
                                <input
                                    type="text"
                                    value={formData.nombreQuinceanera}
                                    onChange={(e) => handleInputChange('nombreQuinceanera', e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Ej: Juancito, Sofía, etc."
                                />
                                <p className="text-xs text-muted-foreground">
                                    Este nombre aparecerá en el encabezado de la invitación.
                                </p>
                            </div>
                        )}

                        {/* Días sugeridos para RSVP */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Días sugeridos para confirmar asistencia</label>
                            <input
                                type="number"
                                min="1"
                                max="90"
                                value={formData.rsvpDaysBeforeEvent}
                                onChange={(e) => handleInputChange('rsvpDaysBeforeEvent', parseInt(e.target.value) || 7)}
                                className="w-full p-2 border rounded-md"
                            />
                            <p className="text-xs text-muted-foreground">
                                Cuántos días antes del evento sugerirías que confirmen. Esto aparecerá como texto informativo, no como restricción.
                            </p>
                        </div>

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
                                placeholder="Pegá el link que copiaste de Google Maps"
                            />
                            <p className="text-xs text-muted-foreground">
                                Vale cualquier link de Google Maps (el de "Compartir" o el de la barra de direcciones).
                            </p>
                        </div>

                        {/* Selección de Plantilla */}
                        <TemplateSelector 
                            value={formData.templateTipo}
                            onChange={(value) => handleInputChange('templateTipo', value)}
                            eventType={formData.type}
                        />

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
                            <h3 className="font-semibold text-lg border-b pb-2">Portada de Bienvenida</h3>
                            <div className="space-y-4">
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
                                        <Label>Encabezado / Copete de portada</Label>
                                        <input
                                            type="text"
                                            value={formData.portadaKicker ?? ''}
                                            onChange={(e) => handleInputChange('portadaKicker', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Ej: Con mucho cariño, para / ¡Te invitamos!"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Título</Label>
                                        <input
                                            type="text"
                                            value={formData.portadaTitulo ?? ''}
                                            onChange={(e) => handleInputChange('portadaTitulo', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Frase / Mensaje de Bienvenida</Label>
                                        <input
                                            type="text"
                                            value={formData.portadaMensaje ?? ''}
                                            onChange={(e) => handleInputChange('portadaMensaje', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Ej: Queremos compartir este momento único con vos."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Dress Code en Portada (Opcional)</Label>
                                        <input
                                            type="text"
                                            value={formData.portadaDressCode ?? ''}
                                            onChange={(e) => handleInputChange('portadaDressCode', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Ej: Elegante Sport / Black Tie"
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
                        </div>

                        {/* Música */}
                        <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                            <div className="flex items-center space-x-2 relative group w-fit">
                                    <Checkbox
                                        id="musicaHabilitada"
                                        checked={formData.musicaHabilitada && invitation.planTier !== "FREE"}
                                        disabled={invitation.planTier === "FREE"}
                                        onCheckedChange={(checked) => handleInputChange('musicaHabilitada', checked)}
                                    />
                                    <Label htmlFor="musicaHabilitada" className={`font-semibold flex items-center gap-2 ${invitation.planTier === "FREE" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                        Música de Fondo
                                        {invitation.planTier === "FREE" && <Lock className="w-4 h-4 text-red-400" />}
                                    </Label>
                                    {invitation.planTier === "FREE" && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                            Disponible en Premium
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                                        </div>
                                    )}
                                </div>
                            {formData.musicaHabilitada && invitation.planTier !== "FREE" && (
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
                            <div className="flex items-center space-x-2 relative group w-fit">
                                    <Checkbox
                                        id="triviaHabilitada"
                                        checked={formData.triviaHabilitada && invitation.planTier !== "FREE"}
                                        disabled={invitation.planTier === "FREE"}
                                        onCheckedChange={(checked) => handleInputChange('triviaHabilitada', checked)}
                                    />
                                    <Label htmlFor="triviaHabilitada" className={`font-semibold flex items-center gap-2 ${invitation.planTier === "FREE" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                        Quiz/Trivia Interactivo
                                        {invitation.planTier === "FREE" && <Lock className="w-4 h-4 text-red-400" />}
                                    </Label>
                                    {invitation.planTier === "FREE" && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                            Disponible en Premium
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                                        </div>
                                    )}
                                </div>
                            {formData.triviaHabilitada && invitation.planTier !== "FREE" && (
                                <div className="space-y-4 pl-6 border-l-2 border-slate-200 ml-1">
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Edita las preguntas del quiz (formato JSON)
                                    </p>
                                    <Textarea
                                        value={formData.triviaPreguntas}
                                        onChange={(e) => handleInputChange('triviaPreguntas', e.target.value)}
                                        rows={8}
                                        className="font-mono text-xs"
                                        placeholder='[["¿Pregunta?","Opción 1","Opción 2","Opción 3","Opción 4",0]]'
                                    />
                                    {formData.triviaPreguntas && (() => {
                                        try {
                                            const preguntas = JSON.parse(formData.triviaPreguntas);
                                            return (
                                                <div className="text-sm bg-blue-50 p-3 rounded">
                                                    ✓ <strong>{preguntas.length}</strong> preguntas válidas
                                                </div>
                                            );
                                        } catch {
                                            return <p className="text-sm text-red-500">⚠ Formato JSON inválido</p>;
                                        }
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Regalo/Datos Bancarios Section */}
                        <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="regaloHabilitado"
                                    checked={formData.regaloHabilitado}
                                    onCheckedChange={(checked) => handleInputChange('regaloHabilitado', checked)}
                                />
                                <Label htmlFor="regaloHabilitado" className="font-semibold cursor-pointer">
                                    Sección de Regalo / Datos Bancarios
                                </Label>
                            </div>
                            {formData.regaloHabilitado && (
                                <div className="space-y-4 pl-6 border-l-2 border-slate-200 ml-1">
                                    <div className="space-y-2">
                                        <Label htmlFor="regaloTitulo">Título</Label>
                                        <Input
                                            id="regaloTitulo"
                                            value={formData.regaloTitulo}
                                            onChange={(e) => handleInputChange('regaloTitulo', e.target.value)}
                                            placeholder="Ej: Regalo"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="regaloMensaje">Mensaje (Opcional)</Label>
                                        <Textarea
                                            id="regaloMensaje"
                                            value={formData.regaloMensaje}
                                            onChange={(e) => handleInputChange('regaloMensaje', e.target.value)}
                                            placeholder="Tu presencia es nuestro mejor regalo..."
                                        />
                                    </div>

                                        <div className="space-y-4 pl-6 border-l-2 border-blue-200 ml-1 bg-blue-50/50 p-4 rounded">
                                            <div className="space-y-2">
                                                <Label htmlFor="regaloBanco">Banco</Label>
                                                <Input
                                                    id="regaloBanco"
                                                    value={formData.regaloBanco}
                                                    onChange={(e) => handleInputChange('regaloBanco', e.target.value)}
                                                    placeholder="Ej: Banco Galicia"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="regaloCbu">CBU / CVU</Label>
                                                <Input
                                                    id="regaloCbu"
                                                    value={formData.regaloCbu}
                                                    onChange={(e) => handleInputChange('regaloCbu', e.target.value)}
                                                    placeholder="0000000000000000000000"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="regaloAlias">Alias</Label>
                                                <Input
                                                    id="regaloAlias"
                                                    value={formData.regaloAlias}
                                                    onChange={(e) => handleInputChange('regaloAlias', e.target.value)}
                                                    placeholder="mi.alias.mp"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="regaloTitular">Titular de la Cuenta</Label>
                                                <Input
                                                    id="regaloTitular"
                                                    value={formData.regaloTitular}
                                                    onChange={(e) => handleInputChange('regaloTitular', e.target.value)}
                                                    placeholder="Nombre Apellido"
                                                />
                                            </div>
                                        </div>
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