import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { isAdmin, isSuperUser } from '@/lib/roles';

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || !isAdmin(session.user.role)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id: userId } = await context.params;

        if (!userId) {
            return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
        }

        if (userId === session.user.id) {
            return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta de administrador' }, { status: 400 });
        }

        const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
        if (!target) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }
        // Un Super Usuario nunca se elimina desde acá -- ni siquiera otro SU
        // puede hacerlo (hay un solo SU por el momento).
        if (target.role === 'SUPERUSER') {
            return NextResponse.json({ error: 'No se puede eliminar una cuenta de Super Usuario' }, { status: 400 });
        }
        // Solo el Super Usuario puede eliminar cuentas Admin -- un Admin
        // comun no puede borrar a otro Admin.
        if (target.role === 'ADMIN' && !isSuperUser(session.user.role)) {
            return NextResponse.json({ error: 'Solo el Super Usuario puede eliminar una cuenta de Admin' }, { status: 403 });
        }

        // Primero borramos todas las invitaciones del usuario (esto disparará las eliminaciones en cascada hacia invitados, álbumes, etc)
        await prisma.invitation.deleteMany({
            where: { userId }
        });

        // Luego borramos al usuario (sus cuentas conectadas y sesiones deberían borrarse en cascada por el esquema)
        await prisma.user.delete({
            where: { id: userId }
        });

        return NextResponse.json({ success: true, message: 'Cuenta de usuario eliminada correctamente' });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        return NextResponse.json(
            { error: 'Error interno al eliminar la cuenta del usuario' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || !isAdmin(session.user.role)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id: userId } = await context.params;

        if (!userId) {
            return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
        }

        // Mismas restricciones de jerarquía que DELETE (arriba) -- sin esto,
        // un Admin comun podia auto-asignarse creditos o tocar los de otro
        // Admin/Super Usuario con solo llamar a este PATCH.
        if (userId === session.user.id) {
            return NextResponse.json({ error: 'No podés modificar tus propios créditos' }, { status: 400 });
        }
        const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
        if (!target) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }
        if (target.role === 'SUPERUSER') {
            return NextResponse.json({ error: 'No se pueden modificar los créditos de una cuenta de Super Usuario' }, { status: 400 });
        }
        if (target.role === 'ADMIN' && !isSuperUser(session.user.role)) {
            return NextResponse.json({ error: 'Solo el Super Usuario puede modificar créditos de una cuenta de Admin' }, { status: 403 });
        }

        const body = await request.json();
        const data: { premiumCredits?: number; diamondCredits?: number } = {};

        if (body.premiumCredits !== undefined) {
            if (typeof body.premiumCredits !== 'number' || body.premiumCredits < 0) {
                return NextResponse.json({ error: 'Cantidad de créditos premium inválida' }, { status: 400 });
            }
            data.premiumCredits = body.premiumCredits;
        }

        if (body.diamondCredits !== undefined) {
            if (typeof body.diamondCredits !== 'number' || body.diamondCredits < 0) {
                return NextResponse.json({ error: 'Cantidad de créditos diamond inválida' }, { status: 400 });
            }
            data.diamondCredits = body.diamondCredits;
        }

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: 'Nada para actualizar' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, premiumCredits: true, diamondCredits: true }
        });

        return NextResponse.json({ success: true, ...updatedUser });
    } catch (error) {
        console.error('Error actualizando créditos de usuario:', error);
        return NextResponse.json(
            { error: 'Error interno al actualizar la cuenta del usuario' },
            { status: 500 }
        );
    }
}
