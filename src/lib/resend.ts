import { Resend } from "resend";

// Cliente único de Resend para todo el server -- crear una instancia nueva
// por request sería innecesario, el SDK no mantiene estado de conexión.
export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = process.env.EMAIL_FROM || "Alta Invitación <onboarding@resend.dev>";
