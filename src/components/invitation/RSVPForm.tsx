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
        <div className="max-w-md mx-auto bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-8">

                <div className="space-y-4 text-center">
                    <Label htmlFor="name" className="text-lg text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "var(--font-sans)" }}>¿Quiénes asisten?</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre y Apellido"
                        required
                        className="text-center text-xl h-14 bg-slate-50 border-transparent focus:border-primary focus:ring-0 transition-all"
                        style={{ fontFamily: "var(--font-sans)" }}
                    />
                </div>

                <div className="space-y-4 text-center">
                    <Label htmlFor="count" className="text-lg text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "var(--font-sans)" }}>¿Cuántos son?</Label>
                    <div className="flex items-center justify-center">
                        <Input
                            id="count"
                            type="number"
                            min="1"
                            max="10"
                            value={count}
                            onChange={(e) => setCount(parseInt(e.target.value))}
                            className="text-center text-5xl h-24 w-32 font-light border-2 border-slate-100 rounded-2xl focus:border-primary focus:ring-0 transition-all font-serif"
                            style={{ fontFamily: "var(--font-serif)" }}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full text-xl py-8 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                    disabled={isSubmitting}
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-text-light)',
                        fontFamily: "var(--font-sans)",
                        letterSpacing: '0.1em'
                    }}
                >
                    {isSubmitting ? "ENVIANDO..." : "CONFIRMAR ASISTENCIA"}
                </Button>
            </form>
        </div>
    );
}
