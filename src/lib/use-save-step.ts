import { useState, useEffect } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { saveInvitationFromWizard } from "./save-invitation";

export function useSaveStep(form: any) {
    const { data, themeConfig, setData, setDirty } = useWizardStore();
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        // Prevent accidental tab close/refresh based on store state (which is synced by SaveStepButtons)
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (useWizardStore.getState().isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    
    const saveChanges = async () => {
        const isValid = await form.trigger();
        if (isValid) {
            setIsSaving(true);
            const values = form.getValues();
            setData(values);
            try {
                await saveInvitationFromWizard({ ...data, ...values }, themeConfig);
                form.reset(values); // Reset default values so isDirty becomes false again
                setDirty(false);
                alert("¡Cambios guardados exitosamente!");
            } catch (e) {
                alert("Error al guardar los cambios.");
                console.error(e);
            }
            setIsSaving(false);
        }
    };
    
    return { saveChanges, isSaving, isEditing: Boolean(data.id) };
}
