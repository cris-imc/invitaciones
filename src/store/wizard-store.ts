import { create } from 'zustand';
import { InvitationFormData } from '@/lib/schemas/invitation';
import { ThemeConfig, DEFAULT_THEME_CONFIG } from '@/lib/theme-config';

interface WizardState {
    currentStep: number;
    data: Partial<InvitationFormData>;
    themeConfig: ThemeConfig;
    usePremiumCredit: boolean;
    setData: (data: Partial<InvitationFormData>) => void;
    setThemeConfig: (config: Partial<ThemeConfig>) => void;
    setUsePremiumCredit: (usePremiumCredit: boolean) => void;
    nextStep: () => void;
    prevStep: () => void;
    setStep: (step: number) => void;
    reset: () => void;
    isDirty: boolean;
    setDirty: (val: boolean) => void;
}

export const useWizardStore = create<WizardState>((set) => ({
    currentStep: 0,
    data: {
        colorPrincipal: "#000000", // Default color (legacy)
        templateTipo: "ORIGINAL", // Default template

        // Initial values for new fields
        sugerenciaMusicaHabilitada: true,
        portadaHabilitada: true,
        portadaKicker: "Con mucho cariño, para",
        portadaTitulo: "",
        portadaDressCode: "",
        portadaMensaje: "",
        portadaTextoBoton: "Abrir invitación",
        frasePersonalizadaHabilitada: false,
        frasePersonalizadaTexto: "",

        regaloHabilitado: false,
        regaloTitulo: "Regalos",
        regaloMensaje: "",
        regaloMostrarDatos: false,
        regaloCbu: "",
        regaloAlias: "",
        regaloBanco: "",
        regaloTitular: "",

        pagoTarjetaHabilitado: false,
        pagoTarjetaTitulo: "Pago de Tarjetas / Pases",
        pagoTarjetaMensaje: "",
        pagoTarjetaMostrarDatos: false,
        pagoTarjetaCbu: "",
        pagoTarjetaAlias: "",
        pagoTarjetaBanco: "",
        pagoTarjetaTitular: "",
        precioNinoHabilitado: true,
        precioAdolescenteHabilitado: false,

        // Cronograma events
        cronogramaEventos: JSON.stringify([]),

        // Parallax template specific
        imagenCelebremosJuntos: "",

        // RSVP configuration
        rsvpDaysBeforeEvent: 7, // Default 7 days before event

        planTier: "FREE",
    },
    themeConfig: DEFAULT_THEME_CONFIG,
    usePremiumCredit: false,
    isDirty: false,
    setDirty: (val) => set({ isDirty: val }),
    setData: (newData) => set((state) => {
        let hasChanges = false;
        for (const key in newData) {
            const newVal = newData[key as keyof typeof newData];
            const oldVal = state.data[key as keyof typeof state.data];
            
            if (newVal instanceof Date && oldVal instanceof Date) {
                if (newVal.getTime() !== oldVal.getTime()) {
                    hasChanges = true;
                    break;
                }
            } else if (newVal !== oldVal) {
                // Ignore differences between falsy values (e.g. "" vs null)
                if (!newVal && !oldVal) continue;
                // Ignore identical objects/arrays
                if (JSON.stringify(newVal) === JSON.stringify(oldVal)) continue;
                
                hasChanges = true;
                break;
            }
        }
        if (!hasChanges) return state; // Do nothing if data is identical
        
        return {
            data: { ...state.data, ...newData },
            isDirty: true
        };
    }),
    setThemeConfig: (config) => set((state) => {
        let hasChanges = false;
        for (const key in config) {
            if (config[key as keyof typeof config] !== state.themeConfig[key as keyof typeof state.themeConfig]) {
                hasChanges = true;
                break;
            }
        }
        if (!hasChanges) return state;

        return {
            themeConfig: { ...state.themeConfig, ...config },
            isDirty: true
        };
    }),
    setUsePremiumCredit: (usePremiumCredit) => set({ usePremiumCredit }),
    nextStep: () => set((state) => ({
        currentStep: state.currentStep + 1
    })),
    prevStep: () => set((state) => ({
        currentStep: Math.max(0, state.currentStep - 1)
    })),
    setStep: (step) => set({ currentStep: step }),
    reset: () => set((state) => ({
        currentStep: 0,
        data: {
            colorPrincipal: "#000000",
            templateTipo: "ORIGINAL",
            cronogramaEventos: JSON.stringify([]),
            rsvpDaysBeforeEvent: 7,
            
            // Booleans Defaults
            portadaHabilitada: true,
            portadaKicker: "Con mucho cariño, para",
            portadaTitulo: "",
            portadaDressCode: "",
            portadaMensaje: "",
            portadaTextoBoton: "Abrir invitación",
            frasePersonalizadaHabilitada: false,
            regaloHabilitado: false,
            triviaHabilitada: false,
            albumCompartidoHabilitado: true,
            sugerenciaMusicaHabilitada: true,
        },
        themeConfig: DEFAULT_THEME_CONFIG,
        usePremiumCredit: state.usePremiumCredit
    })),
}));

