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
        templateTipo: "ORIGINAL", // Default template

        // Initial values for new fields
        frasePersonalizadaHabilitada: false,
        frasePersonalizadaTexto: "",

        regaloHabilitado: false,
        regaloTitulo: "Regalo",
        regaloMensaje: "",
        regaloMostrarDatos: false,
        regaloCbu: "",
        regaloAlias: "",
        regaloBanco: "",
        regaloTitular: "",

        // Cronograma events
        cronogramaEventos: JSON.stringify([
            { time: "19:00", title: "Ceremonia", icon: "Heart" },
            { time: "20:30", title: "Recepción", icon: "Music" },
            { time: "21:00", title: "Cena", icon: "Utensils" },
            { time: "23:00", title: "Fiesta", icon: "Music" }
        ]),

        // Parallax template specific
        imagenCelebremosJuntos: "",

        // RSVP configuration
        rsvpDaysBeforeEvent: 7, // Default 7 days before event
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
        data: {
            colorPrincipal: "#000000",
            templateTipo: "ORIGINAL",
            cronogramaEventos: JSON.stringify([
                { time: "19:00", title: "Ceremonia", icon: "Heart" },
                { time: "20:30", title: "Recepción", icon: "Music" },
                { time: "21:00", title: "Cena", icon: "Utensils" },
                { time: "23:00", title: "Fiesta", icon: "Music" }
            ]),
            rsvpDaysBeforeEvent: 7
        },
        themeConfig: DEFAULT_THEME_CONFIG
    }),
}));

