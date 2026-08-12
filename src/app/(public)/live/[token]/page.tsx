"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { Camera, MessageSquare, Loader2, Smile } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Checkbox } from "@/components/ui/checkbox";

import { LiveItem } from "@prisma/client";

export default function LiveUploadPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [session, setSession] = useState<any>(null);
    const [items, setItems] = useState<LiveItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    // Text message state
    const [message, setMessage] = useState("");
    const [showTextForm, setShowTextForm] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [guestName, setGuestName] = useState("");
    const [hasName, setHasName] = useState(false);
    const [errorModal, setErrorModal] = useState<string | null>(null);
    const [acceptedLiveTerms, setAcceptedLiveTerms] = useState(false);
    const [acceptingTerms, setAcceptingTerms] = useState(false);
    const [acceptanceId, setAcceptanceId] = useState<string | null>(null);

    useEffect(() => {
        // La clave incluye el token: sin esto, un mismo celular que escanea
        // el QR de LIVE de dos eventos distintos arrastraba el nombre
        // cargado en el primero al segundo. Solo se restaura la sesión si
        // también hay un acceptanceId guardado (aceptación ya registrada en
        // el servidor) -- si no, vuelve a pedir el check (ej. invitados que
        // ya tenían el nombre guardado de antes de que existiera este check).
        const storedName = localStorage.getItem(`live_guest_name_${token}`);
        const storedAcceptanceId = localStorage.getItem(`live_terms_acceptance_${token}`);
        if (storedName) setGuestName(storedName);
        if (storedName && storedAcceptanceId) {
            setAcceptanceId(storedAcceptanceId);
            setHasName(true);
        }
    }, [token]);

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestName.trim() || !acceptedLiveTerms || acceptingTerms) return;

        setAcceptingTerms(true);
        try {
            const res = await fetch(`/api/live/public/${token}/accept-terms`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ guestName: guestName.trim() }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.acceptanceId) {
                setErrorModal(data.error || "No pudimos registrar la aceptación de los Términos. Probá de nuevo.");
                return;
            }
            localStorage.setItem(`live_guest_name_${token}`, guestName.trim());
            localStorage.setItem(`live_terms_acceptance_${token}`, data.acceptanceId);
            setAcceptanceId(data.acceptanceId);
            setHasName(true);
        } catch {
            setErrorModal("No pudimos registrar la aceptación de los Términos. Probá de nuevo.");
        } finally {
            setAcceptingTerms(false);
        }
    };

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch(`/api/live/public/${token}`);
                if (res.ok) {
                    setSession(await res.json());
                } else {
                    setSession(false);
                }
            } catch {
                setSession(false);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [token]);

    useEffect(() => {
        if (!session) return;
        const fetchItems = async () => {
            try {
                const res = await fetch(`/api/live/public/${token}/items`);
                if (res.ok) {
                    setItems(await res.json());
                }
            } catch {}
        };
        fetchItems();
        const interval = setInterval(fetchItems, 5000);
        return () => clearInterval(interval);
    }, [session, token]);

    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Canvas to Blob failed"));
                }, "image/jpeg", 0.7);
            };
            img.onerror = (err) => reject(err);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const compressedBlob = await compressImage(file);
            const formData = new FormData();
            formData.append("file", compressedBlob, "photo.jpg");
            formData.append("type", "PHOTO");
            if (guestName) formData.append("guestName", guestName);
            if (acceptanceId) formData.append("acceptanceId", acceptanceId);

            const res = await fetch(`/api/live/public/${token}/upload`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const newItem = await res.json();
                setItems(prev => [newItem, ...prev]);
            } else if (res.status === 404) {
                setErrorModal("El LIVE ha sido desactivado por el anfitrión.");
            } else {
                setErrorModal("Error al subir la foto.");
            }
        } catch (error) {
            console.error(error);
            setErrorModal("Hubo un problema al procesar la foto.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("type", "TEXT");
        formData.append("message", message);
        if (guestName) formData.append("guestName", guestName);
        if (acceptanceId) formData.append("acceptanceId", acceptanceId);
        
        try {
            const res = await fetch(`/api/live/public/${token}/upload`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const newItem = await res.json();
                setItems(prev => [newItem, ...prev]);
                setMessage("");
                setShowTextForm(false);
            } else if (res.status === 404) {
                setErrorModal("El LIVE ha sido desactivado por el anfitrión.");
            } else {
                const data = await res.json().catch(() => ({}));
                setErrorModal(data.error || "Error al enviar el mensaje.");
            }
        } catch (error) {
            console.error(error);
            setErrorModal("Error al enviar el mensaje.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="min-h-dvh flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin" /></div>;
    if (!session) return <div className="min-h-dvh flex items-center justify-center bg-black text-white p-6 text-center">La sesión LIVE no existe o ha sido cerrada por el anfitrión.</div>;

    if (!hasName) {
        return (
            <div className="min-h-dvh bg-[#050807] flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="w-16 h-16 rounded-full bg-[#182420] border border-[#F6F3EC]/10 flex items-center justify-center mb-6">
                    <Camera className="w-8 h-8 text-[#C79A4B]" />
                </div>
                <h1 className="text-2xl font-serif mb-2">¡Bienvenido al LIVE!</h1>
                <p className="opacity-70 text-sm mb-8 max-w-xs">Tus fotos y audios aparecerán en vivo en la pantalla gigante de la fiesta.</p>
                <form onSubmit={handleNameSubmit} className="w-full max-w-sm flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="¿Cómo te llamas?"
                        className="w-full bg-[#0F1613] border border-[#F6F3EC]/20 rounded-xl px-4 py-3 outline-none focus:border-[#C79A4B] transition-colors"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                    />
                    <label className="flex items-start gap-2.5 text-left cursor-pointer">
                        <Checkbox
                            checked={acceptedLiveTerms}
                            onCheckedChange={(checked) => setAcceptedLiveTerms(Boolean(checked))}
                            className="mt-0.5 border-[#F6F3EC]/30 data-[state=checked]:bg-[#C79A4B] data-[state=checked]:border-[#C79A4B] data-[state=checked]:text-[#050807]"
                        />
                        <span className="text-xs opacity-70 leading-snug">
                            Acepto los{" "}
                            <Link
                                href="/terminos-live"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#C79A4B] hover:underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Términos y Condiciones
                            </Link>{" "}
                            del servicio LIVE
                        </span>
                    </label>
                    {errorModal && (
                        <p className="text-red-400 text-xs -mt-1">{errorModal}</p>
                    )}
                    <button
                        type="submit"
                        disabled={!acceptedLiveTerms || acceptingTerms}
                        className="w-full bg-[#C79A4B] text-[#050807] font-semibold py-3 rounded-xl hover:bg-[#b08540] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#C79A4B]"
                    >
                        {acceptingTerms ? "Verificando..." : "Comenzar a Subir"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-[#050807] text-[#F6F3EC] pb-24 font-sans">
            {errorModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#182420] border border-white/10 rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl">
                        <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Aviso</h3>
                        <p className="text-sm text-white/70 mb-6">{errorModal}</p>
                        <button
                            onClick={() => {
                                setErrorModal(null);
                                if (errorModal.includes("desactivado")) {
                                    setSession(false);
                                }
                            }}
                            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 font-semibold text-white transition-colors"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="sticky top-0 bg-[#050807]/90 backdrop-blur-md border-b border-[#F6F3EC]/10 p-4 z-10 text-center">
                <h1 className="font-serif text-xl text-[#C79A4B]">Comparte un Momento</h1>
                <p className="text-xs opacity-60 mt-1">Sube fotos o escribe mensajes cortos</p>
            </div>

            <div className="w-full max-w-sm flex flex-col gap-4 mx-auto mt-8 px-4">
                <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || showTextForm}
                    className="w-full bg-[#C79A4B] text-black font-semibold rounded-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="animate-spin w-5 h-5" /> : <Camera className="w-5 h-5" />}
                    {uploading ? "Subiendo..." : "Sacar Foto"}
                </button>

                {!showTextForm ? (
                    <button 
                        onClick={() => setShowTextForm(true)}
                        disabled={uploading}
                        className="w-full bg-transparent border border-white/20 text-white font-semibold rounded-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <MessageSquare className="w-5 h-5" /> Escribir un Mensaje
                    </button>
                ) : (
                    <form onSubmit={sendMessage} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-3">
                        <div className="relative">
                            <textarea
                                className="w-full bg-transparent text-white outline-none resize-none placeholder:text-white/30 text-sm"
                                rows={3}
                                placeholder="Escribe tu mensaje (máx 200 caracteres)..."
                                maxLength={200}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={uploading}
                            />
                            {showEmojiPicker && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEmojiPicker(false)} />
                                    <div className="relative w-full max-w-[320px] shadow-2xl rounded-2xl overflow-hidden border border-white/10">
                                        <EmojiPicker
                                            theme={Theme.DARK}
                                            width="100%"
                                            height={400}
                                            searchDisabled={true}
                                            skinTonesDisabled={true}
                                            onEmojiClick={(emojiData) => {
                                                setMessage(prev => (prev + emojiData.emoji).slice(0, 200));
                                                setShowEmojiPicker(false);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="text-white/60 hover:text-white transition-colors"
                                >
                                    <Smile className="w-5 h-5" />
                                </button>
                                <span className={`text-xs ${message.length > 180 ? 'text-red-400' : 'text-white/40'}`}>
                                    {message.length}/200
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowTextForm(false)}
                                    className="px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/20"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading || !message.trim()}
                                    className="px-4 py-2 rounded-full text-xs font-semibold bg-[#C79A4B] text-black disabled:opacity-50"
                                >
                                    {uploading ? "Enviando..." : "Enviar"}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>

            <div className="w-full max-w-sm mx-auto mt-12 px-4">
                <p className="text-xs uppercase tracking-widest text-white/40 mb-4 text-center">Últimas Subidas</p>
                {items.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                        {items.slice(0, 9).map(item => (
                            <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10">
                                {item.type === "PHOTO" ? (
                                    <img src={item.fileUrl} alt="Live" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-indigo-400 bg-indigo-900/20 p-2">
                                        <MessageSquare className="w-4 h-4 mb-1 opacity-50" />
                                        <p className="text-[8px] text-center line-clamp-3 text-white/70 px-1 leading-tight">{item.fileUrl}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-white/30 text-sm">Aún no hay fotos ni audios.</p>
                )}
            </div>
        </div>
    );
}
