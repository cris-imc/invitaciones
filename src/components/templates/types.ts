import { InvitationFormData } from "@/lib/schemas/invitation";
import { ThemeConfig } from "@/lib/theme-config";

export interface Guest {
    id: string;
    name: string;
    type: "INDIVIDUAL" | "FAMILY";
    expectedCount: number;
    uniqueToken: string;
    status: "PENDING" | "CONFIRMED" | "DECLINED";
    attendingCount: number;
    message?: string | null;
    invitationId: string;
}

export interface InvitationTemplateProps {
    data: InvitationFormData;
    themeConfig: ThemeConfig;
    guest?: Guest;
    isPersonalized?: boolean;
}
