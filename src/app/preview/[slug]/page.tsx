import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ConviteTemplate } from "@/components/templates/ConviteTemplate";
import { ElegantTemplate } from "@/components/templates/ElegantTemplate";
import { ElegantTemplateGreen } from "@/components/templates/ElegantTemplateGreen";
import { ElegantTemplateRed } from "@/components/templates/ElegantTemplateRed";
import { ElegantTemplateBlue } from "@/components/templates/ElegantTemplateBlue";
import { ElegantTemplateOrange } from "@/components/templates/ElegantTemplateOrange";
import { ElegantTemplateViolet } from "@/components/templates/ElegantTemplateViolet";
import { ElegantTemplateGray } from "@/components/templates/ElegantTemplateGray";
import { ElegantTemplateDarkYellow } from "@/components/templates/ElegantTemplateDarkYellow";
import { ElegantTemplatePink } from "@/components/templates/ElegantTemplatePink";
import { ModernoTemplate } from "@/components/templates/ModernoTemplate";
import { ModernoTemplateAzul } from "@/components/templates/ModernoTemplateAzul";
import { ModernoTemplateBordo } from "@/components/templates/ModernoTemplateBordo";
import { ModernoTemplateNegro } from "@/components/templates/ModernoTemplateNegro";
import { ModernoTemplatePurpura } from "@/components/templates/ModernoTemplatePurpura";
import { ModernoTemplateVerde } from "@/components/templates/ModernoTemplateVerde";
import { ModernoTemplateRojo } from "@/components/templates/ModernoTemplateRojo";
import { ModernoTemplateGris } from "@/components/templates/ModernoTemplateGris";

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const invitation = await prisma.invitation.findUnique({
        where: { slug },
    });

    if (!invitation) {
        notFound();
    }

    let temaColoresObj = { colorPrincipal: 'default' };
    try {
        if (typeof invitation.temaColores === 'string') {
            temaColoresObj = JSON.parse(invitation.temaColores);
        } else if (invitation.temaColores) {
            temaColoresObj = invitation.temaColores as any;
        }
    } catch (e) {
        // Fallback
    }

    if (invitation.tipo === 'CASAMIENTO' || invitation.tipo === 'QUINCE_ANOS' || invitation.tipo === 'CUMPLEANOS') {
        const color = temaColoresObj.colorPrincipal || 'default';
        const invRecord = invitation as Record<string, unknown>;

        if (invitation.templateTipo === 'MODERNO') {
            switch (color) {
                case 'Azul': return <ModernoTemplateAzul invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Bordo': return <ModernoTemplateBordo invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Negro': return <ModernoTemplateNegro invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Purpura': return <ModernoTemplatePurpura invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Verde': return <ModernoTemplateVerde invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rojo': return <ModernoTemplateRojo invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'default':
                case 'Gris': return <ModernoTemplateGris invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <ModernoTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else {
            switch (color) {
                case 'Green': return <ElegantTemplateGreen invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Red': return <ElegantTemplateRed invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Blue': return <ElegantTemplateBlue invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Orange': return <ElegantTemplateOrange invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Violet': return <ElegantTemplateViolet invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Gray': return <ElegantTemplateGray invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'DarkYellow': return <ElegantTemplateDarkYellow invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Pink': return <ElegantTemplatePink invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <ElegantTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        }
    }

    return <ConviteTemplate invitation={invitation as Record<string, unknown>} />;
}
