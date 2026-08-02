import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/store/wizard-store";
import { useSaveStep } from "@/lib/use-save-step";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFormState } from "react-hook-form";

function FormTracker({ form, onDirtyChange }: { form: any, onDirtyChange: (d: boolean) => void }) {
    const { isDirty } = useFormState({ control: form.control });
    useEffect(() => {
        onDirtyChange(isDirty);
    }, [isDirty, onDirtyChange]);
    return null;
}

export function SaveStepButtons({ form, onNext, isLastStep, onCreate, isCreating }: { form?: any, onNext?: () => void, isLastStep?: boolean, onCreate?: () => void, isCreating?: boolean }) {
    const { prevStep, nextStep, currentStep, setDirty, setData } = useWizardStore();
    const router = useRouter();
    const [showWarning, setShowWarning] = useState(false);
    const { saveChanges, isSaving, isEditing } = useSaveStep(form);
    const storeIsDirty = useWizardStore((s) => s.isDirty);
    const [formIsDirty, setFormIsDirty] = useState(false);
    
    const isDirty = storeIsDirty || formIsDirty;

    const handleBackClick = () => {
        if (currentStep === 1) { // Step 1 is "Información Básica". Going back means going to "Tipo de evento" (Step 0)
            if (isDirty) {
                setShowWarning(true);
            } else {
                proceedBack();
            }
        } else {
            if (isDirty && form) {
                const values = form.getValues();
                setData(values);
            }
            proceedBack();
        }
    };

    const proceedBack = () => {
        if (currentStep === 0) {
            router.push('/dashboard/invitaciones');
        } else {
            prevStep();
        }
    };

    return (
        <>
            {form && <FormTracker form={form} onDirtyChange={setFormIsDirty} />}
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
                {isLastStep ? (
                    <Button 
                        type="button" 
                        size="lg"
                        className="px-8 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold"
                        onClick={onCreate}
                        disabled={isSaving || isCreating}
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            'Crear Invitación'
                        )}
                    </Button>
                ) : (
                    <Button 
                        type={form ? "submit" : "button"} 
                        onClick={onNext ? onNext : (!form ? nextStep : undefined)}
                    >
                        Siguiente Paso
                    </Button>
                )}
            </div>
        </div>
        </>
    );
}
