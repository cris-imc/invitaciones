"use client";

import { updateInvitationPlan } from "@/app/actions/admin";
import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/Toast";

export function AdminPlanSelect({ invitationId, currentPlan }: { invitationId: string, currentPlan: string }) {
    const [isPending, startTransition] = useTransition();
    const [plan, setPlan] = useState(currentPlan);
    const { showToast } = useToast();

    const handleUpdate = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPlan = e.target.value;
        setPlan(newPlan);
        startTransition(async () => {
            const res = await updateInvitationPlan(invitationId, newPlan);
            if (res.success) {
                showToast("Plan actualizado correctamente", "success");
            } else {
                showToast(res.error || "Error", "error");
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold opacity-70">Plan:</span>
            <select
                disabled={isPending}
                value={plan}
                onChange={handleUpdate}
                className="text-sm border rounded-lg px-2 py-1 bg-[var(--ink-2)] text-[var(--on-ink)] border-[var(--ink-2)] focus:ring-1 focus:ring-[var(--paper)]"
            >
                <option value="FREE">Gratis (20 inv)</option>
                <option value="PREMIUM">Premium (Ilimitado)</option>
                <option value="DIAMOND">Diamond (Ilimitado + LIVE)</option>
                <option value="ENTERPRISE">Enterprise</option>
            </select>
            {isPending && <span className="text-xs text-blue-500">Guardando...</span>}
        </div>
    );
}
