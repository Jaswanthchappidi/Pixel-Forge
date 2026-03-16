import { Crop as CropIcon, Download } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { ImageUpload } from '../../components/ImageUpload'
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import './ToolStyles.css'

// Helper function to create the cropped image using canvas
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = imageSrc
  })
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'))
        return
      }
      resolve(blob)
    }, 'image/jpeg') // Defaulting to jpeg for crop
  })
}

export default function CropImagePage() {
  const [file, setFile] = useState(null)
  const [imageSrc, setImageSrc] = useState(null)
  
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const handleImageLoaded = (f) => {
    setFile(f)
    if (f) {
      setImageSrc(URL.createObjectURL(f))
    } else {
      setImageSrc(null)
    }
  }

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleDownload = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      const url = URL.createObjectURL(croppedBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cropped-${file.name}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert("Error cropping image.")
    }
  }

  return (
    <ToolPage 
      icon={CropIcon} 
      title="Crop Image" 
      color="#14b8a6" 
      bg="rgba(20, 184, 166, 0.1)"
      desc="Trim images to the perfect size or aspect ratio.">
      
      <div className="tool-workspace">
        {!imageSrc ? (
          <ImageUpload onImageLoaded={handleImageLoaded} />
        ) : (
          <>
            <div className="tool-controls">
              <div className="control-row">
                <div className="control-group" style={{flex: 1}}>
                  <label>Zoom</label>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <button className="styled-button" onClick={handleDownload}>
                  <Download size={18} /> Download Cropped Image
                </button>
              </div>
            </div>
            
            <div className="preview-container" style={{ position: 'relative', height: '400px', width: '100%', padding: 0 }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3} // Default fixed aspect for simplicity, or we can make it free
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
          </>
        )}
      </div>
    </ToolPage>
  )
}
