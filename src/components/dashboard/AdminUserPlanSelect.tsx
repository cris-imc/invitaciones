"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

export function AdminUserPlanSelect({ userId, currentPlan }: { userId: string; currentPlan: string }) {
    const [plan, setPlan] = useState(currentPlan);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPlan = e.target.value;
        const previousPlan = plan;
        setPlan(newPlan);
        setIsSaving(true);
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planTier: newPlan }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Error al actualizar la membresía");
            }
            showToast("Membresía actualizada correctamente", "success");
            router.refresh();
        } catch (error) {
            setPlan(previousPlan);
            showToast(error instanceof Error ? error.message : "Error al actualizar la membresía", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs font-semibold opacity-70">Membresía:</span>
            <select
                disabled={isSaving}
                value={plan}
                onChange={handleChange}
                className="text-sm border rounded-lg px-2 py-1 bg-[var(--ink-2)] text-[var(--on-ink)] border-[var(--ink-2)] focus:ring-1 focus:ring-[var(--paper)]"
            >
                <option value="FREE">Gratis</option>
                <option value="PREMIUM">Premium</option>
                <option value="DIAMOND">Diamond</option>
                <option value="ENTERPRISE">Enterprise</option>
            </select>
            {isSaving && <span className="text-xs text-blue-400">Guardando...</span>}
        </div>
    );
}
