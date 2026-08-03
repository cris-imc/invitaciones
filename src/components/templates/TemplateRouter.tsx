import { ConviteTemplate } from "./ConviteTemplate";
import { ElegantTemplate } from "./ElegantTemplate";
import { ElegantTemplateGreen } from "./ElegantTemplateGreen";
import { ElegantTemplateRed } from "./ElegantTemplateRed";
import { ElegantTemplateBlue } from "./ElegantTemplateBlue";
import { ElegantTemplateOrange } from "./ElegantTemplateOrange";
import { ElegantTemplateViolet } from "./ElegantTemplateViolet";
import { ElegantTemplateGray } from "./ElegantTemplateGray";
import { ElegantTemplateDarkYellow } from "./ElegantTemplateDarkYellow";
import { ElegantTemplatePink } from "./ElegantTemplatePink";
import { ModernoTemplateAzul } from "./ModernoTemplateAzul";
import { ModernoTemplateBordo } from "./ModernoTemplateBordo";
import { ModernoTemplatePurpura } from "./ModernoTemplatePurpura";
import { ModernoTemplateVerde } from "./ModernoTemplateVerde";
import { ModernoTemplateNegro } from "./ModernoTemplateNegro";

export function TemplateRouter({ invitation, guest = null, isPersonalized = false }: { invitation: Record<string, unknown>, guest?: any, isPersonalized?: boolean }) {
    let temaColoresObj = { colorPrincipal: "default" };
    try {
        if (typeof invitation.temaColores === "string") {
            temaColoresObj = JSON.parse(invitation.temaColores);
        } else if (invitation.temaColores) {
            temaColoresObj = invitation.temaColores as any;
        }
    } catch (e) {
        // Fallback
    }

    if (invitation.tipo === "CASAMIENTO" || invitation.tipo === "QUINCE_ANOS" || invitation.type === "CASAMIENTO" || invitation.type === "QUINCE_ANOS") {
        const color = temaColoresObj.colorPrincipal || "default";
        
        if (invitation.templateTipo === "MODERNO") {
            switch (color) {
                case "Bordo": return <ModernoTemplateBordo invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
                case "Purpura": return <ModernoTemplatePurpura invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
                case "Verde": return <ModernoTemplateVerde invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
                case "Negro": return <ModernoTemplateNegro invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
                case "Azul":
                default: 
                    return <ModernoTemplateAzul invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
            }
        } else {
            switch (color) {
                case "Green": return <ElegantTemplateGreen invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
                case "Red": return <ElegantTemplateRed invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
                case "Blue": return <ElegantTemplateBlue invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
                case "Orange": return <ElegantTemplateOrange invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
                case "Violet": return <ElegantTemplateViolet invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
                case "Gray": return <ElegantTemplateGray invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
                case "DarkYellow": return <ElegantTemplateDarkYellow invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
                case "Pink": return <ElegantTemplatePink invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
                default: return <ElegantTemplate invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
            }
        }
    }

    return <ConviteTemplate invitation={invitation} guest={guest} isPersonalized={isPersonalized} />;
}

