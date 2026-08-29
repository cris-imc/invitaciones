// Puente para "Habilitar funciones Premium/Diamond" sobre una invitación ya
// creada en plan Gratis (ver EventShareCard.tsx / UpgradePlanDialog.tsx):
// si el cliente no tiene crédito y paga con Mercado Pago, esa es una
// redirección dura -- se guarda acá qué invitación hay que convertir y con
// qué crédito, hasta que el pago se acredite y PendingInvitationUpgradeBridge
// (montado en el layout del dashboard) la convierta de verdad.
const KEY = "altainvitacion:pending-invitation-upgrade";

export interface PendingInvitationUpgrade {
    slug: string;
    desiredCredit: "PREMIUM" | "DIAMOND";
}

export function savePendingInvitationUpgrade(payload: PendingInvitationUpgrade): void {
    try {
        localStorage.setItem(KEY, JSON.stringify(payload));
    } catch {
        // Modo privado / cuota llena / localStorage deshabilitado: no es
        // crítico, en el peor caso el cliente repite la conversión a mano.
    }
}

export function loadAndClearPendingInvitationUpgrade(): PendingInvitationUpgrade | null {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        // Se borra ANTES de devolver el valor (no después de convertir la
        // invitación) para que un doble-mount en dev, o un refresh a mitad
        // del POST, nunca puedan disparar la conversión dos veces.
        localStorage.removeItem(KEY);
        return JSON.parse(raw);
    } catch {
        return null;
    }
}
