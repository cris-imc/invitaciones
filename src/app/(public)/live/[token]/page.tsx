"use client";

import { useEffect, useState, useRef, use } from "react";
import { Camera, Mic, Loader2, StopCircle } from "lucide-react";

import { LiveItem } from "@prisma/client";

export default function LiveUploadPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [session, setSession] = useState<any>(null);
    const [items, setItems] = useState<LiveItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    const timerInterval = useRef<NodeJS.Timeout | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            audioChunks.current = [];
            
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunks.current.push(e.data);
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
                stream.getTracks().forEach(track => track.stop()); // Apagar micrófono

                setUploading(true);
                const formData = new FormData();
                formData.append("file", audioBlob, "audio.webm");
                formData.append("type", "AUDIO");
                
                try {
                    const res = await fetch(`/api/live/public/${token}/upload`, {
                        method: "POST",
                        body: formData,
                    });

                    if (res.ok) {
                        const newItem = await res.json();
                        setItems(prev => [newItem, ...prev]);
                    } else {
                        alert("Error al subir el audio.");
                    }
                } catch (error) {
                    console.error(error);
                    alert("Error al subir el audio.");
                } finally {
                    setUploading(false);
                }
            };

            mediaRecorder.current = recorder;
            recorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            
            timerInterval.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 59) {
                        stopRecording();
                        return 60;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (error) {
            console.error(error);
            alert("No se pudo acceder al micrófono.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
            if (timerInterval.current) clearInterval(timerInterval.current);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin" /></div>;
    if (!session) return <div className="min-h-screen flex items-center justify-center bg-black text-white p-6 text-center">La sesión LIVE no existe o ha sido cerrada por el anfitrión.</div>;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center pt-12 pb-6 px-4">
            <div className="w-full max-w-sm text-center mb-8">
                <p className="text-xs tracking-widest text-[#C79A4B] uppercase mb-2">LIVE CAM</p>
                <h1 className="font-serif text-2xl font-bold mb-2">Capturá el Momento</h1>
                <p className="text-sm text-white/60">Todo lo que subas acá aparecerá en la pantalla gigante de la fiesta al instante.</p>
            </div>

            <div className="w-full max-w-sm flex flex-col gap-4">
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
                    disabled={uploading || isRecording}
                    className="w-full bg-[#C79A4B] text-black font-semibold rounded-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="animate-spin w-5 h-5" /> : <Camera className="w-5 h-5" />}
                    {uploading ? "Subiendo..." : "Sacar Foto"}
                </button>

                {!isRecording ? (
                    <button 
                        onClick={startRecording}
                        disabled={uploading}
                        className="w-full bg-transparent border border-white/20 text-white font-semibold rounded-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Mic className="w-5 h-5" /> Grabar un Mensaje
                    </button>
                ) : (
                    <button 
                        onClick={stopRecording}
                        className="w-full bg-red-500 text-white font-semibold rounded-full py-4 flex items-center justify-center gap-2 animate-pulse"
                    >
                        <StopCircle className="w-5 h-5" /> Detener ({recordingTime}s)
                    </button>
                )}
            </div>

            <div className="w-full max-w-sm mt-12">
                <p className="text-xs uppercase tracking-widest text-white/40 mb-4 text-center">Últimas Subidas</p>
                {items.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                        {items.slice(0, 9).map(item => (
                            <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10">
                                {item.type === "PHOTO" ? (
                                    <img src={item.fileUrl} alt="Live" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-indigo-400 bg-indigo-900/20">
                                        <Mic className="w-6 h-6" />
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
