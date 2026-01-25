"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWizardStore } from "@/store/wizard-store";
import { eventTypeSchema } from "@/lib/schemas/invitation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarHeart, Crown, PartyPopper } from "lucide-react";

export function StepEventType() {
    const { data, setData, nextStep } = useWizardStore();

    const form = useForm<z.infer<typeof eventTypeSchema>>({
        resolver: zodResolver(eventTypeSchema),
        defaultValues: {
            type: data.type as any,
        },
    });

    function onSubmit(values: z.infer<typeof eventTypeSchema>) {
        setData(values);
        nextStep();
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">¿Qué tipo de evento estás organizando?</h2>
                <p className="text-muted-foreground">Elegí la categoría para ver las plantillas ideales.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                    >
                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="CASAMIENTO" className="peer sr-only" />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-between rounded-md bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer shadow-sm peer-data-[state=checked]:bg-primary/10 transition-all">
                                                <CalendarHeart className="mb-3 h-8 w-8 text-primary" />
                                                <span className="text-lg font-semibold">Casamiento</span>
                                            </FormLabel>
                                        </FormItem>

                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="QUINCE_ANOS" className="peer sr-only" />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-between rounded-md bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer shadow-sm peer-data-[state=checked]:bg-primary/10 transition-all">
                                                <Crown className="mb-3 h-8 w-8 text-pink-500" />
                                                <span className="text-lg font-semibold">15 Años</span>
                                            </FormLabel>
                                        </FormItem>

                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="CUMPLEANOS" className="peer sr-only" />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-between rounded-md bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer shadow-sm peer-data-[state=checked]:bg-primary/10 transition-all">
                                                <PartyPopper className="mb-3 h-8 w-8 text-yellow-500" />
                                                <span className="text-lg font-semibold">Cumpleaños</span>
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end">
                        <Button type="submit" size="lg">Siguiente Paso</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
