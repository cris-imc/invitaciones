import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { useWizardStore } from "@/store/wizard-store";
import { saveInvitationFromWizard } from "./save-invitation";

export function useSaveStep(form?: any) {
    const { data, themeConfig, setData, setDirty } = useWizardStore();
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();
    
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
        let isValid = true;
        let values = {};
        
        if (form) {
            isValid = await form.trigger();
            if (isValid) {
                values = form.getValues();
                setData(values);
            }
        }
        
        if (isValid) {
            setIsSaving(true);
            try {
                const dataToSave = form ? { ...data, ...values } : data;
                await saveInvitationFromWizard(dataToSave, themeConfig);
                if (form) {
                    form.reset(values); // Reset default values so isDirty becomes false again
                }
                setDirty(false);
                showToast("¡Cambios guardados exitosamente!", "success");
            } catch (e) {
                showToast("Error al guardar los cambios.", "error");
                console.error(e);
            }
            setIsSaving(false);
        }
    };
    
    return { saveChanges, isSaving, isEditing: Boolean(data.id) };
}
