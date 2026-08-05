/**
 * Convierte un texto libre en un slug seguro para usar en URLs: minusculas,
 * sin acentos ni simbolos (solo a-z, 0-9 y guiones). Necesario porque los
 * titulos de invitacion pueden incluir signos como "¡Nos Casamos!", que si
 * se dejan tal cual en el slug rompen el ruteo dinamico de Next.js.
 */
export function slugify(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "") // quita acentos (e.g. e-acute -> e, n-tilde -> n)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // quita cualquier simbolo que no sea letra/numero/espacio/guion
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}
