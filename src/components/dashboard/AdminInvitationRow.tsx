"use client";

import { toggleInvitationStatus, updateInvitationMaxGuests } from "@/app/actions/admin";
import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/input";

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
        <div className="flex items-center justify-between bg-black/5 rounded-xl p-3 flex-wrap gap-4">
            <div>
                <strong className="block">{invitation.nombreEvento}</strong>
                <span className="text-xs opacity-60">/{invitation.slug}</span>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold opacity-70">Invitados Max:</span>
                    <Input 
                        type="number" 
                        value={maxGuests}
                        onChange={(e) => setMaxGuests(e.target.value)}
                        placeholder="Ilimitado"
                        className="w-24 h-8 text-sm"
                    />
                    <button 
                        disabled={isPending || maxGuests === (invitation.maxGuestsOverride || "")}
                        onClick={handleUpdateMaxGuests}
                        className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                        Guardar
                    </button>
                </div>

                <div className={`tag ${status === "ACTIVA" ? "on" : "draft"}`}>
                    {status === "ACTIVA" ? "Activa" : status === "BORRADOR" ? "Borrador" : "Finalizada"}
                </div>
                
                <button 
                    disabled={isPending}
                    onClick={handleToggle}
                    className="text-sm font-semibold hover:underline opacity-80 hover:opacity-100"
                >
                    {isPending ? "..." : status === "ACTIVA" ? "Desactivar" : "Activar"}
                </button>
            </div>
        </div>
    );
}
