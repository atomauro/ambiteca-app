import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRoleLabel(role?: string | null): string {
  switch ((role || '').toLowerCase()) {
    case 'admin':
      return 'Admin'
    case 'asistente':
      return 'Asistente'
    case 'ciudadano':
      return 'Ciudadano'
    default:
      return role || 'Ciudadano'
  }
}


// Recorte cuadrado y compresión a WebP (o formato indicado) para imágenes del panel
export async function cropAndCompressImageSquare(
  file: File,
  opts?: { maxSize?: number; quality?: number; mimeType?: string }
): Promise<File> {
  const maxSize = opts?.maxSize ?? 600
  const quality = opts?.quality ?? 0.8
  const mimeType = opts?.mimeType ?? 'image/webp'

  const src = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = (e) => reject(e)
      i.src = src
    })

    const side = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height)
    const sx = Math.max(0, ((img.naturalWidth || img.width) - side) / 2)
    const sy = Math.max(0, ((img.naturalHeight || img.height) - side) / 2)

    // Canvas de recorte cuadrado
    const canvas = document.createElement('canvas')
    canvas.width = maxSize
    canvas.height = maxSize
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, sx, sy, side, side, 0, 0, maxSize, maxSize)

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo generar blob'))), mimeType, quality)
    })

    const name = (file.name || 'image').replace(/\.[^.]+$/, '.webp')
    return new File([blob], name, { type: mimeType })
  } finally {
    URL.revokeObjectURL(src)
  }
}


