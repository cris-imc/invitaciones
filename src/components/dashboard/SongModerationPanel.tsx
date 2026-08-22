"use client";

import { useState, useEffect } from "react";

interface Song {
  id: string;
  title: string;
  artist: string;
  guestName: string;
  votes: number;
  status: "PENDING" | "APPROVED" | "HIDDEN";
  createdAt: string;
}

interface SongModerationPanelProps {
  invitationId: string;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:  "#B98B3E",
  APPROVED: "#5a8a6e",
  HIDDEN:   "#ccc",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING:  "Pendiente",
  APPROVED: "Aprobada",
  HIDDEN:   "Oculta",
};

const PAGE_SIZE = 8;

export function SongModerationPanel({ invitationId }: SongModerationPanelProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "PENDING" | "APPROVED" | "HIDDEN">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // El admin llama con auth y ve todas
    fetch(`/api/songs?invitationId=${invitationId}&admin=true`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSongs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [invitationId]);

  const changeStatus = async (id: string, newStatus: "APPROVED" | "HIDDEN" | "PENDING") => {
    setUpdatingId(id);
    setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
    try {
      await fetch(`/api/songs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Revert
      setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, status: s.status } : s)));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExport = () => {
    const approved = songs.filter((s) => s.status === "APPROVED");
    if (approved.length === 0) { alert("No hay canciones aprobadas para exportar."); return; }
    
    // Create CSV content with BOM for Excel compatibility
    const header = "Canción;Artista;Votos;Sugerida por\n";
    const rows = approved.map(s => {
      // Escape quotes and fields with semicolons
      const escape = (str: string) => `"${str.replace(/"/g, '""')}"`;
      return `${escape(s.title)};${escape(s.artist)};${s.votes};${escape(s.guestName)}`;
    }).join("\n");
    
    const csvContent = "\uFEFF" + header + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "playlist-evento.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = (filter === "all" ? songs : songs.filter((s) => s.status === filter))
    .slice()
    .sort((a, b) => b.votes - a.votes);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return <div style={{ padding: "32px", textAlign: "center", color: "#888", fontSize: "13px" }}>Cargando sugerencias…</div>;
  }

  const pendingCount  = songs.filter((s) => s.status === "PENDING").length;
  const approvedCount = songs.filter((s) => s.status === "APPROVED").length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ fontSize: "13px", color: "#555" }}>
          <b>{approvedCount}</b> aprobadas · <b>{pendingCount}</b> pendientes de revisión
        </div>
        <button
          onClick={handleExport}
          style={{
            padding: "8px 16px",
            borderRadius: "999px",
            border: "none",
            background: "#10b981", // Excel green
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            minHeight: "44px",
          }}
          aria-label="Exportar lista de canciones para el DJ"
        >
          ↓ Exportar para DJ
        </button>
      </div>

      {/* Filtros */}
      <div 
        style={{ 
          display: "flex", 
          gap: "6px", 
          marginBottom: "16px", 
          overflowX: "auto", 
          scrollbarWidth: "none", 
          paddingBottom: "4px",
          WebkitOverflowScrolling: "touch", touchAction: "pan-x"
        }}
        className="no-scrollbar"
      >
        {(["all", "PENDING", "APPROVED", "HIDDEN"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "7px 13px",
              borderRadius: "999px",
              border: "1px solid #ddd",
              background: filter === f ? "#1a1a1a" : "#fff",
              color: filter === f ? "#fff" : "#555",
              fontSize: "11.5px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              minHeight: "44px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {f === "all" ? "Todas" : STATUS_LABEL[f]}
            {f === "PENDING" && pendingCount > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: "#B98B3E",
                  color: "#fff",
                  borderRadius: "999px",
                  padding: "1px 7px",
                  fontSize: "10px",
                }}
              >
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888", padding: "32px", fontSize: "13px" }}>
          {filter === "all" ? "Aún no hay sugerencias de canciones." : "No hay canciones en esta categoría."}
        </p>
      ) : (
        <div>
          {paginated.map((song) => (
              <div
                key={song.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid #f0f0f0",
                  gap: "10px",
                  opacity: song.status === "HIDDEN" ? 0.5 : 1,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: "13.5px", display: "block", marginBottom: 2 }}>{song.title}</b>
                  <span style={{ fontSize: "11px", color: "#888" }}>
                    {song.artist} · {song.guestName}
                    {song.votes > 0 && ` · ♥ ${song.votes}`}
                  </span>
                </div>

                {/* Estado badge */}
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: "999px",
                    background: `${STATUS_COLOR[song.status]}22`,
                    color: STATUS_COLOR[song.status],
                    flexShrink: 0,
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                  }}
                >
                  {STATUS_LABEL[song.status]}
                </span>

                {/* Acciones */}
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  {song.status !== "APPROVED" && (
                    <button
                      onClick={() => changeStatus(song.id, "APPROVED")}
                      disabled={updatingId === song.id}
                      style={{
                        border: "1px solid #5a8a6e",
                        background: "#fff",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        fontSize: "12px",
                        cursor: "pointer",
                        color: "#5a8a6e",
                        fontWeight: 600,
                        minHeight: "44px",
                        minWidth: "44px",
                      }}
                      aria-label={`Aprobar "${song.title}"`}
                    >
                      ✓
                    </button>
                  )}
                  {song.status !== "HIDDEN" && (
                    <button
                      onClick={() => changeStatus(song.id, "HIDDEN")}
                      disabled={updatingId === song.id}
                      style={{
                        border: "1px solid #ccc",
                        background: "#fff",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        fontSize: "12px",
                        cursor: "pointer",
                        color: "#999",
                        fontWeight: 600,
                        minHeight: "44px",
                        minWidth: "44px",
                      }}
                      aria-label={`Ocultar "${song.title}"`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  color: "#555",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: currentPage === 1 ? "default" : "pointer",
                  opacity: currentPage === 1 ? 0.4 : 1,
                  fontFamily: "var(--font-body)",
                  minHeight: "44px",
                }}
                aria-label="Página anterior"
              >
                ‹
              </button>
              <span style={{ fontSize: "12px", color: "#888", minWidth: "90px", textAlign: "center" }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  color: "#555",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: currentPage === totalPages ? "default" : "pointer",
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  fontFamily: "var(--font-body)",
                  minHeight: "44px",
                }}
                aria-label="Página siguiente"
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
