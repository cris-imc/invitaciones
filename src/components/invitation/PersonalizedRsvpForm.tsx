"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/Toast";

interface Guest {
    id: string;
    name: string;
    type: string;
    expectedCount: number;
    status: string;
    attendingCount: number;
    message?: string | null;
}

interface PersonalizedRsvpFormProps {
    guest: Guest;
    invitation?: any;
    onSuccess: () => void;
}

export function PersonalizedRsvpForm({ guest, invitation, onSuccess }: PersonalizedRsvpFormProps) {
    const [attending, setAttending] = useState<string>(guest.status === "CONFIRMED" ? "yes" : guest.status === "DECLINED" ? "no" : "");
    const [count, setCount] = useState<string>(guest.attendingCount > 0 ? guest.attendingCount.toString() : guest.expectedCount.toString());
    const [message, setMessage] = useState(guest.message || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!attending) return;

        setIsSubmitting(true);
        const status = attending === "yes" ? "CONFIRMED" : "DECLINED";
        const finalCount = attending === "yes" ? parseInt(count) : 0;

        try {
            const res = await fetch(`/api/guests/${guest.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    attendingCount: finalCount,
                    message
                })
            });

            if (res.ok) {
                showToast("¡Gracias por confirmar tu asistencia!", "success");
                onSuccess();
            } else {
                showToast("Hubo un error al guardar tu respuesta", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Error de conexión", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-md mx-auto shadow-sm">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Label>¿Podrás asistir?</Label>
                        <RadioGroup value={attending} onValueChange={setAttending} className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value="yes" id="r-yes" />
                                <Label htmlFor="r-yes" className="font-normal cursor-pointer flex-1">Sí, allí estaré</Label>
                            </div>
                            <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value="no" id="r-no" />
                                <Label htmlFor="r-no" className="font-normal cursor-pointer flex-1">Lo siento, no podré asistir</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {attending === "yes" && guest.type === "FAMILY" && guest.expectedCount > 1 && (
                        <div className="space-y-2">
                            <Label>¿Cuántas personas asistirán?</Label>
                            <Select value={count} onValueChange={setCount}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar cantidad" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: guest.expectedCount }, (_, i) => i + 1).map((num) => (
                                        <SelectItem key={num} value={num.toString()}>
                                            {num} {num === 1 ? "persona" : "personas"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Cupo máximo para tu invitación: {guest.expectedCount}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="message">Mensaje (Opcional)</Label>
                        <Textarea
                            id="message"
                            placeholder="Alguna restricción alimentaria o mensaje para los anfitriones..."
                            value={message}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting || !attending}>
                        {isSubmitting ? "Enviando..." : "Confirmar Respuesta"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
