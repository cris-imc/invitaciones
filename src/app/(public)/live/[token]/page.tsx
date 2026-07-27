"use client";

import { useEffect, useState, useRef, use } from "react";
import { Camera, MessageSquare, Loader2 } from "lucide-react";

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

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [guestName, setGuestName] = useState("");
    const [hasName, setHasName] = useState(false);

    useEffect(() => {
        const storedName = localStorage.getItem("live_guest_name");
        if (storedName) {
            setGuestName(storedName);
            setHasName(true);
        }
    }, []);

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (guestName.trim()) {
            localStorage.setItem("live_guest_name", guestName.trim());
            setHasName(true);
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

            const res = await fetch(`/api/live/public/${token}/upload`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const newItem = await res.json();
                setItems(prev => [newItem, ...prev]);
            } else {
                alert("Error al subir la foto.");
            }
        } catch (error) {
            console.error(error);
            alert("Hubo un problema al procesar la foto.");
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
            } else {
                const data = await res.json();
                alert(data.error || "Error al enviar el mensaje.");
            }
        } catch (error) {
            console.error(error);
            alert("Error al enviar el mensaje.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin" /></div>;
    if (!session) return <div className="min-h-screen flex items-center justify-center bg-black text-white p-6 text-center">La sesión LIVE no existe o ha sido cerrada por el anfitrión.</div>;

    if (!hasName) {
        return (
            <div className="min-h-screen bg-[#050807] flex flex-col items-center justify-center p-6 text-center text-white">
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
                    <button
                        type="submit"
                        className="w-full bg-[#C79A4B] text-[#050807] font-semibold py-3 rounded-xl hover:bg-[#b08540] transition-colors"
                    >
                        Comenzar a Subir
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050807] text-[#F6F3EC] pb-24 font-sans">
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
                        <textarea
                            className="w-full bg-transparent text-white outline-none resize-none placeholder:text-white/30 text-sm"
                            rows={3}
                            placeholder="Escribe tu mensaje (máx 200 caracteres)..."
                            maxLength={200}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={uploading}
                        />
                        <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs ${message.length > 180 ? 'text-red-400' : 'text-white/40'}`}>
                                {message.length}/200
                            </span>
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
