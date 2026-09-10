import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/store/wizard-store";
import { useSaveStep } from "@/lib/use-save-step";
import { Loader2, Eye, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFormState } from "react-hook-form";
import { useTextos } from "@/components/i18n/ProveedorIdioma";

function FormTracker({ form, onDirtyChange }: { form: any, onDirtyChange: (d: boolean) => void }) {
    const { isDirty } = useFormState({ control: form.control });
    useEffect(() => {
        onDirtyChange(isDirty);
    }, [isDirty, onDirtyChange]);
    return null;
}

export function SaveStepButtons({ form, onNext, isLastStep, onCreate, isCreating, disableSave }: { form?: any, onNext?: () => void, isLastStep?: boolean, onCreate?: () => void, isCreating?: boolean, disableSave?: boolean }) {
    const { prevStep, nextStep, currentStep, setDirty, setData, data } = useWizardStore();
    const t = useTextos();
    const router = useRouter();
    const [showWarning, setShowWarning] = useState(false);
    const { saveChanges, isSaving, isEditing } = useSaveStep(form);
    const storeIsDirty = useWizardStore((s) => s.isDirty);
    const [formIsDirty, setFormIsDirty] = useState(false);
    
    const isDirty = storeIsDirty || formIsDirty;
    const [hasJustSaved, setHasJustSaved] = useState(false);

    useEffect(() => {
        if (isDirty) setHasJustSaved(false);
    }, [isDirty]);

    const handleSaveClick = async () => {
        const success = await saveChanges();
        if (success) {
            setHasJustSaved(true);
        }
    };

    // Navegar ENTRE pasos (currentStep > 0) nunca debe advertir nada: los
    // datos siguen en el store pase lo que pase, no se pierde nada moviendose
    // de un paso a otro. Solo el paso 0 -> "Atrás" sale del wizard de verdad
    // (vuelve a Administrar), ahi si hay algo que se podria perder.
    const handleBackClick = () => {
        if (isDirty && form) {
            const values = form.getValues();
            setData(values);
        }
        if (currentStep === 0 && isDirty) {
            setShowWarning(true);
        } else {
            proceedBack();
        }
    };

    const backHref = isEditing && data.slug ? `/dashboard/invitaciones/${data.slug}/guests` : '/dashboard';

    const proceedBack = () => {
        if (currentStep === 0) {
            setDirty(false);
            router.push(backHref);
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
                        <DialogTitle>{isEditing ? t("wizard.nav.avisoCambiosTitulo") : t("wizard.nav.avisoSalirTitulo")}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? t("wizard.nav.avisoCambiosTexto") : t("wizard.nav.avisoSalirTexto")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowWarning(false)}>
                            {t("comun.cancelar")}
                        </Button>
                        <Button variant="destructive" onClick={proceedBack}>
                            {isEditing ? t("wizard.nav.salirSinGuardar") : t("wizard.nav.salirYPerder")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col gap-4 pt-6 mt-4 border-t border-border/40">
                {/* Opciones extra que aparecen arriba al guardar */}
                {isEditing && hasJustSaved && (
                    <div className="flex justify-end gap-2 w-full">
                        <Link href={`/dashboard/invitaciones/${useWizardStore.getState().data.slug}/guests`} className="flex-1 sm:flex-none">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-orange-500/50 text-orange-500 hover:bg-orange-500/10 gap-2 font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                {t("wizard.nav.salir")}
                            </Button>
                        </Link>
                        <Link href={`/i/${useWizardStore.getState().data.slug}`} target="_blank" className="flex-1 sm:flex-none">
                            <Button 
                                type="button" 
                                variant="outline"
                                className="w-full border-amber-500/50 text-amber-500 hover:bg-amber-500/10 gap-2 font-medium"
                            >
                                <Eye className="w-4 h-4" />
                                {t("wizard.nav.verCambios")}
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Fila inferior principal: Atrás (izq) | Aplicar + Siguiente (der) */}
                <div className="flex justify-between items-center w-full gap-2 sm:gap-4">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleBackClick} 
                        className="shrink-0"
                    >
                        {t("wizard.nav.atras")}
                    </Button>
                
                    <div className="flex justify-end gap-2 sm:gap-3 w-full">
                        {isEditing && (
                            <Button 
                                type="button" 
                                variant={isDirty ? "default" : "secondary"}
                                className={isDirty ? "bg-amber-500 hover:bg-amber-600 text-black font-semibold flex-1 sm:flex-none" : "flex-1 sm:flex-none disabled:opacity-100 disabled:text-[var(--shell-fg-soft)]"}
                                onClick={handleSaveClick}
                                disabled={isSaving || !isDirty || disableSave}
                            >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t("comun.guardando")}
                                </>
                            ) : (
                                t("wizard.nav.aplicarCambios")
                            )}
                            </Button>
                        )}
                        {isLastStep ? (
                            !isEditing && (
                                <Button 
                                    type="button" 
                                    className="px-8 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold flex-1 sm:flex-none"
                                    onClick={onCreate}
                                    disabled={isSaving || isCreating || disableSave}
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t("wizard.nav.creando")}
                                        </>
                                    ) : (
                                        t("wizard.nav.crearInvitacion")
                                    )}
                                </Button>
                            )
                        ) : (
                            <Button
                                type={form ? "submit" : "button"}
                                className={isEditing ? "flex-1 sm:flex-none" : undefined}
                                onClick={onNext ? onNext : (!form ? nextStep : undefined)}
                            >
                                <span className="sm:hidden">{t("comun.siguiente")}</span>
                                <span className="hidden sm:inline">{t("wizard.nav.siguientePaso")}</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
