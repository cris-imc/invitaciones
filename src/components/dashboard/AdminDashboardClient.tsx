"use client";

import { useState } from "react";
import { AdminInvitationRow } from "@/components/dashboard/AdminInvitationRow";
import { DeleteUserButton } from "@/components/dashboard/DeleteUserButton";
import { EditCreditsButton } from "@/components/dashboard/EditCreditsButton";
import { EditUserButton } from "@/components/dashboard/EditUserButton";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminDashboardClient({ clients }: { clients: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedClients, setExpandedClients] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    let filteredClients = clients.filter(c => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort alphabetically by name
    filteredClients.sort((a, b) => {
        const nameA = a.name?.toLowerCase() || "";
        const nameB = b.name?.toLowerCase() || "";
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });

    const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
    const paginatedClients = filteredClients.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const toggleClient = (clientId: string) => {
        setExpandedClients(prev => 
            prev.includes(clientId) 
                ? prev.filter(id => id !== clientId) 
                : [...prev, clientId]
        );
    };

    return (
        <div>
            {/* Buscador */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <Input 
                    type="text"
                    placeholder="Buscar cliente por nombre o email..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10 h-12 w-full bg-[var(--ink-2)] border-none text-[var(--on-ink)] placeholder:text-white/30 rounded-xl"
                />
            </div>

            <div className="flex flex-col gap-4">
                {paginatedClients.map(client => {
                    const isExpanded = expandedClients.includes(client.id);
                    return (
                        <div key={client.id} className="bg-[var(--ink)]/50 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-[var(--ink-2)] text-[var(--on-ink)] transition-all">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div 
                                    className="flex items-center gap-2 cursor-pointer flex-1"
                                    onClick={() => toggleClient(client.id)}
                                >
                                    <div className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                        {isExpanded ? <ChevronUp className="w-5 h-5 opacity-70" /> : <ChevronDown className="w-5 h-5 opacity-70" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl leading-none">
                                            {client.name}
                                        </h3>
                                        <span className="text-sm opacity-50 font-normal">{client.email}</span>
                                    </div>
                                    <div className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-[10px] font-medium opacity-70">
                                        {client.invitations.length} invitaciones
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 items-center flex-wrap">
                                    <EditUserButton userId={client.id} initialName={client.name || ""} initialEmail={client.email || ""} />
                                    <EditCreditsButton userId={client.id} currentCredits={client.premiumCredits || 0} />
                                    <DeleteUserButton userId={client.id} userName={client.name} />
                                </div>
                            </div>
                            
                            {isExpanded && (
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    {client.invitations.length === 0 ? (
                                        <p className="text-sm opacity-40">No tiene invitaciones creadas.</p>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {client.invitations.map((inv: any) => (
                                                <AdminInvitationRow key={inv.id} invitation={inv} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredClients.length === 0 && (
                    <div className="text-center p-10 opacity-50">
                        No se encontraron clientes con "{searchTerm}".
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
