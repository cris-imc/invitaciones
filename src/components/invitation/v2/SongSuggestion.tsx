"use client";

import { useEffect, useRef, useState } from "react";
import { Music } from "lucide-react";
import { SectionWrapper } from "./SectionWrapper";
import { DrawLucideIcon } from "@/components/ui/icons/DrawLucideIcon";

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
  hideHeader?: boolean;
  variant?: "default" | "moderno";
}

export function SongSuggestion({
  invitationId,
  guestToken,
  guestName = "Invitado",
  dark = true,
  showPublicList = true,
  kicker = "Sugerí una canción",
  title = "Que no falte en la pista",
  hideHeader = false,
  variant = "default",
}: SongSuggestionProps) {
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [inputValue, setInputValue] = useState(""); // For default title or moderno single input
  const [artistValue, setArtistValue] = useState(""); // For default artist
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar canciones aprobadas o sugeridas por el invitado
  useEffect(() => {
    if (!showPublicList) return;
    const url = guestToken 
      ? `/api/songs?invitationId=${invitationId}&guestToken=${guestToken}`
      : `/api/songs?invitationId=${invitationId}`;
    fetch(url)
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
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al enviar");
      }
      setSubmitted(true);
      setInputValue("");
      setArtistValue("");
      // Refrescar lista
      const url = guestToken 
        ? `/api/songs?invitationId=${invitationId}&guestToken=${guestToken}`
        : `/api/songs?invitationId=${invitationId}`;
      const data = await fetch(url).then((r) => r.json());
      if (Array.isArray(data)) setSongs(data);
    } catch (err: any) {
      setError(err.message || "No se pudo enviar. Intentá de nuevo.");
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
    <SectionWrapper dark={dark} id="songs" className={variant === "moderno" ? "bg-[var(--t-bg)] py-20 px-6 md:px-12 w-full" : ""}>
      <div className={variant === "moderno" ? "w-full max-w-[340px] sm:max-w-xl mx-auto text-left" : ""}>
        {!hideHeader && (
          <>
            <div className={variant === "moderno" ? "flex justify-center mb-6" : "t-kicker flex justify-center mb-6"} style={variant === "moderno" ? { color: "var(--t-acc)" } : undefined}>
              <DrawLucideIcon icon={Music} size={46} color="var(--t-acc)" strokeWidth={1.5} />
            </div>
            {variant === "moderno" ? (
              <p className="t-kicker text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--t-acc)] mb-6" style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif" }}>
                {kicker}
              </p>
            ) : (
              <>
                <p className="t-kicker">{kicker}</p>
                <h2>{title}</h2>
                <p style={{ marginBottom: "var(--sp-5)" }}>
                  Dejanos el tema que no puede faltar esa noche.
                </p>
              </>
            )}
          </>
        )}
        
        {hideHeader && (
          <>
            <div className="flex justify-center mb-6" style={{ color: variant === "moderno" ? "var(--t-acc)" : undefined }}>
              <DrawLucideIcon icon={Music} size={46} color="var(--t-acc)" strokeWidth={1.5} className={variant === "moderno" ? undefined : "t-kicker"} />
            </div>
            <p className={variant === "moderno" ? "t-kicker text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--t-acc)] mb-6" : "t-kicker"} style={{ fontFamily: "var(--font-body-custom, var(--font-inter)), sans-serif" }}>
              {kicker}
            </p>
          </>
        )}

        {/* Formulario */}
        {!submitted ? (
          <form onSubmit={handleSubmit} noValidate>
            {variant === "moderno" ? (
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 mb-4 w-full items-center">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Canción"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  maxLength={100}
                  className="w-full h-[46px] !m-0 bg-[var(--t-surface)] border border-[var(--t-acc)]/40 rounded-none px-4 text-sm text-[#FFFFFF] placeholder-[var(--t-muted)] focus:outline-none focus:border-[var(--t-acc)]/70 transition-colors"
                />
                <input
                  type="text"
                  placeholder="Artista"
                  value={artistValue}
                  onChange={(e) => setArtistValue(e.target.value)}
                  maxLength={80}
                  className="w-full h-[46px] !m-0 bg-[var(--t-surface)] border border-[var(--t-acc)]/40 rounded-none px-4 text-sm text-[#FFFFFF] placeholder-[var(--t-muted)] focus:outline-none focus:border-[var(--t-acc)]/70 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[46px] !m-0 flex items-center justify-center bg-[var(--t-acc)] text-[var(--t-bg)] font-semibold font-sans text-[11px] uppercase tracking-[0.1em] px-6 rounded-none hover:bg-[var(--t-acc)]/90 transition-colors whitespace-nowrap"
                >
                  {isSubmitting ? "..." : "ENVIAR"}
                </button>
              </div>
            ) : (
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
                <button
                  type="submit"
                  className="t-btn"
                  disabled={isSubmitting}
                  style={{ background: "var(--t-onpaper)", color: "var(--t-paper)", border: "none", width: "fit-content", padding: "10px 24px", marginTop: "8px", alignSelf: "flex-start" }}
                >
                  {isSubmitting ? "Enviando…" : "Enviar sugerencia"}
                </button>
              </div>
            )}
            
            {error && (
              <p role="alert" className={variant === "moderno" ? "text-red-400 text-xs mt-1 mb-4" : ""} style={variant === "moderno" ? {} : { color: "var(--c-accent)", fontSize: "12px", margin: 0 }}>
                {error}
              </p>
            )}
          </form>
        ) : (
          <div
            className={variant === "moderno" ? "bg-[var(--t-surface)] border border-[var(--t-acc)]/20 text-[var(--t-acc)] p-4 rounded-md mb-6 text-sm flex justify-between items-center" : ""}
            style={variant === "moderno" ? {} : {
              padding: "var(--sp-4)",
              background: "rgba(255,255,255,.07)",
              borderRadius: "var(--radius-s)",
              marginBottom: "var(--sp-4)",
              fontSize: "13px",
            }}
            role="status"
          >
            <span>✓ ¡Gracias! Tu canción fue enviada.</span>
            <button
              onClick={() => setSubmitted(false)}
              className={variant === "moderno" ? "text-white underline text-xs ml-4" : ""}
              style={variant === "moderno" ? {} : { background: "none", border: "none", color: "var(--c-accent)", cursor: "pointer", fontSize: "inherit", padding: 0, textDecoration: "underline" }}
            >
              Sugerir otra
            </button>
          </div>
        )}

        {/* Lista pública */}
        {showPublicList && songs.length > 0 && (
          <div className={variant === "moderno" ? "flex flex-col gap-3 mt-6" : "mod-list"}>
            {songs
              .sort((a, b) => b.votes - a.votes)
              .slice(0, 10)
              .map((song) => {
                const alreadyVoted = votedIds.has(song.id);
                return variant === "moderno" ? (
                  <div key={song.id} className="bg-[var(--t-surface)] border border-[var(--t-acc)]/10 rounded-md p-4 flex items-center justify-between">
                    <div className="flex flex-col flex-1 min-w-0 pr-4">
                      <b className="text-white font-sans text-base font-bold truncate">
                        {song.title}
                      </b>
                      <span className="text-[var(--t-muted)] font-sans text-sm truncate">
                        {song.artist}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleVote(song.id)}
                      disabled={alreadyVoted}
                      className={`flex items-center gap-2 border px-3 py-1.5 rounded-md font-sans text-sm transition-colors ${alreadyVoted ? "border-[var(--t-acc)]/40 text-[var(--t-acc)]/60 cursor-default" : "border-[var(--t-acc)] text-[var(--t-acc)] hover:bg-[var(--t-acc)]/10"}`}
                    >
                      <span>♥</span>
                      <span className="font-semibold">{song.votes}</span>
                    </button>
                  </div>
                ) : (
                  <div key={song.id} className="mod-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="meta" style={{ flex: 1, minWidth: 0, paddingRight: 8, color: "var(--t-onpaper)" }}>
                      <b style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block", color: "var(--t-onpaper)" }}>
                        {song.title}
                      </b>
                      <span style={{ color: "var(--t-onpaper)", opacity: 0.8 }}>
                        {song.artist}
                        {song.guestName ? ` · sugerida por ${song.guestName}` : ""}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleVote(song.id)}
                      disabled={alreadyVoted}
                      style={{ background: "transparent", border: "1px solid var(--t-onpaper)", color: "var(--t-onpaper)", padding: "4px 10px", borderRadius: "4px", cursor: alreadyVoted ? "default" : "pointer", opacity: alreadyVoted ? 0.6 : 1 }}
                    >
                      ♥ {song.votes}
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
