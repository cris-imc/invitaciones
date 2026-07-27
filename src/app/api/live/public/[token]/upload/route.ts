import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    try {
        const { token } = await params;
        if (!token) return new NextResponse("Missing token", { status: 400 });

        const liveSession = await prisma.liveSession.findUnique({
            where: { publicToken: token }
        });

        if (!liveSession || !liveSession.isActive) {
            return new NextResponse("Session not active or not found", { status: 404 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const type = formData.get('type') as string; // 'PHOTO' | 'AUDIO'
        const guestName = formData.get('guestName') as string | null;

        if (!file || !type) {
            return NextResponse.json({ error: 'Falta archivo o tipo' }, { status: 400 });
        }

        // Basic validation
        if (type !== 'PHOTO' && type !== 'AUDIO') {
            return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
        }
        
        // 10MB limit for safety
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'El archivo es demasiado grande (máx 10MB)' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = type === 'PHOTO' ? '.jpg' : '.webm'; // Assume converted/compressed forms if needed
        const filename = `live-${uniqueSuffix}${ext}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'live');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore error if it exists
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const fileUrl = `/uploads/live/${filename}`;

        const item = await prisma.liveItem.create({
            data: {
                sessionId: liveSession.id,
                type,
                fileUrl,
                guestName: guestName || null,
                isActive: true
            }
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error('[LIVE_UPLOAD_POST]', error);
        return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 });
    }
}
