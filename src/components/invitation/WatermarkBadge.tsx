"use client";

import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface WatermarkBadgeProps {
  planTier: string;
}

export function WatermarkBadge({ planTier }: WatermarkBadgeProps) {
  // Only show watermark for FREE tier
  if (planTier !== "FREE") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Link href="/dashboard/subscription" className="group">
        <Badge 
          variant="secondary" 
          className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm group-hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5 mr-2 text-purple-500" />
          <span className="text-purple-700 font-medium">
            Creado con plan gratuito
          </span>
          <span className="ml-2 text-xs text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
            Actualizar →
          </span>
        </Badge>
      </Link>
    </div>
  );
}
