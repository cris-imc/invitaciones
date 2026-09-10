"use client";

import { WizardSteps } from "@/components/wizard/WizardSteps";
import { useWizardStore } from "@/store/wizard-store";
import { useEffect, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { esCodigoPais } from "@/lib/paises";
import { paisDelVisitanteEnCliente, recordarPaisDelVisitante } from "@/lib/pais-visitante";
import { PreferenciasUsuario } from "@/components/dashboard/PreferenciasUsuario";

// Sincroniza el store con la elección gratis/premium/diamond hecha en el
// modal de NewInvitationButton, leída de la URL en vez de confiar en el
// estado que haya quedado en memoria del wizard-store (evita "premium"
// pegado de una invitación anterior si se navega directo a esta página).
//
// Y siembra el país del anfitrión. Sin esto el paso de datos bancarios pedía
// CBU y Alias a todo el mundo, pero al guardar la invitación quedaba con el
// país del perfil: alguien de México cargaba campos argentinos en una
// invitación mexicana. El país se pide una sola vez, al registrarse, y de acá
// en más viaja solo.
function WizardBootstrap() {
    const { reset, setUsePremiumCredit, setUseDiamondCredit, setData } = useWizardStore();
    const searchParams = useSearchParams();
    const premiumParam = searchParams.get("premium");
    const diamondParam = searchParams.get("diamond");
    const [listo, setListo] = useState(false);

    useEffect(() => {
        reset();
        setUsePremiumCredit(premiumParam === "1");
        setUseDiamondCredit(diamondParam === "1");
        setListo(true);
    }, [reset, setUsePremiumCredit, setUseDiamondCredit, premiumParam, diamondParam]);

    // Después del reset y no antes: reset() vacía el store y borraría el país.
    useEffect(() => {
        if (!listo) return;
        let vigente = true;
        fetch("/api/user/pais")
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => {
                if (!vigente) return;
                if (esCodigoPais(j?.pais)) {
                    setData({ pais: j.pais });
                    return;
                }
                // Sin cuenta -- alguien que entró por "Empezar gratis" sin
                // registrarse -- el país sale de dónde está mirando. Sin esto
                // un colombiano armaba toda su invitación en formato argentino
                // y recién al final le pedían un CBU que no tiene.
                aplicarPaisDelVisitante();
            })
            .catch(() => {
                // Idem: si la consulta falla, al menos el país del visitante.
                if (vigente) aplicarPaisDelVisitante();
            });

        function aplicarPaisDelVisitante() {
            const detectado = paisDelVisitanteEnCliente();
            if (!detectado) return;
            setData({ pais: detectado });
            // Se deja registrado además de usarlo: los precios y los medios de
            // pago se resuelven en el SERVIDOR, y sin la cookie la próxima
            // página seguiría mostrando pesos argentinos a un colombiano que
            // entró directo al wizard sin pasar por la landing.
            recordarPaisDelVisitante(detectado);
        }
        return () => {
            vigente = false;
        };
    }, [listo, setData]);

    return null;
}

export default function CrearInvitacionPage() {
    return (
        <div className="wiz-page">
            <Suspense fallback={null}>
                <WizardBootstrap />
            </Suspense>
            <div className="flex justify-end mb-3">
                <PreferenciasUsuario />
            </div>
            <WizardSteps />
        </div>
    );
}
