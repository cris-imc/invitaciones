import { InvitationFormData } from "@/lib/schemas/invitation";
import { ThemeConfig } from "@/lib/theme-config";

export interface InvitationTemplateProps {
    data: InvitationFormData;
    themeConfig: ThemeConfig;
}
