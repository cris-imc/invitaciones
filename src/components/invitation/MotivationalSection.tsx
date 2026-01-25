"use client";

import { useState, useEffect } from "react";
import { QuizTrivia } from "./QuizTrivia";
import { ScrollReveal } from "./ScrollReveal";

const WEDDING_PHRASES = [
    "El amor es la única flor que crece sin necesidad de estaciones.",
    "Dos almas, un solo corazón.",
    "El amor verdadero nunca envejece.",
    "Hoy comienza para siempre.",
    "El amor es la aventura más grande.",
    "Juntos es nuestro lugar favorito.",
    "El amor es paciente, el amor es bondadoso.",
    "Donde hay amor, hay vida.",
    "El matrimonio es una promesa de amor eterno.",
    "Crecer juntos es el mejor viaje."
];

const QUINCEANERA_PHRASES = [
    "Hoy una princesa se convierte en reina.",
    "15 años de sueños, una vida de ilusiones.",
    "El mundo es tuyo, conquístalo con gracia.",
    "Brilla como la estrella que eres.",
    "Hoy celebramos tu transformación en mujer.",
    "Que tus sueños sean tan grandes como tu corazón.",
    "15 primaveras llenas de magia.",
    "Este es solo el comienzo de tu gran historia.",
    "Baila, sueña, vive tu momento.",
    "Hoy eres la protagonista de tu cuento de hadas."
];

const BIRTHDAY_PHRASES = [
    "La vida es una fiesta, gózala.",
    "Celebra cada día como si fuera el último.",
    "Hoy es un buen día para tener un gran día.",
    "Los mejores momentos son los que compartimos.",
    "Ríe, ama, sueña, vive.",
    "La felicidad es contagiosa, pásala.",
    "Haz de hoy una aventura increíble.",
    "Lo mejor está por venir.",
    "Cada año es un regalo, ábrelo con alegría.",
    "Baila como si nadie te estuviera viendo."
];

interface MotivationalSectionProps {
    triviaEnabled: boolean;
    triviaData?: any;
    eventType?: 'CASAMIENTO' | 'QUINCE_ANOS' | 'CUMPLEANOS' | 'ANIVERSARIO' | string;
}

export function MotivationalSection({ triviaEnabled, triviaData, eventType = 'CUMPLEANOS' }: MotivationalSectionProps) {
    const [phrase, setPhrase] = useState("");

    useEffect(() => {
        // Select phrase collection based on event type
        let phrases = BIRTHDAY_PHRASES; // Default for CUMPLEANOS/ANIVERSARIO

        if (eventType === 'CASAMIENTO') {
            phrases = WEDDING_PHRASES;
        } else if (eventType === 'QUINCE_ANOS') {
            phrases = QUINCEANERA_PHRASES;
        } else {
            // CUMPLEANOS, ANIVERSARIO, BAUTISMO, COMUNION, OTRO
            phrases = BIRTHDAY_PHRASES;
        }

        // Pick random phrase on mount (client-only to avoid hydration mismatch)
        const random = phrases[Math.floor(Math.random() * phrases.length)];
        setPhrase(random);
    }, [eventType]);

    return (
        <div className="space-y-12 py-16">
            {/* Random Motivational Phrase */}
            <ScrollReveal>
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto border-y-2 border-primary/20 py-12 px-6 relative">
                        {/* Decorative quotes */}
                        <div className="absolute top-0 left-0 -mt-6 ml-4 text-6xl text-primary/20 font-serif">“</div>
                        <div className="absolute bottom-0 right-0 -mb-10 mr-4 text-6xl text-primary/20 font-serif">”</div>

                        <p className="text-2xl md:text-4xl font-light italic leading-relaxed" style={{ fontFamily: "var(--font-serif)" }}>
                            {phrase}
                        </p>
                    </div>
                </div>
            </ScrollReveal>

            {/* Quiz Section */}
            {triviaEnabled && triviaData && (
                <div className="container mx-auto px-4">
                    <QuizTrivia
                        icono={triviaData.icono}
                        titulo={triviaData.titulo}
                        subtitulo={triviaData.subtitulo}
                        preguntas={triviaData.preguntas}
                    />
                </div>
            )}
        </div>
    );
}
