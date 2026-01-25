"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2 } from "lucide-react";

const rsvpSchema = z.object({
    nombre: z.string().min(2, "El nombre es requerido"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    telefono: z.string().optional(),
    asistencia: z.enum(["CONFIRMA", "NO_ASISTE"]),
    numeroAcompanantes: z.number().min(0).max(10),
    mensaje: z.string().optional(),
});

type RSVPFormData = z.infer<typeof rsvpSchema>;

interface RSVPFormProps {
    invitationId: string;
    colorPrimario?: string;
}

export function RSVPForm({ invitationId, colorPrimario = "#000" }: RSVPFormProps) {
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<RSVPFormData>({
        resolver: zodResolver(rsvpSchema),
        defaultValues: {
            nombre: "",
            email: "",
            telefono: "",
            asistencia: "CONFIRMA",
            numeroAcompanantes: 0,
            mensaje: "",
        },
    });

    async function onSubmit(values: RSVPFormData) {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    invitationId,
                }),
            });

            if (!response.ok) throw new Error('Error al enviar confirmación');

            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting RSVP:', error);
            alert('Error al enviar la confirmación. Por favor intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (submitted) {
        return (
            <div className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="container px-6 mx-auto max-w-xl text-center">
                    <div 
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)' }}
                    >
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 
                        className="text-3xl mb-4" 
                        style={{ fontFamily: "'Parisienne', cursive", color: 'var(--color-text-dark)' }}
                    >
                        ¡Confirmación Recibida!
                    </h3>
                    <p 
                        className="text-sm"
                        style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--color-text-secondary)' }}
                    >
                        Gracias por confirmar tu asistencia. ¡Te esperamos!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-16 md:py-24" style={{ backgroundColor: '#f8fafc' }}>
            <div className="container px-6 mx-auto max-w-lg">
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="nombre"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '13px', fontWeight: '500' }}>Nombre Completo *</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Tu nombre y apellido" 
                                            {...field} 
                                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors h-11 text-sm"
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-900">Email</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="email" 
                                                placeholder="tu@email.com" 
                                                {...field} 
                                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors h-12"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="telefono"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-900">Teléfono</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="+54 9..." 
                                                {...field} 
                                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors h-12"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="asistencia"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-gray-900">¿Vas a asistir? *</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col sm:flex-row gap-4"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex-1 transition-colors">
                                                <FormControl>
                                                    <RadioGroupItem value="CONFIRMA" />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer flex-1">
                                                    Sí, confirmo
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex-1 transition-colors">
                                                <FormControl>
                                                    <RadioGroupItem value="NO_ASISTE" />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer flex-1">
                                                    No puedo asistir
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="numeroAcompanantes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-900">Número de Acompañantes</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="10"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors h-12"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button 
                            type="submit" 
                            className="w-full h-11 text-sm rounded-full" 
                            size="lg" 
                            disabled={isSubmitting}
                            style={{ 
                                backgroundColor: 'var(--color-primary)',
                                color: '#fff',
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: '500',
                                letterSpacing: '0.05em'
                            }}
                        >
                            {isSubmitting ? 'Enviando...' : 'Confirmar Asistencia'}
                        </Button>
                    </form>
                </Form>
                </div>
            </div>
        </div>
    );
}
