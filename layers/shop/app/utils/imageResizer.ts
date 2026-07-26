/**
 * Client-side HTML5 Canvas Image Resizer & Compressor
 * Resizes images proportionally or crops to square before upload.
 */

export interface ResizeOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  cropToSquare?: boolean
  outputFormat?: 'image/webp' | 'image/jpeg' | 'image/png'
}

export async function resizeImageFile(
  file: File,
  options: ResizeOptions = {}
): Promise<File> {
  // SVG files don't need raster canvas resizing
  if (file.type === 'image/svg+xml') return file

  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.85,
    cropToSquare = false,
    outputFormat = 'image/webp'
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        let { width, height } = img
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          resolve(file)
          return
        }

        if (cropToSquare) {
          // Crop center square
          const minDim = Math.min(width, height)
          const startX = (width - minDim) / 2
          const startY = (height - minDim) / 2
          const targetSize = Math.min(minDim, maxWidth)

          canvas.width = targetSize
          canvas.height = targetSize

          ctx.drawImage(
            img,
            startX, startY, minDim, minDim, // crop source
            0, 0, targetSize, targetSize    // destination
          )
        } else {
          // Proportional scaling
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            } else {
              width = Math.round((width * maxHeight) / height)
              height = maxHeight
            }
          }
          canvas.width = width
          canvas.height = height

          ctx.drawImage(img, 0, 0, width, height)
        }

        const newFileName = file.name.replace(/\.[^/.]+$/, '') + (outputFormat === 'image/webp' ? '.webp' : '.jpg')

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }
            const resizedFile = new File([blob], newFileName, {
              type: outputFormat,
              lastModified: Date.now()
            })
            resolve(resizedFile)
          },
          outputFormat,
          quality
        )
      }

      img.onerror = (err) => reject(err)
    }

    reader.onerror = (err) => reject(err)
  })
}
