import { create } from 'zustand';
import { InvitationFormData } from '@/lib/schemas/invitation';
import { ThemeConfig, DEFAULT_THEME_CONFIG } from '@/lib/theme-config';

interface WizardState {
    currentStep: number;
    data: Partial<InvitationFormData>;
    themeConfig: ThemeConfig;
    setData: (data: Partial<InvitationFormData>) => void;
    setThemeConfig: (config: Partial<ThemeConfig>) => void;
    nextStep: () => void;
    prevStep: () => void;
    setStep: (step: number) => void;
    reset: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
    currentStep: 0,
    data: {
        colorPrincipal: "#000000", // Default color (legacy)
    },
    themeConfig: DEFAULT_THEME_CONFIG,
    setData: (newData) => set((state) => ({
        data: { ...state.data, ...newData }
    })),
    setThemeConfig: (config) => set((state) => ({
        themeConfig: { ...state.themeConfig, ...config }
    })),
    nextStep: () => set((state) => ({
        currentStep: state.currentStep + 1
    })),
    prevStep: () => set((state) => ({
        currentStep: Math.max(0, state.currentStep - 1)
    })),
    setStep: (step) => set({ currentStep: step }),
    reset: () => set({ 
        currentStep: 0, 
        data: { colorPrincipal: "#000000" },
        themeConfig: DEFAULT_THEME_CONFIG
    }),
}));

