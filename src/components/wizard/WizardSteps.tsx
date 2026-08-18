"use client";

import { useWizardStore } from "@/store/wizard-store";
import { BackLink } from "@/components/ui/BackLink";
import { WizardLivePreview } from "./WizardLivePreview";
import { WizardMobilePreviewSheet } from "./WizardMobilePreviewSheet";
import { getWizardSteps } from "./wizard-steps-config";

export function WizardSteps() {
    const { currentStep, data } = useWizardStore();

    const isCasamiento = data.type === "CASAMIENTO";
    const isEditing = Boolean(data.id);

    const steps = getWizardSteps({ isEditing, isCasamiento, hasGallery: data.galeriaPrincipalHabilitada !== false });

    const CurrentComponent = steps[currentStep].component;
    const progress = ((currentStep + 1) / steps.length) * 100;
    const showProgress = isEditing || Boolean(data.type);

    // ──────────────────────────────────────────────────────
    //  Desktop split-panel layout (left edit + right preview)
    // ──────────────────────────────────────────────────────
    return (
        <div className="wiz-root">
            {/* ── LEFT PANEL (edit) ── */}
            <div className="wiz-panel">
                {/* Wizard header bar */}
                <div className="wiz-header flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                        {showProgress && (
                            <>
                                <div className="wiz-step-lbl">
                                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                                        PASO {currentStep + 1}
                                    </span>
                                    {" · "}{steps[currentStep].label}
                                </div>
                                <div className="wiz-progress-track">
                                    <div
                                        className="wiz-progress-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </>
                        )}
                        {!showProgress && (
                            <div className="wiz-step-lbl">
                                Creá tu invitación
                            </div>
                        )}
                    </div>
                    <div className="shrink-0 flex items-center">
                        <BackLink href="/dashboard" confirmIfDirty />
                    </div>
                </div>

                {/* Step content */}
                <div className="wiz-scroll">
                    <CurrentComponent />
                </div>
            </div>

            {/* ── RIGHT PANEL (preview — hidden on mobile, visible on desktop) ── */}
            <div className="wiz-preview-pane">
                <WizardLivePreview />
            </div>

            {/* ── MOBILE bottom sheet (hidden on desktop) ── */}
            <WizardMobilePreviewSheet />
        </div>
    );
}
