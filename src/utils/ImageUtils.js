// ─── Image Conversion Utility ─────────────────────────────────────────────────
// All conversion happens in-browser using Canvas API.
// ──────────────────────────────────────────────────────────────────────────────

import imageCompression from 'browser-image-compression'

export const FORMATS = ['png', 'jpeg', 'webp', 'gif', 'bmp']
export const MIME = {
  png:  'image/png',
  jpeg: 'image/jpeg',
  jpg:  'image/jpeg',
  webp: 'image/webp',
  gif:  'image/gif',
  bmp:  'image/bmp',
}

/**
 * Convert an image File/Blob to a target format.
 * Returns a new Blob in the target format.
 */
export async function convertImage(file, targetFormat, quality = 0.92) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight

      const ctx = canvas.getContext('2d')

      // Fill white BG for JPEG (no transparency)
      if (targetFormat === 'jpeg' || targetFormat === 'jpg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Conversion failed'))
        },
        MIME[targetFormat] || 'image/png',
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Compress an image File using browser-image-compression.
 * Returns a compressed File.
 */
export async function compressImage(file, maxSizeMB = 1, maxWidthOrHeight = 1920) {
  return imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
  })
}

/**
 * Apply canvas-based filters to a canvas element.
 */
export function applyFilters(canvas, filters) {
  const { brightness = 100, contrast = 100, saturation = 100, blur = 0, grayscale = 0, sepia = 0 } = filters
  canvas.style.filter = [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    `saturate(${saturation}%)`,
    `blur(${blur}px)`,
    `grayscale(${grayscale}%)`,
    `sepia(${sepia}%)`,
  ].join(' ')
}

/**
 * Render canvas with CSS filters baked in, return new Blob.
 */
export function canvasToBlob(sourceCanvas, filters, format = 'png', quality = 0.92) {
  return new Promise((resolve) => {
    const dest = document.createElement('canvas')
    dest.width  = sourceCanvas.width
    dest.height = sourceCanvas.height
    const ctx = dest.getContext('2d')

    const { brightness = 100, contrast = 100, saturation = 100, blur = 0, grayscale = 0, sepia = 0 } = filters

    ctx.filter = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturation}%)`,
      `blur(${blur}px)`,
      `grayscale(${grayscale}%)`,
      `sepia(${sepia}%)`,
    ].join(' ')

    ctx.drawImage(sourceCanvas, 0, 0)
    dest.toBlob(resolve, MIME[format] || 'image/png', quality)
  })
}

/** Format file size bytes → human readable */
export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/** Download a blob as a file */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}