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

/** Versión servidor (sharp) de la marca de agua de src/lib/liveShare.ts --
 * mismo criterio visual (logo centrado abajo, con scrim degradado), pero acá
 * corre en Node para las fotos que se empaquetan en el ZIP de descarga,
 * donde no hay Canvas/Image del navegador disponibles. */
export async function buildWatermarkedJpegBuffer(photoPath: string): Promise<Buffer> {
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
    .jpeg({ quality: 90 })
    .toBuffer();
}
