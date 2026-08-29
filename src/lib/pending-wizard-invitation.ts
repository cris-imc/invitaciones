// Puente para dos flujos que necesitan sobrevivir a una redirección dura
// (Mercado Pago, o el login manual de "Empezar gratis"), en los que el
// estado en memoria del wizard-store no persiste:
// 1) Un visitante sin cuenta completa el wizard en
//    /dashboard/invitaciones/crear sin sesión y al tocar "Crear invitación"
//    se lo manda a /register a elegir plan y crear su cuenta.
// 2) Un cliente ya logueado, con su tarjeta Gratis ya usada, completa el
//    wizard para una invitación nueva -- al tocar "Crear invitación" choca
//    con el límite del plan Gratis, elige Premium/Diamond ahí mismo, y si no
//    tiene crédito se lo manda a pagar con Mercado Pago (ver
//    WizardPlanLimitDialog.tsx).
// En ambos casos se guarda acá, en localStorage, hasta que haya sesión (y
// crédito, si corresponde) para terminar de crear la invitación de verdad
// (ver PendingWizardInvitationBridge, montado en el layout del dashboard).
import type { InvitationFormData } from "@/lib/schemas/invitation";
import type { ThemeConfig } from "@/lib/theme-config";

const KEY = "altainvitacion:pending-wizard-invitation";

export interface PendingWizardInvitation {
    data: Partial<InvitationFormData>;
    themeConfig: ThemeConfig;
    // Con qué crédito hay que crear la invitación una vez que vuelva con
    // sesión -- undefined/"FREE" = sin crédito (plan Gratis). Nunca se infiere
    // del planTier de la cuenta: el registro con Premium/Diamond deja la
    // cuenta en FREE igual (ver /api/auth/register), la compra es de un
    // crédito, no de un plan de cuenta.
    desiredCredit?: "PREMIUM" | "DIAMOND";
}

export function savePendingWizardInvitation(payload: PendingWizardInvitation): void {
    try {
        localStorage.setItem(KEY, JSON.stringify(payload));
    } catch {
        // Modo privado / cuota llena / localStorage deshabilitado: no es
        // crítico, en el peor caso el usuario tiene que rehacer el wizard.
    }
}

// Llamado desde /register justo antes de mandar a pagar a Mercado Pago: la
// invitación ya se guardó como pendiente sin saber todavía qué plan se iba a
// elegir (eso se define recién en el paso 1 del registro) -- acá se completa
// ese dato sin tocar el resto del payload.
export function setPendingWizardDesiredCredit(desiredCredit: "PREMIUM" | "DIAMOND"): void {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return;
        const pending = JSON.parse(raw) as PendingWizardInvitation;
        localStorage.setItem(KEY, JSON.stringify({ ...pending, desiredCredit }));
    } catch {
        // Igual que arriba: no crítico.
    }
}

export function loadAndClearPendingWizardInvitation(): PendingWizardInvitation | null {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        // Se borra ANTES de devolver el valor (no después de crear la
        // invitación) para que un doble-mount en dev, o un refresh a mitad
        // del POST, nunca puedan disparar la creación dos veces.
        localStorage.removeItem(KEY);
        return JSON.parse(raw);
    } catch {
        return null;
    }
}
