import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/store/wizard-store";
import { useSaveStep } from "@/lib/use-save-step";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFormState } from "react-hook-form";

export function SaveStepButtons({ form }: { form: any }) {
    const { prevStep, currentStep, setDirty, setData } = useWizardStore();
    const router = useRouter();
    const [showWarning, setShowWarning] = useState(false);
    const { saveChanges, isSaving, isEditing } = useSaveStep(form);
    const { isDirty } = useFormState({ control: form.control });

    useEffect(() => {
        setDirty(isDirty);
    }, [isDirty, setDirty]);

    const handleBackClick = () => {
        if (currentStep === 1) { // Step 1 is "Información Básica". Going back means going to "Tipo de evento" (Step 0)
            if (isDirty) {
                setShowWarning(true);
            } else {
                proceedBack();
            }
        } else {
            if (isDirty) {
                const values = form.getValues();
                setData(values);
            }
            proceedBack();
        }
    };

    const proceedBack = () => {
        setDirty(false);
        if (currentStep === 0) {
            router.push('/dashboard/invitaciones');
        } else {
            prevStep();
        }
    };

    return (
        <>
            <Dialog open={showWarning} onOpenChange={setShowWarning}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cambios sin guardar</DialogTitle>
                        <DialogDescription>
                            Tenés cambios sin guardar en la invitación. ¿Estás seguro de que querés salir sin aplicar los cambios?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowWarning(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={proceedBack}>
                            Salir sin guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row justify-between pt-4 gap-4">
                <Button type="button" variant="outline" onClick={handleBackClick} className="order-2 sm:order-1">
                    Atrás
                </Button>
            
            <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
                {isEditing && (
                    <Button 
                        type="button" 
                        variant={isDirty ? "default" : "secondary"}
                        className={isDirty ? "bg-amber-500 hover:bg-amber-600 text-black font-semibold" : ""}
                        onClick={saveChanges}
                        disabled={isSaving || !isDirty}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            'Aplicar cambios'
                        )}
                    </Button>
                )}
                <Button type="submit">Siguiente Paso</Button>
            </div>
        </div>
        </>
    );
}
