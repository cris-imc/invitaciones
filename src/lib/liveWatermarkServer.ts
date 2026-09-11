import path from "path";
import sharp from "sharp";

const LOGO_PATH = path.join(process.cwd(), "public", "landing", "logo-blanco-v2.png");

let cachedLogo: { buffer: Buffer; width: number; height: number } | null = null;

async function getLogo() {
  if (cachedLogo) return cachedLogo;
  const buffer = await sharp(LOGO_PATH).toBuffer();
  const meta = await sharp(buffer).metadata();
  cachedLogo = { buffer, width: meta.width ?? 1, height: meta.height ?? 1 };
  return cachedLogo;
}

/** Arma la tubería de sharp con la marca de agua puesta, sin ejecutarla.
 * El objeto que devuelve es un stream: no lee la foto ni ocupa memoria hasta
 * que alguien empieza a consumirlo. */
async function buildWatermarkedJpegPipeline(photoPath: string) {
  const logo = await getLogo();
  const photo = sharp(photoPath).rotate(); // aplica la orientación EXIF antes de medir
  const meta = await photo.metadata();
  const width = meta.width ?? 1200;
  const height = meta.height ?? 1200;

  const logoWidth = Math.round(width * 0.3);
  const logoHeight = Math.round(logoWidth * (logo.height / logo.width));
  const marginBottom = Math.round(height * 0.035);
  const scrimHeight = logoHeight + Math.round(marginBottom * 2.4);

  const scrimSvg = Buffer.from(
    `<svg width="${width}" height="${scrimHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#050807" stop-opacity="0" />
          <stop offset="1" stop-color="#050807" stop-opacity="0.6" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#scrim)" />
    </svg>`
  );

  const resizedLogo = await sharp(logo.buffer).resize(logoWidth, logoHeight).toBuffer();

  return photo
    .composite([
      { input: scrimSvg, top: height - scrimHeight, left: 0 },
      { input: resizedLogo, top: height - marginBottom - logoHeight, left: Math.round((width - logoWidth) / 2) },
    ])
    .jpeg({ quality: 90 });
}

/** Versión servidor (sharp) de la marca de agua de src/lib/liveShare.ts --
 * mismo criterio visual (logo centrado abajo, con scrim degradado), pero acá
 * corre en Node para las fotos que se empaquetan en el ZIP de descarga,
 * donde no hay Canvas/Image del navegador disponibles.
 *
 * Devuelve un STREAM, no un Buffer: el ZIP de un evento puede tener 200 fotos
 * y, con buffers, las 200 quedaban en memoria a la vez (~400 MB) antes de
 * mandar un solo byte. El archivador consume estos streams de a uno, así que
 * la memoria queda acotada a la foto que se está procesando, sin importar
 * cuántas haya. */
export async function buildWatermarkedJpegStream(photoPath: string) {
  return buildWatermarkedJpegPipeline(photoPath);
}

/** Igual que la anterior pero materializada en un Buffer. Para quien necesite
 * la imagen entera en memoria a propósito. */
export async function buildWatermarkedJpegBuffer(photoPath: string): Promise<Buffer> {
  return (await buildWatermarkedJpegPipeline(photoPath)).toBuffer();
}
