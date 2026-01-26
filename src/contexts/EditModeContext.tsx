"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface EditModeContextType {
    isEditMode: boolean;
    toggleEditMode: () => void;
    setEditMode: (value: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export function EditModeProvider({ children }: { children: ReactNode }) {
    const [isEditMode, setIsEditMode] = useState(false);

    const toggleEditMode = () => setIsEditMode(prev => !prev);
    const setEditMode = (value: boolean) => setIsEditMode(value);

    return (
        <EditModeContext.Provider value={{ isEditMode, toggleEditMode, setEditMode }}>
            {children}
        </EditModeContext.Provider>
    );
}

export function useEditMode() {
    const context = useContext(EditModeContext);
    // Retornar un contexto por defecto si no está dentro del provider
    if (context === undefined) {
        return {
            isEditMode: false,
            toggleEditMode: () => {},
            setEditMode: () => {},
        };
    }
    return context;
}
