"use client";

import { useEffect, useState, Suspense } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { WizardSteps } from "@/components/wizard/WizardSteps";
import { useSearchParams } from "next/navigation";

function WizardContent({ invitation }: { invitation: any }) {
    const { setData, setStep, setDirty } = useWizardStore();
    const [isInitialized, setIsInitialized] = useState(false);
    const searchParams = useSearchParams();
    const initialStepParam = searchParams.get("step");

    useEffect(() => {
        if (invitation) {
            const temaColores = typeof invitation.temaColores === 'string'
                ? JSON.parse(invitation.temaColores)
                : invitation.temaColores;

            const galeriaPrincipalFotos = invitation.galeriaPrincipalFotos
                ? typeof invitation.galeriaPrincipalFotos === 'string'
                    ? JSON.parse(invitation.galeriaPrincipalFotos)
                    : invitation.galeriaPrincipalFotos
                : [];

            setData({
                id: invitation.id,
                planTier: invitation.planTier || "FREE",
                slug: invitation.slug,
                type: invitation.tipo,
                nombreEvento: invitation.nombreEvento,
                fecha: new Date(invitation.fechaEvento),
                hora: invitation.hora || "",
                ciudad: invitation.ciudad || "",
                nombreNovio: invitation.nombreNovio || "",
                nombreNovia: invitation.nombreNovia || "",
                nombreQuinceanera: invitation.nombreQuinceanera || "",

                lugarNombre: invitation.lugarNombre || "",
                direccion: invitation.direccion || "",
                mapUrl: invitation.mapUrl || "",

                // Ceremonia
                ceremoniaHabilitada: Boolean(invitation.ceremoniaHabilitada),
                ceremoniaTitulo: invitation.ceremoniaTitulo || "Ceremonia Religiosa / Civil",
                ceremoniaNombre: invitation.ceremoniaNombre || "",
                ceremoniaDireccion: invitation.ceremoniaDireccion || "",
                ceremoniaHora: invitation.ceremoniaHora || "",
                ceremoniaMapUrl: invitation.ceremoniaMapUrl || "",

                // Portada
                portadaHabilitada: invitation.portadaHabilitada ?? true,
                portadaKicker: invitation.portadaKicker || "",
                portadaTitulo: invitation.portadaTitulo || "",
                portadaMensaje: invitation.portadaMensaje || "",
                portadaTextoBoton: invitation.portadaTextoBoton || "",
                portadaImagenFondo: invitation.portadaImagenFondo || "",
                portadaImagenFondoDesktop: invitation.portadaImagenFondoDesktop || "",

                // Frase
                frasePersonalizadaHabilitada: Boolean(invitation.frasePersonalizadaHabilitada),
                frasePersonalizadaTexto: invitation.frasePersonalizadaTexto || "",

                // Regalo
                regaloHabilitado: Boolean(invitation.regaloHabilitado),
                regaloTitulo: invitation.regaloTitulo || "Regalo",
                regaloMensaje: invitation.regaloMensaje || "",
                regaloMostrarDatos: Boolean(invitation.regaloMostrarDatos),
                regaloCbu: invitation.regaloCbu || "",
                regaloAlias: invitation.regaloAlias || "",
                regaloBanco: invitation.regaloBanco || "",
                regaloTitular: invitation.regaloTitular || "",
                regaloMonto: invitation.regaloMonto || undefined,

                // Pago Tarjetas
                pagoTarjetaHabilitado: Boolean(invitation.pagoTarjetaHabilitado),
                pagoTarjetaTitulo: invitation.pagoTarjetaTitulo || "Pago de Tarjetas / Pases",
                pagoTarjetaMensaje: invitation.pagoTarjetaMensaje || "",
                pagoTarjetaMostrarDatos: Boolean(invitation.pagoTarjetaMostrarDatos),
                pagoTarjetaCbu: invitation.pagoTarjetaCbu || "",
                pagoTarjetaAlias: invitation.pagoTarjetaAlias || "",
                pagoTarjetaBanco: invitation.pagoTarjetaBanco || "",
                pagoTarjetaTitular: invitation.pagoTarjetaTitular || "",
                pagoTarjetaMonto: invitation.pagoTarjetaMonto || undefined,
                precioNino: invitation.precioNino || undefined,
                precioAdolescente: invitation.precioAdolescente || undefined,
                precioNinoHabilitado: invitation.precioNinoHabilitado ?? true,
                precioAdolescenteHabilitado: invitation.precioAdolescenteHabilitado ?? Boolean(invitation.precioAdolescente),

                // Cronograma
                cronogramaEventos: invitation.cronogramaEventos || "[]",

                // Galería & Música & Trivia
                galeriaPrincipalHabilitada: invitation.galeriaPrincipalHabilitada ?? true,
                galeriaPrincipalFotos,
                musicaHabilitada: Boolean(invitation.musicaHabilitada),
                sugerenciaMusicaHabilitada: invitation.sugerenciaMusicaHabilitada ?? true,
                musicaUrl: invitation.musicaUrl || "",
                triviaHabilitada: Boolean(invitation.triviaHabilitada),
                triviaPreguntas: invitation.triviaPreguntas || "",

                // Design
                templateTipo: invitation.templateTipo || "ORIGINAL",
                colorPrincipal: temaColores?.colorPrincipal || temaColores?.primaryColor || "#000000",
            });
            setDirty(false); // Reset dirtiness after loading from DB
            
            if (initialStepParam === 'design') {
                setStep(invitation.tipo === 'CASAMIENTO' ? 11 : 10);
            } else {
                setStep(0);
            }
            setIsInitialized(true);
        }
    }, [invitation, setData, setStep, setDirty]);

    if (!isInitialized) {
        return (
            <div className="p-12 text-center text-muted-foreground">
                Cargando datos de la invitación desde la base de datos...
            </div>
        );
    }

    return <WizardSteps />;
}

export function EditWizardContainer({ invitation }: { invitation: any }) {
    return (
        <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Cargando datos de la invitación desde la base de datos...</div>}>
            <WizardContent invitation={invitation} />
        </Suspense>
    );
}
