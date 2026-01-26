"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, PartyPopper } from "lucide-react";
import Confetti from 'react-confetti';

interface RSVPWizardProps {
    invitationId: string;
    eventType: string;
}

export function RSVPWizard({ invitationId, eventType }: RSVPWizardProps) {
    const [step, setStep] = useState(1);
    const [attending, setAttending] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [guestCount, setGuestCount] = useState(1);
    const [dietaryRestrictions, setDietaryRestrictions] = useState("");
    const [songRequest, setSongRequest] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const totalSteps = 4;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // TODO: Implement actual API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSubmitted(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        } catch (error) {
            console.error(error);
            alert("Error al enviar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const canGoToStep = (targetStep: number) => {
        if (targetStep === 2) return attending !== null;
        if (targetStep === 3) return name.length > 0;
        if (targetStep === 4) return true;
        return true;
    };

    const nextStep = () => {
        if (step < totalSteps && canGoToStep(step + 1)) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto"
            >
                {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
                
                <div 
                    className="p-12 rounded-3xl text-center shadow-2xl"
                    style={{ 
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, rgba(var(--color-primary-rgb), 0.7) 100%)',
                        color: 'var(--color-text-light)'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        <PartyPopper className="w-20 h-20 mx-auto mb-6" />
                    </motion.div>
                    
                    <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Parisienne', cursive" }}>
                        ¡Gracias por confirmar!
                    </h3>
                    <p className="text-lg opacity-90">
                        {attending === 'yes' 
                            ? 'Nos vemos pronto en el evento' 
                            : 'Entendemos que no puedas asistir'}
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress Indicator */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex flex-col items-center flex-1">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: step === s ? 1.2 : 1,
                                    backgroundColor: step >= s ? 'var(--color-primary)' : '#e5e7eb',
                                }}
                                className="w-10 h-10 rounded-full flex items-center justify-center mb-2 relative z-10"
                                style={{
                                    color: step >= s ? 'var(--color-text-light)' : '#9ca3af'
                                }}
                            >
                                {step > s ? <Check className="w-5 h-5" /> : s}
                            </motion.div>
                            <span className="text-xs text-center" style={{ color: 'var(--color-text-secondary)' }}>
                                {s === 1 ? 'Asistencia' : s === 2 ? 'Datos' : s === 3 ? 'Detalles' : 'Confirmar'}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                </div>
            </div>

            {/* Form Steps */}
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 min-h-[500px]">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-8"
                        >
                            <div className="text-center mb-12">
                                <h3 className="text-4xl mb-4" style={{ fontFamily: "'Parisienne', cursive", color: 'var(--color-primary)' }}>
                                    ¿Podrás acompañarnos?
                                </h3>
                                <p className="text-gray-600">Confirmá tu asistencia</p>
                            </div>

                            <RadioGroup value={attending || ""} onValueChange={setAttending} className="space-y-6">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`flex items-center space-x-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                                        attending === 'yes' 
                                            ? 'border-primary bg-primary/5' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setAttending('yes')}
                                >
                                    <RadioGroupItem value="yes" id="yes" />
                                    <Label htmlFor="yes" className="cursor-pointer text-xl flex-1">
                                        ✅ Sí, asistiré
                                    </Label>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`flex items-center space-x-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                                        attending === 'no' 
                                            ? 'border-primary bg-primary/5' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setAttending('no')}
                                >
                                    <RadioGroupItem value="no" id="no" />
                                    <Label htmlFor="no" className="cursor-pointer text-xl flex-1">
                                        😔 No podré asistir
                                    </Label>
                                </motion.div>
                            </RadioGroup>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-4xl mb-4" style={{ fontFamily: "'Parisienne', cursive", color: 'var(--color-primary)' }}>
                                    Tus datos
                                </h3>
                                <p className="text-gray-600">Para confirmar tu asistencia</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm uppercase tracking-wider text-gray-600">
                                    Nombre completo *
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Juan Pérez"
                                    className="h-14 text-lg rounded-xl border-2 focus:border-primary"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm uppercase tracking-wider text-gray-600">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="juan@ejemplo.com"
                                    className="h-14 text-lg rounded-xl border-2 focus:border-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm uppercase tracking-wider text-gray-600">
                                    Teléfono
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+54 9 11 1234-5678"
                                    className="h-14 text-lg rounded-xl border-2 focus:border-primary"
                                />
                            </div>

                            {attending === 'yes' && (
                                <div className="space-y-2 pt-4">
                                    <Label htmlFor="guests" className="text-sm uppercase tracking-wider text-gray-600">
                                        ¿Cuántas personas asistirán?
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                            className="w-12 h-12 rounded-full text-xl"
                                        >
                                            -
                                        </Button>
                                        <div className="flex-1 text-center">
                                            <span className="text-5xl font-light" style={{ fontFamily: "'Parisienne', cursive", color: 'var(--color-primary)' }}>
                                                {guestCount}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
                                            className="w-12 h-12 rounded-full text-xl"
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 3 && attending === 'yes' && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-4xl mb-4" style={{ fontFamily: "'Parisienne', cursive", color: 'var(--color-primary)' }}>
                                    Algunos detalles
                                </h3>
                                <p className="text-gray-600">Opcional pero nos ayuda mucho</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dietary" className="text-sm uppercase tracking-wider text-gray-600">
                                    Restricciones alimentarias
                                </Label>
                                <Textarea
                                    id="dietary"
                                    value={dietaryRestrictions}
                                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                                    placeholder="Vegetariano, celíaco, alergias..."
                                    className="min-h-[100px] rounded-xl border-2 focus:border-primary resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="song" className="text-sm uppercase tracking-wider text-gray-600">
                                    🎵 Pedí tu canción favorita
                                </Label>
                                <Input
                                    id="song"
                                    value={songRequest}
                                    onChange={(e) => setSongRequest(e.target.value)}
                                    placeholder="Artista - Canción"
                                    className="h-14 text-lg rounded-xl border-2 focus:border-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-sm uppercase tracking-wider text-gray-600">
                                    Mensaje para {eventType === 'CASAMIENTO' ? 'los novios' : eventType === 'QUINCE' ? 'la quinceañera' : 'el cumpleañero'}
                                </Label>
                                <Textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Dejanos tus deseos..."
                                    className="min-h-[120px] rounded-xl border-2 focus:border-primary resize-none"
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && attending === 'no' && (
                        <motion.div
                            key="step3-no"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-4xl mb-4" style={{ fontFamily: "'Parisienne', cursive", color: 'var(--color-primary)' }}>
                                    Nos gustaría saber de vos
                                </h3>
                                <p className="text-gray-600">Aunque no puedas acompañarnos</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message-no" className="text-sm uppercase tracking-wider text-gray-600">
                                    Dejanos un mensaje
                                </Label>
                                <Textarea
                                    id="message-no"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Te vamos a extrañar..."
                                    className="min-h-[200px] rounded-xl border-2 focus:border-primary resize-none"
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-8"
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-4xl mb-4" style={{ fontFamily: "'Parisienne', cursive", color: 'var(--color-primary)' }}>
                                    Confirmación
                                </h3>
                                <p className="text-gray-600">Revisá tus datos antes de enviar</p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                                <div className="flex justify-between border-b border-gray-200 pb-3">
                                    <span className="text-gray-600">Asistencia:</span>
                                    <span className="font-medium">
                                        {attending === 'yes' ? '✅ Sí asistiré' : '😔 No podré'}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 pb-3">
                                    <span className="text-gray-600">Nombre:</span>
                                    <span className="font-medium">{name}</span>
                                </div>
                                {email && (
                                    <div className="flex justify-between border-b border-gray-200 pb-3">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{email}</span>
                                    </div>
                                )}
                                {attending === 'yes' && (
                                    <div className="flex justify-between border-b border-gray-200 pb-3">
                                        <span className="text-gray-600">Personas:</span>
                                        <span className="font-medium">{guestCount}</span>
                                    </div>
                                )}
                                {dietaryRestrictions && (
                                    <div className="flex justify-between border-b border-gray-200 pb-3">
                                        <span className="text-gray-600">Restricciones:</span>
                                        <span className="font-medium text-right flex-1 ml-4">{dietaryRestrictions}</span>
                                    </div>
                                )}
                                {songRequest && (
                                    <div className="flex justify-between border-b border-gray-200 pb-3">
                                        <span className="text-gray-600">Canción:</span>
                                        <span className="font-medium">{songRequest}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={prevStep}
                        disabled={step === 1}
                        className="gap-2"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Anterior
                    </Button>

                    {step < totalSteps ? (
                        <Button
                            type="button"
                            onClick={nextStep}
                            disabled={!canGoToStep(step + 1)}
                            className="gap-2 px-8 py-6 rounded-full text-lg"
                            style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'var(--color-text-light)'
                            }}
                        >
                            Siguiente
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="gap-2 px-12 py-6 rounded-full text-lg"
                            style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'var(--color-text-light)'
                            }}
                        >
                            {isSubmitting ? 'Enviando...' : 'Confirmar'}
                            <Check className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
