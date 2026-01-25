export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

export interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

export async function getCroppedImg(imageSrc: string, pixelCrop: PixelCrop, rotation = 0): Promise<string> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
        Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error('Failed to convert blob to base64'));
                }
            };
        }, 'image/jpeg', 0.95);
    });
}

export async function validateImage(file: File, options: any = {}) {
    const {
        minWidth = 500, // Reduced for easier testing
        minHeight = 500,
        maxSize = 10 * 1024 * 1024,
    } = options;

    if (file.size > maxSize) {
        throw new Error(`Archivo muy pesado. Máximo: ${maxSize / 1024 / 1024}MB`);
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(img.src);
            if (img.width < minWidth || img.height < minHeight) {
                reject(new Error(`Resolución muy baja. Mínimo sugerido: ${minWidth}x${minHeight}px`));
                return;
            }
            resolve(true);
        };

        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error('No se pudo cargar la imagen'));
        };
    });
}

export async function optimizeImage(file: File, options: any = {}): Promise<File> {
    const {
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 0.85,
        format = 'image/jpeg'
    } = options;

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
                let { width, height } = img;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const optimizedFile = new File([blob], file.name, {
                            type: format,
                            lastModified: Date.now()
                        });
                        resolve(optimizedFile);
                    } else {
                        resolve(file); // Fallback to original
                    }
                }, format, quality);
            };
        };
    });
}

export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) throw new Error('Error al subir imagen');
    const data = await response.json();
    return data.url;
}
