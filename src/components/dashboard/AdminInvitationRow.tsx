"use client";

import { toggleInvitationStatus, updateInvitationMaxGuests } from "@/app/actions/admin";
import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/input";
import { DeleteInvitationButton } from "./DeleteInvitationButton";

import { AdminPlanSelect } from "./AdminPlanSelect";

export function AdminInvitationRow({ invitation }: { invitation: any }) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState(invitation.estado);
    const [maxGuests, setMaxGuests] = useState(invitation.maxGuestsOverride || "");
    const { showToast } = useToast();

    const handleToggle = () => {
        startTransition(async () => {
            const res = await toggleInvitationStatus(invitation.id, status);
            if (res.success) {
                setStatus(res.newStatus);
                showToast(`Invitación ${res.newStatus === "ACTIVA" ? "activada" : "desactivada"}`, "success");
            } else {
                showToast(res.error || "Error", "error");
            }
        });
    };

    const handleUpdateMaxGuests = () => {
        startTransition(async () => {
            const val = maxGuests ? parseInt(maxGuests, 10) : null;
            const res = await updateInvitationMaxGuests(invitation.id, val);
            if (res.success) {
                showToast("Límite de invitados actualizado", "success");
            } else {
                showToast(res.error || "Error", "error");
            }
        });
    };

    return (
        <div className="flex flex-col gap-3 bg-black/20 border border-[var(--ink-2)] rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <strong className="block truncate text-lg" title={invitation.nombreEvento}>{invitation.nombreEvento}</strong>
                    <span className="text-xs opacity-60 truncate block">/{invitation.slug}</span>
                </div>
                <div className={`tag whitespace-nowrap shrink-0 ${status === "ACTIVA" ? "on" : "draft"}`}>
                    {status === "ACTIVA" ? "Activa" : status === "BORRADOR" ? "Borrador" : "Finalizada"}
                </div>
            </div>
            
            <div className="flex items-center justify-between gap-4 flex-wrap bg-black/10 p-2 rounded-lg">
                <div className="flex items-center gap-4 flex-wrap">
                    <AdminPlanSelect invitationId={invitation.id} currentPlan={invitation.planTier} />
                    
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold opacity-70">Invitados Max:</span>
                        <Input 
                            type="number" 
                            value={maxGuests}
                            onChange={(e) => setMaxGuests(e.target.value)}
                            placeholder="Ilimitado"
                            className="w-24 h-8 text-sm bg-[var(--ink)] border-none text-[var(--on-ink)] placeholder:text-white/30"
                        />
                    </div>
                    
                    <button 
                        disabled={isPending}
                        onClick={handleToggle}
                        className="text-sm font-semibold hover:underline opacity-80 hover:opacity-100"
                    >
                        {isPending ? "..." : status === "ACTIVA" ? "Desactivar" : "Activar"}
                    </button>
                    <DeleteInvitationButton invitationId={invitation.id} />
                </div>
                
                <button 
                    disabled={isPending || String(maxGuests) === String(invitation.maxGuestsOverride || "")}
                    onClick={handleUpdateMaxGuests}
                    className="text-sm font-semibold bg-accent text-ink px-4 py-1.5 rounded-full hover:bg-accent/90 transition-colors disabled:opacity-30 whitespace-nowrap ml-auto"
                >
                    Guardar
                </button>
            </div>
        </div>
    );
}
