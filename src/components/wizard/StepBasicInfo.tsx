"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWizardStore } from "@/store/wizard-store";
import { basicInfoSchema } from "@/lib/schemas/invitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function StepBasicInfo() {
    const { data, setData, nextStep, prevStep } = useWizardStore();

    const form = useForm<z.infer<typeof basicInfoSchema>>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: {
            nombreEvento: data.nombreEvento || "",
            fecha: data.fecha,
            nombreNovio: data.nombreNovio || "",
            nombreNovia: data.nombreNovia || "",
            nombreQuinceanera: data.nombreQuinceanera || "",
        },
    });

    function onSubmit(values: z.infer<typeof basicInfoSchema>) {
        setData(values);
        nextStep();
    }

    const tipo = data.type;

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Información Básica</h2>
                <p className="text-muted-foreground">Contanos los detalles principales del evento.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="nombreEvento"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Título de la Invitación</FormLabel>
                                <FormControl>
                                    <Input placeholder={
                                        tipo === 'CASAMIENTO' ? "Ej: Nuestra Boda" :
                                            tipo === 'QUINCE_ANOS' ? "Ej: Mis 15 Años" :
                                                "Ej: Mi Cumpleaños, Mi Bautismo, etc."
                                    } {...field} />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                    {tipo === 'QUINCE_ANOS'
                                        ? "Este es el título general de la invitación. Tu nombre lo ingresarás en el siguiente campo."
                                        : "Este es el título general que aparecerá en la invitación."}
                                </p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="fecha"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Fecha del Evento</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP", { locale: es })
                                                ) : (
                                                    <span>Selecciona una fecha</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date()
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {tipo === 'CASAMIENTO' && (
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nombreNovia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre Novia</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nombreNovio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre Novio</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {tipo === 'QUINCE_ANOS' && (
                        <FormField
                            control={form.control}
                            name="nombreQuinceanera"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tu Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: María, Sofía, Valentina..." {...field} />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">
                                        Este nombre aparecerá destacado en la invitación.
                                    </p>
                                </FormItem>
                            )}
                        />
                    )}

                    {tipo !== 'CASAMIENTO' && tipo !== 'QUINCE_ANOS' && (
                        <FormField
                            control={form.control}
                            name="nombreQuinceanera"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Festejado/a (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nombre de la persona o empresa" {...field} />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">Si lo dejas vacío, se usará el nombre del evento.</p>
                                </FormItem>
                            )}
                        />
                    )}

                    <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={prevStep}>Atrás</Button>
                        <Button type="submit">Siguiente Paso</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
