"use client";

import Link from "next/link";
import { HelpCircle, MessageCircle, CircleHelp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const WHATSAPP_HELP_URL = "https://wa.me/5493517660000?text=Hola%2C%20necesito%20ayuda%20con%20Alta%20Invitaci%C3%B3n";

function HelpMenuItems() {
    return (
        <div className="flex flex-col gap-0.5">
            <a
                href={WHATSAPP_HELP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-[var(--popover-foreground)]/80 hover:bg-white/5 hover:text-[var(--popover-foreground)] transition-colors"
            >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
            </a>
            <Link
                href="/dashboard/faq"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-[var(--popover-foreground)]/80 hover:bg-white/5 hover:text-[var(--popover-foreground)] transition-colors"
            >
                <CircleHelp className="w-4 h-4" />
                Preguntas frecuentes
            </Link>
        </div>
    );
}

// Antes "Ayuda" era un link directo a WhatsApp -- ahora despliega un mini
// menú con WhatsApp + Preguntas frecuentes (/dashboard/faq). Dos variantes
// porque el trigger vive en dos lugares con estilos muy distintos: el nav
// lateral desktop (clase .p-nav, ver globals.css) y la topbar mobile.
export function HelpMenu({ variant }: { variant: "desktop" | "mobile" }) {
    if (variant === "desktop") {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <button type="button" className="nav-btn">
                        <b><HelpCircle className="w-4 h-4" /></b>
                        Ayuda
                    </button>
                </PopoverTrigger>
                <PopoverContent side="right" align="end" className="w-56 p-1.5">
                    <HelpMenuItems />
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label="Ayuda"
                    style={{ color: "var(--accent)" }}
                    className="flex items-center gap-1.5 text-xs font-semibold font-ui"
                >
                    <MessageCircle className="w-5 h-5" />
                    <span>Ayuda</span>
                </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-56 p-1.5">
                <HelpMenuItems />
            </PopoverContent>
        </Popover>
    );
}
