const LOGO_SRC = "/landing/logo-blanco-v2.png";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    img.src = src;
  });
}

/** Compone la foto + el isologotipo chico (con un scrim degradado abajo para
 * que se lea sobre cualquier foto) en un canvas, y devuelve un File listo
 * para pasarle a navigator.share. Compartido entre LivePhotoGallery (fotos de
 * todos) y LiveMyPhotosCarousel (fotos propias del invitado). */
export async function buildWatermarkedFile(photoUrl: string): Promise<File> {
  const [photo, logo] = await Promise.all([loadImage(photoUrl), loadImage(LOGO_SRC)]);

  const canvas = document.createElement("canvas");
  canvas.width = photo.naturalWidth;
  canvas.height = photo.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no soportado");
  ctx.drawImage(photo, 0, 0);

  const logoWidth = canvas.width * 0.3;
  const logoHeight = logoWidth * (logo.naturalHeight / logo.naturalWidth);
  const marginBottom = canvas.height * 0.035;
  const scrimHeight = logoHeight + marginBottom * 2.4;

  const gradient = ctx.createLinearGradient(0, canvas.height - scrimHeight, 0, canvas.height);
  gradient.addColorStop(0, "rgba(5,8,7,0)");
  gradient.addColorStop(1, "rgba(5,8,7,0.6)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, canvas.height - scrimHeight, canvas.width, scrimHeight);

  ctx.drawImage(logo, (canvas.width - logoWidth) / 2, canvas.height - marginBottom - logoHeight, logoWidth, logoHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo generar la imagen"))), "image/jpeg", 0.92);
  });
  return new File([blob], "altainvitacion-momento.jpg", { type: "image/jpeg" });
}

/** navigator.share si el navegador soporta compartir archivos; si no, descarga
 * directo. Devuelve un mensaje de error para mostrar, o null si salió bien
 * (o el usuario simplemente canceló el share nativo). */
export async function shareWatermarkedPhoto(photoUrl: string): Promise<string | null> {
  try {
    const file = await buildWatermarkedFile(photoUrl);
    const canShareFiles =
      typeof navigator !== "undefined" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] });

    if (canShareFiles) {
      await navigator.share({
        files: [file],
        title: "Un momento de la fiesta",
        text: "Compartido desde altainvitacion.com",
      });
      return null;
    }

    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    return "Tu navegador no deja compartir directo -- te descargamos la foto para que la compartas vos.";
  } catch (err: unknown) {
    if ((err as { name?: string })?.name === "AbortError") return null;
    return "No pudimos preparar la foto para compartir. Probá de nuevo.";
  }
}
