import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { prisma } from '@/lib/db';
import { getUploadsDir } from '@/lib/uploads';
import { checkPlanLimits, PlanTier } from '@/lib/plan-limits';

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    try {
        const { token } = await params;
        if (!token) return new NextResponse("Missing token", { status: 400 });

        const liveSession = await prisma.liveSession.findUnique({
            where: { publicToken: token },
            include: { invitation: true }
        });

        if (!liveSession || !liveSession.isActive) {
            return new NextResponse("Session not active or not found", { status: 404 });
        }

        const formData = await req.formData();
        const type = formData.get('type') as string; // 'PHOTO' | 'AUDIO' | 'TEXT'
        const file = type !== 'TEXT' ? (formData.get('file') as File | null) : null;
        const guestName = formData.get('guestName') as string | null;
        const acceptanceId = formData.get('acceptanceId') as string | null;

        if (!type || (type !== 'TEXT' && !file)) {
            return NextResponse.json({ error: 'Falta archivo o tipo' }, { status: 400 });
        }

        // Sin una aceptación de Términos y Condiciones válida y registrada
        // para esta sesión, no se procesa ningún archivo -- el checkbox del
        // cliente no es suficiente evidencia por sí solo.
        if (!acceptanceId) {
            return NextResponse.json({ error: 'Debés aceptar los Términos y Condiciones para subir contenido' }, { status: 403 });
        }
        const acceptance = await prisma.liveTermsAcceptance.findUnique({ where: { id: acceptanceId } });
        if (!acceptance || acceptance.sessionId !== liveSession.id) {
            return NextResponse.json({ error: 'Debés aceptar los Términos y Condiciones para subir contenido' }, { status: 403 });
        }

        // Basic validation
        if (type !== 'PHOTO' && type !== 'AUDIO' && type !== 'TEXT') {
            return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
        }

        // El cupo de LIVE solo se descuenta con fotos (video, a futuro, también descontará)
        if (type === 'PHOTO') {
            const photoCount = await prisma.liveItem.count({
                where: { sessionId: liveSession.id, type: 'PHOTO' }
            });
            const limitError = await checkPlanLimits(
                liveSession.invitation.userId,
                liveSession.invitation.planTier as PlanTier,
                "add-live-photo",
                photoCount
            );
            if (limitError) {
                return NextResponse.json({ error: limitError.message }, { status: 403 });
            }
        }

        if (type === 'TEXT') {
            const message = formData.get('message') as string | null;
            if (!message || message.trim() === '') {
                return NextResponse.json({ error: 'Falta mensaje' }, { status: 400 });
            }
            if (message.length > 200) {
                return NextResponse.json({ error: 'Mensaje muy largo (máximo 200 caracteres)' }, { status: 400 });
            }
            
            const item = await prisma.liveItem.create({
                data: {
                    sessionId: liveSession.id,
                    type: 'TEXT',
                    fileUrl: message.trim(), // We store the text message here
                    guestName: guestName || null,
                    isActive: !liveSession.isModerated,
                    status: liveSession.isModerated ? 'PENDING' : 'APPROVED',
                    acceptanceId: acceptance.id
                }
            });
            return NextResponse.json(item);
        }
        
        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'No se encontró archivo válido' }, { status: 400 });
        }

        // 10MB limit for safety
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'El archivo es demasiado grande (máx 10MB)' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = type === 'PHOTO' ? '.jpg' : '.webm'; // Assume converted/compressed forms if needed
        const filename = `live-${uniqueSuffix}${ext}`;

        const uploadDir = getUploadsDir('live');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore error if it exists
        }

        const filepath = getUploadsDir('live', filename);
        await writeFile(filepath, buffer);

        const fileUrl = `/uploads/live/${filename}`;

        const item = await prisma.liveItem.create({
            data: {
                sessionId: liveSession.id,
                type,
                fileUrl,
                guestName: guestName || null,
                isActive: !liveSession.isModerated,
                status: liveSession.isModerated ? 'PENDING' : 'APPROVED',
                acceptanceId: acceptance.id
            }
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error('[LIVE_UPLOAD_POST]', error);
        return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 });
    }
}
