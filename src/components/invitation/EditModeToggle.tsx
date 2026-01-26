"use client";

import { Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditMode } from "@/contexts/EditModeContext";

export function EditModeToggle() {
    const { isEditMode, toggleEditMode } = useEditMode();

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Button
                onClick={toggleEditMode}
                size="lg"
                className="shadow-2xl"
                variant={isEditMode ? "default" : "outline"}
            >
                {isEditMode ? (
                    <>
                        <Save className="h-5 w-5 mr-2" />
                        Guardar Cambios
                    </>
                ) : (
                    <>
                        <Edit className="h-5 w-5 mr-2" />
                        Editar Invitación
                    </>
                )}
            </Button>
        </div>
    );
}
