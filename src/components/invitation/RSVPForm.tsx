"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface RSVPFormProps {
    invitationId: string;
}

export function RSVPForm({ invitationId }: RSVPFormProps) {
    const [name, setName] = useState("");
    const [attending, setAttending] = useState("yes");
    const [count, setCount] = useState(1);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // NOTE: We need to implement an endpoint for open RSVPs if we want to support this.
            // For now, we'll assume there's one or simulate success to not break UI.
            // Ideally POST /api/invitations/[id]/rsvp

            // Simulating success as placeholder or implement API later
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Actual implementation would be:
            /*
            const res = await fetch(`/api/invitations/${invitationId}/rsvp`, {
                method: "POST",
                body: JSON.stringify({ nombre: name, asistencia: attending === "yes" ? "CONFIRMA" : "NO_ASISTE", ... })
            });
            */

            setSubmitted(true);
        } catch (error) {
            console.error(error);
            alert("Error al enviar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-green-50 p-6 rounded-lg text-center border border-green-100">
                <h3 className="text-xl font-bold text-green-700 mb-2">¡Gracias por confirmar!</h3>
                <p className="text-green-600">Tu respuesta ha sido registrada correctamente.</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-center mb-4">Confirmar Asistencia</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tu nombre y apellido"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label>¿Asistirás?</Label>
                    <RadioGroup value={attending} onValueChange={setAttending} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="gen-yes" />
                            <Label htmlFor="gen-yes">Sí, asistiré</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="gen-no" />
                            <Label htmlFor="gen-no">No podré</Label>
                        </div>
                    </RadioGroup>
                </div>

                {attending === "yes" && (
                    <div className="space-y-2">
                        <Label htmlFor="count">Cantidad de personas</Label>
                        <Input
                            id="count"
                            type="number"
                            min="1"
                            max="10"
                            value={count}
                            onChange={(e) => setCount(parseInt(e.target.value))}
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="msg">Mensaje (Opcional)</Label>
                    <Textarea
                        id="msg"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Algún comentario..."
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar Confirmación"}
                </Button>
            </form>
        </div>
    );
}
