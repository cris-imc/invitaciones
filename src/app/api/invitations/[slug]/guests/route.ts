import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/roles";

/**
 * Se pasó del tope de invitados del plan.
 *
 * Es un error y no un `return` porque la comprobación vive adentro de la
 * transacción: lanzar es la única forma de deshacerla, y así el invitado no
 * queda creado cuando no entraba.
 */
class LimiteDeInvitados extends Error {
    constructor(public readonly maximo: number) {
        super(`Límite de invitados superado (Máximo: ${maximo})`);
        this.name = "LimiteDeInvitados";
    }
}

/**
 * ¿La base abortó la transacción porque se pisó con otra?
 *
 * PostgreSQL usa el código 40001 (serialization_failure) y Prisma lo envuelve
 * en P2034. No es una falla: es el aislamiento serializable haciendo su
 * trabajo. Quien mandó ese pedido tiene que reintentar.
 */
function esChoqueDeSerializacion(error: unknown): boolean {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return error.code === "P2034";
    }
    const mensaje = error instanceof Error ? error.message : String(error);
    return /40001|could not serialize|deadlock detected/i.test(mensaje);
}

// GET - Obtener todos los invitados de una invitación (solo el anfitrión o admin --
// incluye uniqueToken, el secreto con el que cualquiera podría confirmar/rechazar
// asistencia en nombre de ese invitado, así que no puede ser público)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth().catch(() => null);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        const { slug } = await params;

        // Primero obtener la invitación para conseguir su ID
        const invitation = await prisma.invitation.findUnique({
            where: { slug },
            select: { id: true, userId: true }
        });

        if (!invitation) {
            return NextResponse.json(
                { error: "Invitación no encontrada" },
                { status: 404 }
            );
        }

        if (invitation.userId !== session.user.id && !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
        }

        // Alfabético, igual que en "Gestionar pagos". Antes iba por fecha de
        // carga: las dos pestañas mostraban a la misma gente en distinto orden y
        // era fácil creer que se estaba tocando una familia y ser otra.
        const guests = await prisma.guest.findMany({
            where: { invitationId: invitation.id },
            orderBy: { name: "asc" }
        });

        return NextResponse.json(guests);
    } catch (error) {
        console.error("Error fetching guests:", error);
        return NextResponse.json(
            { error: "Error al obtener invitados" },
            { status: 500 }
        );
    }
}

// POST - Agregar un nuevo invitado
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth().catch(() => null);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        const { slug } = await params;
        const body = await request.json();

        // Primero obtener la invitación para conseguir su ID y plan
        const invitation = await prisma.invitation.findUnique({
            where: { slug },
            select: { id: true, userId: true, planTier: true, maxGuestsOverride: true }
        });

        if (!invitation) {
            return NextResponse.json(
                { error: "Invitación no encontrada" },
                { status: 404 }
            );
        }

        if (invitation.userId !== session.user.id && !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
        }

        // Obtener límite de invitados (override o el del plan)
        const { PLAN_LIMITS } = await import("@/lib/plan-limits");
        const planLimit = PLAN_LIMITS[invitation.planTier as keyof typeof PLAN_LIMITS]?.maxGuests;
        const maxGuests = invitation.maxGuestsOverride !== null ? invitation.maxGuestsOverride : planLimit;

        // Generar token único para el invitado
        const uniqueToken = randomBytes(16).toString("hex");

        // CONTAR Y CREAR VAN JUNTOS, EN UNA TRANSACCIÓN SERIALIZABLE.
        //
        // Antes se contaba, se comparaba contra el tope y recién después se
        // insertaba, todo suelto. Entre la cuenta y el insert no había nada:
        // dos pedidos que llegaran al mismo tiempo leían el mismo total viejo,
        // los dos pasaban el control y los dos insertaban. Con cincuenta
        // pedidos en paralelo, una invitación del plan Gratis terminaba con
        // setenta invitados.
        //
        // El importador de listas no lo disparaba porque manda de a uno, pero
        // eso es una precaución del NAVEGADOR: cualquiera con la consola
        // abierta en su propia invitación mandaba cincuenta fetch juntos y
        // entraba. El tope tiene que sostenerlo el servidor.
        //
        // Serializable y no el aislamiento por defecto: en PostgreSQL (lo que
        // corre en producción) "read committed" deja pasar exactamente este
        // caso, porque cada transacción ve el total de cuando empezó. En
        // SQLite las escrituras ya se serializan solas, así que no cambia
        // nada allá.
        let newGuest;
        try {
            newGuest = await prisma.$transaction(
                async (tx) => {
                    if (maxGuests !== null) {
                        const currentGuests = await tx.guest.aggregate({
                            where: { invitationId: invitation.id },
                            _sum: { expectedCount: true }
                        });

                        const totalCurrent = currentGuests._sum.expectedCount || 0;
                        const toAdd = body.expectedCount || 1;

                        if (totalCurrent + toAdd > maxGuests) {
                            throw new LimiteDeInvitados(maxGuests);
                        }
                    }

                    return tx.guest.create({
                        data: {
                            invitationId: invitation.id,
                            name: body.name,
                            type: body.type || "INDIVIDUAL",
                            expectedCount: body.expectedCount || 1,
                            expectedAdults: body.expectedAdults,
                            expectedTeens: body.expectedTeens ?? 0,
                            expectedChildren: body.expectedChildren,
                            uniqueToken,
                            status: "PENDING",
                            attendingCount: 0,
                            isExempt: Boolean(body.isExempt)
                        }
                    });
                },
                { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
            );
        } catch (error) {
            if (error instanceof LimiteDeInvitados) {
                // Si el tope viene del plan Gratis (no de un override manual
                // del admin), pasarse a Premium/Diamond lo resuelve -- el
                // front usa este flag para ofrecer el selector de plan en
                // vez de un error sin salida (ver GuestManager.tsx).
                const upgradable = invitation.planTier === "FREE" && invitation.maxGuestsOverride === null;
                return NextResponse.json(
                    { error: `Límite de invitados superado (Máximo: ${error.maximo})`, code: "GUEST_LIMIT_REACHED", upgradable },
                    { status: 400 }
                );
            }
            // Dos transacciones que se pisan: PostgreSQL aborta una con 40001.
            // Es el mecanismo funcionando, no una falla -- pero para quien
            // mandó ese pedido es un error sin explicación, así que se le pide
            // que reintente en vez de devolverle un 500.
            if (esChoqueDeSerializacion(error)) {
                return NextResponse.json(
                    { error: "Hubo dos cambios a la vez. Prueba de nuevo.", code: "CONFLICTO" },
                    { status: 409 }
                );
            }
            throw error;
        }

        return NextResponse.json(newGuest);
    } catch (error) {
        console.error("Error creating guest:", error);
        return NextResponse.json(
            { error: "Error al crear invitado" },
            { status: 500 }
        );
    }
}
