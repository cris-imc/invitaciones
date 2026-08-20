"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { DeleteInvitationButton } from "@/components/dashboard/DeleteInvitationButton";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { getStripClass, getEventEmoji, getEventLabel, getDaysUntil } from "@/lib/invitation-card-helpers";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 6;

export function ClientInvitationsGrid({ invitations }: { invitations: any[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(invitations.length / ITEMS_PER_PAGE);
    const paginated = invitations.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginated.map((inv) => {
                    const confirmed = inv.guests.filter((g: any) => g.status === "CONFIRMED");
                    const people = confirmed.reduce((s: number, g: any) => s + g.attendingCount, 0);
                    const planLimit = PLAN_LIMITS[inv.planTier as keyof typeof PLAN_LIMITS]?.maxGuests;
                    const maxGuests = inv.maxGuestsOverride !== null ? inv.maxGuestsOverride : planLimit;
                    const maxGuestsStr = maxGuests === null ? "∞" : maxGuests.toString();

                    const daysUntil = getDaysUntil(inv.fechaEvento);
                    const daysLabel =
                        daysUntil > 0
                            ? `Faltan ${daysUntil} días`
                            : daysUntil === 0
                            ? "¡Hoy!"
                            : "Finalizado";

                    return (
                        <div className="m-inv-card" key={inv.id}>
                            {/* ── Colored strip ── */}
                            <div className={`m-card-strip ${getStripClass(inv.tipo)}`}>
                                <div className="m-card-strip-overlay" />
                                <span className="m-card-type">{getEventLabel(inv.tipo)}</span>
                                <span className="m-card-emoji">{getEventEmoji(inv.tipo)}</span>
                            </div>

                            {/* ── Card body ── */}
                            <div className="m-card-body">
                                {/* Event name */}
                                <p className="m-card-title">{inv.nombreEvento}</p>

                                {/* Meta: date + place */}
                                <div className="m-card-meta">
                                    <span className="m-meta-row">
                                        📅{" "}
                                        {new Date(inv.fechaEvento).toLocaleDateString("es-AR", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                    {inv.lugarNombre && (
                                        <span className="m-meta-row">🏰 {inv.lugarNombre}</span>
                                    )}
                                    {inv.direccion && (
                                        <span className="m-meta-row">📍 {inv.direccion}</span>
                                    )}
                                </div>

                                {/* Confirmed count */}
                                <div className="m-card-confirmed">
                                    <div className="m-card-confirmed-dot" />
                                    <span>
                                        {people} / {maxGuestsStr} confirmadas
                                    </span>
                                </div>

                                {/* Status tags */}
                                <div className="m-tags">
                                    <span className={`m-tag ${inv.estado === "ACTIVA" ? "active" : "draft"}`}>
                                        {inv.estado === "ACTIVA"
                                            ? "Activa"
                                            : inv.estado === "BORRADOR"
                                            ? "Borrador"
                                            : "Finalizada"}
                                    </span>
                                    <span
                                        className={`m-tag ${
                                            inv.planTier === "FREE"
                                                ? "free"
                                                : inv.planTier === "DIAMOND" || inv.planTier === "ENTERPRISE"
                                                ? "diamond"
                                                : "premium"
                                        }`}
                                    >
                                        {inv.planTier === "FREE"
                                            ? "Gratis"
                                            : inv.planTier === "DIAMOND"
                                            ? "◆ Diamond"
                                            : inv.planTier === "ENTERPRISE"
                                            ? "◆ Enterprise"
                                            : "✦ Premium"}
                                    </span>
                                    <span className="m-tag days">{daysLabel}</span>
                                </div>

                                {/* Actions */}
                                <div className="m-card-actions flex-col">
                                    <div className="flex items-center gap-2 w-full">
                                        <Link
                                            href={`/i/${inv.slug}`}
                                            target="_blank"
                                            className="m-btn-ghost flex-1 h-9"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Ver ejemplo
                                        </Link>
                                        <Link
                                            href={`/dashboard/invitaciones/${inv.slug}/guests`}
                                            className="bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] inline-flex items-center justify-center h-[40px] px-4 text-xs font-semibold rounded-lg transition-colors flex-1"
                                        >
                                            Administrar →
                                        </Link>
                                    </div>
                                    <div className="flex items-center justify-center w-full mt-2">
                                        <DeleteInvitationButton invitationId={inv.id} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </Button>
                    <span className="text-sm opacity-50">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                    </Button>
                </div>
            )}
        </>
    );
}
