"use client";

import { useEffect, useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { WizardSteps } from "@/components/wizard/WizardSteps";

export function EditWizardContainer({ invitation }: { invitation: any }) {
    const { setData, setStep } = useWizardStore();
    const [isInitialized, setIsInitialized] = useState(false);

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

                // Cronograma
                cronogramaEventos: invitation.cronogramaEventos || "[]",

                // Galería & Música & Trivia
                galeriaPrincipalHabilitada: invitation.galeriaPrincipalHabilitada ?? true,
                galeriaPrincipalFotos,
                musicaHabilitada: Boolean(invitation.musicaHabilitada),
                musicaUrl: invitation.musicaUrl || "",
                triviaHabilitada: Boolean(invitation.triviaHabilitada),
                triviaPreguntas: invitation.triviaPreguntas || "",

                // Design
                templateTipo: invitation.templateTipo || "ORIGINAL",
                colorPrincipal: temaColores?.colorPrincipal || temaColores?.primaryColor || "#000000",
            });
            setStep(0);
            setIsInitialized(true);
        }
    }, [invitation, setData, setStep]);

    if (!isInitialized) {
        return (
            <div className="p-12 text-center text-muted-foreground">
                Cargando datos de la invitación desde la base de datos...
            </div>
        );
    }

    return <WizardSteps />;
}
