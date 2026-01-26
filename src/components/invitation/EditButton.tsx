"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditButtonProps {
    onClick: () => void;
    className?: string;
}

export function EditButton({ onClick, className = "" }: EditButtonProps) {
    return (
        <Button
            onClick={onClick}
            size="icon"
            variant="outline"
            className={`absolute top-2 right-2 z-30 h-8 w-8 bg-white/90 hover:bg-white shadow-md border-primary/20 ${className}`}
        >
            <Pencil className="h-4 w-4 text-primary" />
        </Button>
    );
}
