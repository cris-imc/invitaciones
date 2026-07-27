export type PlanTier = "FREE" | "PREMIUM" | "ENTERPRISE" | "ADMIN";

export interface PlanFeatures {
  customMusic: boolean;
  trivia: boolean;
  live: boolean;
  djSuggestions: boolean;
  sharedAlbum: boolean;
  analytics: boolean;
  noWatermark: boolean;
  qrCodes: boolean;
  whatsappReminders: boolean;
  dedicatedSupport: boolean;
  customDesign: boolean;
  tableAssignment: boolean;
}

export interface PlanLimits {
  name: string;
  price: number; // in ARS
  maxInvitations: number | null; // null = unlimited
  maxGuests: number | null; // null = unlimited
  maxPhotos: number | null;
  allowedTemplates: string[] | "all"; // specific template IDs or "all"
  features: PlanFeatures;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  FREE: {
    name: "Gratis",
    price: 0,
    maxInvitations: null, // unlimited free invitations
    maxGuests: 20,
    maxPhotos: 10,
    allowedTemplates: [
      "modern-invitation",
      "botanical-garden",
      "vintage-elegance",
      "luxury-minimalist",
    ], // 4 plantillas premium
    features: {
      customMusic: false,
      trivia: false,
      live: false,
      djSuggestions: false,
      sharedAlbum: false,
      analytics: false,
      noWatermark: false,
      qrCodes: false,
      whatsappReminders: false,
      dedicatedSupport: false,
      customDesign: false,
      tableAssignment: false,
    },
  },
  PREMIUM: {
    name: "Premium",
    price: 50000,
    maxInvitations: null, // unlimited
    maxGuests: null, // unlimited
    maxPhotos: 200,
    allowedTemplates: "all",
    features: {
      customMusic: true,
      trivia: true,
      live: true,
      djSuggestions: true,
      sharedAlbum: true,
      analytics: true,
      noWatermark: true,
      qrCodes: false,
      whatsappReminders: false,
      dedicatedSupport: true,
      customDesign: false,
      tableAssignment: false,
    },
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 70000,
    maxInvitations: null, // unlimited
    maxGuests: null,
    maxPhotos: null,
    allowedTemplates: "all",
    features: {
      customMusic: true,
      trivia: true,
      live: true,
      djSuggestions: true,
      sharedAlbum: true,
      analytics: true,
      noWatermark: true,
      qrCodes: true,
      whatsappReminders: true,
      dedicatedSupport: true,
      customDesign: true,
      tableAssignment: true,
    },
  },
  ADMIN: {
    name: "Administrador",
    price: 0,
    maxInvitations: null,
    maxGuests: null,
    maxPhotos: null,
    allowedTemplates: "all",
    features: {
      customMusic: true,
      trivia: true,
      live: true,
      djSuggestions: true,
      sharedAlbum: true,
      analytics: true,
      noWatermark: true,
      qrCodes: true,
      whatsappReminders: true,
      dedicatedSupport: true,
      customDesign: true,
      tableAssignment: true,
    },
  },
};

export interface PlanValidationError {
  field: string;
  message: string;
  limit: number | null;
  current: number;
}

export async function checkPlanLimits(
  userId: string,
  planTier: PlanTier,
  operation: "create-invitation" | "add-guest" | "add-photo",
  currentCount?: number
): Promise<PlanValidationError | null> {
  const limits = PLAN_LIMITS[planTier];

  // Admin bypasses all limits
  if (planTier === "ADMIN") {
    return null;
  }

  switch (operation) {
    case "create-invitation":
      if (limits.maxInvitations !== null && currentCount !== undefined) {
        if (currentCount >= limits.maxInvitations) {
          return {
            field: "invitations",
            message: `Has alcanzado el límite de ${limits.maxInvitations} invitación(es) de tu plan ${limits.name}. Actualiza tu plan para crear más.`,
            limit: limits.maxInvitations,
            current: currentCount,
          };
        }
      }
      break;

    case "add-guest":
      if (limits.maxGuests !== null && currentCount !== undefined) {
        if (currentCount >= limits.maxGuests) {
          return {
            field: "guests",
            message: `Has alcanzado el límite de ${limits.maxGuests} invitados de tu plan ${limits.name}. Actualiza tu plan para agregar más.`,
            limit: limits.maxGuests,
            current: currentCount,
          };
        }
      }
      break;

    case "add-photo":
      if (limits.maxPhotos !== null && currentCount !== undefined) {
        if (currentCount >= limits.maxPhotos) {
          return {
            field: "photos",
            message: `Has alcanzado el límite de ${limits.maxPhotos} fotos de tu plan ${limits.name}. Actualiza tu plan para agregar más.`,
            limit: limits.maxPhotos,
            current: currentCount,
          };
        }
      }
      break;
  }

  return null;
}

export function canUseTemplate(planTier: PlanTier, templateId: string): boolean {
  const limits = PLAN_LIMITS[planTier];
  
  if (limits.allowedTemplates === "all") {
    return true;
  }
  
  return limits.allowedTemplates.includes(templateId);
}

export function canUseFeature(planTier: PlanTier, feature: keyof PlanFeatures): boolean {
  return PLAN_LIMITS[planTier].features[feature];
}

export function getPlanPrice(planTier: PlanTier): number {
  return PLAN_LIMITS[planTier].price;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(amount);
}
