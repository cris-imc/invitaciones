export async function saveInvitationFromWizard(data: any, themeConfig: any, usePremiumCredit: boolean = false) {
    const payload = {
        ...data,
        ...themeConfig,
        portadaHabilitada: data.portadaHabilitada,
        galeriaPrincipalHabilitada: data.galeriaPrincipalHabilitada,
        galeriaPrincipalFotos: data.galeriaPrincipalFotos,
        galeriaSecundariaHabilitada: data.galeriaSecundariaHabilitada,
        galeriaSecundariaFotos: data.galeriaSecundariaFotos,
        musicaHabilitada: data.musicaHabilitada,
        sugerenciaMusicaHabilitada: data.sugerenciaMusicaHabilitada,
        triviaHabilitada: data.triviaHabilitada,
        triviaPreguntas: data.triviaPreguntas,
        usePremiumCredit: usePremiumCredit,
    };

    const isEditing = Boolean(data.id);
    const url = isEditing ? `/api/invitations?id=${data.id}` : '/api/invitations';
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
        const errMsg = responseData.error || responseData.details || 'Error al guardar la invitación';
        throw new Error(errMsg);
    }

    return responseData;
}
