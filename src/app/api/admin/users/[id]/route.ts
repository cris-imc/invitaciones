import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id: userId } = await context.params;

        if (!userId) {
            return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
        }
        
        if (userId === session.user.id) {
            return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta de administrador' }, { status: 400 });
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
        
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id: userId } = await context.params;

        if (!userId) {
            return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
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
