"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface Invitation {
    id: string;
    tipo: string;
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
        nombreEvento: invitation.nombreEvento,
        fecha: invitation.fechaEvento.toISOString().split('T')[0],
        hora: invitation.hora || '',
        nombreNovio: invitation.nombreNovio || '',
        nombreNovia: invitation.nombreNovia || '',
        nombreQuinceanera: invitation.nombreQuinceanera || '',
        lugarNombre: invitation.lugarNombre || '',
        direccion: invitation.direccion || '',
        mapUrl: invitation.mapUrl || '',
        colorPrincipal: temaColores?.colorPrincipal || '#e11d48',
        tema: temaColores?.tema || 'moderno',
        musicaUrl: invitation.musicaUrl || '',
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

    const handleInputChange = (field: string, value: string) => {
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

                        {/* Música */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">URL de Música (opcional)</label>
                            <input
                                type="url"
                                value={formData.musicaUrl}
                                onChange={(e) => handleInputChange('musicaUrl', e.target.value)}
                                className="w-full p-2 border rounded-md"
                                placeholder="https://..."
                            />
                        </div>

                        {/* Botones */}
                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={isSaving} className="flex-1">
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
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}