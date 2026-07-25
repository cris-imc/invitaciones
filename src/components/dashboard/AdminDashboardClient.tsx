"use client";

import { useState } from "react";
import { AdminInvitationRow } from "@/components/dashboard/AdminInvitationRow";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function AdminDashboardClient({ clients }: { clients: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredClients = clients.filter(c => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Buscador */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <Input 
                    type="text"
                    placeholder="Buscar cliente por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-white/30 rounded-xl"
                />
            </div>

            <div className="flex flex-col gap-4">
                {filteredClients.map(client => (
                    <div key={client.id} className="bg-[var(--ink)]/50 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-[var(--ink-2)] text-[var(--on-ink)]">
                        <h3 className="font-bold text-xl mb-1">
                            {client.name} <span className="text-sm opacity-50 font-normal">({client.email})</span>
                        </h3>
                        
                        {client.invitations.length === 0 ? (
                            <p className="text-sm opacity-40 mt-2">No tiene invitaciones creadas.</p>
                        ) : (
                            <div className="flex flex-col gap-2 mt-4">
                                {client.invitations.map((inv: any) => (
                                    <AdminInvitationRow key={inv.id} invitation={inv} />
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {filteredClients.length === 0 && (
                    <div className="text-center p-10 opacity-50">
                        No se encontraron clientes con "{searchTerm}".
                    </div>
                )}
            </div>
        </div>
    );
}
