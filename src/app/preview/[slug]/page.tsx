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
import { NeonTemplate } from "@/components/templates/NeonTemplate";
import { NeonTemplateVioleta } from "@/components/templates/NeonTemplateVioleta";
import { NeonTemplateDorado } from "@/components/templates/NeonTemplateDorado";
import { NeonTemplateVerde } from "@/components/templates/NeonTemplateVerde";
import { NeonTemplateAzul } from "@/components/templates/NeonTemplateAzul";
import { NeonTemplateRojo } from "@/components/templates/NeonTemplateRojo";
import { ChicTemplate } from "@/components/templates/ChicTemplate";
import { ChicTemplateRosa } from "@/components/templates/ChicTemplateRosa";
import { ChicTemplateAzul } from "@/components/templates/ChicTemplateAzul";
import { ChicTemplateTerracota } from "@/components/templates/ChicTemplateTerracota";
import { ChicTemplateVioleta } from "@/components/templates/ChicTemplateVioleta";
import { ChicTemplateVerdeBotella } from "@/components/templates/ChicTemplateVerdeBotella";
import { ChicTemplateGris } from "@/components/templates/ChicTemplateGris";
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

        if (invitation.templateTipo === 'NEON') {
            switch (color) {
                case 'Violeta': return <NeonTemplateVioleta invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Dorado': return <NeonTemplateDorado invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Verde': return <NeonTemplateVerde invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Azul': return <NeonTemplateAzul invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Rojo': return <NeonTemplateRojo invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <NeonTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation.templateTipo === 'CHIC') {
            switch (color) {
                case 'Rosa': return <ChicTemplateRosa invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Azul': return <ChicTemplateAzul invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Terracota': return <ChicTemplateTerracota invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Violeta': return <ChicTemplateVioleta invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'VerdeBotella': return <ChicTemplateVerdeBotella invitation={invRecord} guest={null} isPersonalized={false} />;
                case 'Gris': return <ChicTemplateGris invitation={invRecord} guest={null} isPersonalized={false} />;
                default: return <ChicTemplate invitation={invRecord} guest={null} isPersonalized={false} />;
            }
        } else if (invitation.templateTipo === 'MODERNO') {
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
