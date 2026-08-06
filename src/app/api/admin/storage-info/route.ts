import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { auth } from '@/auth';
import { getUploadsDir } from '@/lib/uploads';

// Diagnóstico temporal: confirma si Railway realmente está inyectando
// RAILWAY_VOLUME_MOUNT_PATH (Volume conectado) o si getUploadsDir() está
// cayendo al filesystem efímero del contenedor (public/uploads), que se
// borra en cada redeploy — la sospecha detrás de fotos que "se rompen".
export async function GET() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const resolvedDir = getUploadsDir();
    let fileCount: number | null = null;
    let readError: string | null = null;
    try {
        const files = await readdir(resolvedDir);
        fileCount = files.length;
    } catch (e) {
        readError = e instanceof Error ? e.message : String(e);
    }

    return NextResponse.json({
        resolvedDir,
        railwayVolumeMountPath: process.env.RAILWAY_VOLUME_MOUNT_PATH || null,
        manualUploadsDir: process.env.UPLOADS_DIR || null,
        usingVolume: !!process.env.RAILWAY_VOLUME_MOUNT_PATH,
        fileCount,
        readError,
    });
}
