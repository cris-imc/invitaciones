"use client";

import { useState } from "react";
import { Copy, Check, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventShareCardProps {
  slug: string;
  eventName: string;
}

export function EventShareCard({ slug, eventName }: EventShareCardProps) {
  const [copied, setCopied] = useState(false);

  const eventUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/i/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `¡Hola! Te invito a "${eventName}". Hacé clic en el link para ver la invitación y confirmar asistencia: ${eventUrl}`
  );

  const whatsappLink = `https://wa.me/?text=${whatsappMessage}`;

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-muted/50 border rounded-lg">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium mb-1">Enlace de la invitación</p>
        <a 
          href={eventUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline truncate block"
        >
          {eventUrl}
        </a>
      </div>
      
      <div className="flex gap-2 w-full md:w-auto">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopy}
          className="flex-1 md:flex-none gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          asChild
          className="flex-1 md:flex-none gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white border-none"
        >
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
