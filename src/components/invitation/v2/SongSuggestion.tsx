"use client";

import { useEffect, useRef, useState } from "react";
import { SectionWrapper } from "./SectionWrapper";

interface SongItem {
  id: string;
  title: string;
  artist: string;
  guestName: string;
  votes: number;
  status: "PENDING" | "APPROVED" | "HIDDEN";
}

interface SongSuggestionProps {
  invitationId: string;
  guestToken?: string;
  guestName?: string;
  dark?: boolean;
  showPublicList?: boolean; // el anfitrión puede ocultarla
  kicker?: string;
  title?: string;
}

export function SongSuggestion({
  invitationId,
  guestToken,
  guestName = "Invitado",
  dark = true,
  showPublicList = true,
  kicker = "Sugerí una canción",
  title = "Que no falte en la pista",
}: SongSuggestionProps) {
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [artistValue, setArtistValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar canciones aprobadas
  useEffect(() => {
    if (!showPublicList) return;
    fetch(`/api/songs?invitationId=${invitationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSongs(data);
      })
      .catch(() => {});
  }, [invitationId, showPublicList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title_val = inputValue.trim();
    const artist_val = artistValue.trim();
    if (!title_val) { setError("Escribí el nombre de la canción"); return; }
    if (!artist_val) { setError("Escribí el artista"); return; }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          title: title_val,
          artist: artist_val,
          guestToken,
          guestName,
        }),
      });
      if (!res.ok) throw new Error("Error al enviar");
      setSubmitted(true);
      setInputValue("");
      setArtistValue("");
      // Refrescar lista
      const data = await fetch(`/api/songs?invitationId=${invitationId}`).then((r) => r.json());
      if (Array.isArray(data)) setSongs(data);
    } catch {
      setError("No se pudo enviar. Intentá de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (id: string) => {
    if (votedIds.has(id)) return;
    setVotedIds((prev) => new Set(prev).add(id));
    // Optimistic update
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, votes: s.votes + 1 } : s))
    );
    try {
      await fetch(`/api/songs/${id}/vote`, { method: "PATCH" });
    } catch {
      // Revert si falla
      setSongs((prev) =>
        prev.map((s) => (s.id === id ? { ...s, votes: s.votes - 1 } : s))
      );
      setVotedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <SectionWrapper dark={dark} id="songs">
      <p className="t-kicker">{kicker}</p>
      <h2>{title}</h2>
      <p style={{ marginBottom: "var(--sp-5)" }}>
        Dejanos el tema que no puede faltar esa noche.
      </p>

      {/* Formulario */}
      {!submitted ? (
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
            <div className="mod-input-row">
              <input
                ref={inputRef}
                type="text"
                placeholder="Nombre de la canción"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                maxLength={100}
                aria-label="Nombre de la canción"
                style={{ flex: 2, padding: "12px 14px", borderRadius: "var(--radius-s)", border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.1)", color: "var(--on-ink)" }}
              />
              <input
                type="text"
                placeholder="Artista"
                value={artistValue}
                onChange={(e) => setArtistValue(e.target.value)}
                maxLength={80}
                aria-label="Artista"
                style={{ flex: 1, padding: "12px 14px", borderRadius: "var(--radius-s)", border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.1)", color: "var(--on-ink)" }}
              />
            </div>
            {error && (
              <p role="alert" style={{ color: "var(--c-accent)", fontSize: "12px", margin: 0 }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="t-btn"
              disabled={isSubmitting}
              style={{ background: "var(--t-onpaper)", color: "var(--t-paper)", border: "none", width: "fit-content", padding: "10px 24px", marginTop: "8px", alignSelf: "flex-start" }}
            >
              {isSubmitting ? "Enviando…" : "Enviar sugerencia"}
            </button>
          </div>
        </form>
      ) : (
        <div
          style={{
            padding: "var(--sp-4)",
            background: "rgba(255,255,255,.07)",
            borderRadius: "var(--radius-s)",
            marginBottom: "var(--sp-4)",
            fontSize: "13px",
          }}
          role="status"
        >
          ✓ ¡Gracias! Tu canción fue enviada.{" "}
          <button
            onClick={() => setSubmitted(false)}
            style={{ background: "none", border: "none", color: "var(--c-accent)", cursor: "pointer", fontSize: "inherit", padding: 0, textDecoration: "underline" }}
          >
            Sugerir otra
          </button>
        </div>
      )}

      {/* Lista pública */}
      {showPublicList && songs.length > 0 && (
        <div className="mod-list">
          {songs
            .sort((a, b) => b.votes - a.votes)
            .slice(0, 10)
            .map((song) => {
              const alreadyVoted = votedIds.has(song.id);
              return (
                <div key={song.id} className="mod-item">
                  <div className="meta" style={{ flex: 1, minWidth: 0, paddingRight: 8, color: "var(--t-onpaper)" }}>
                    <b style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block", color: "var(--t-onpaper)" }}>
                      {song.title}
                    </b>
                    <span style={{ color: "var(--t-onpaper)", opacity: 0.8 }}>
                      {song.artist}
                      {song.guestName ? ` · sugerida por ${song.guestName}` : ""}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </SectionWrapper>
  );
}
