import { RotateCcw, RotateCw, Download } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { ImageUpload } from '../../components/ImageUpload'
import { useState, useEffect } from 'react'
import './ToolStyles.css'

export default function RotateImagePage() {
  const [file, setFile] = useState(null)
  const [imageObj, setImageObj] = useState(null)
  const [rotation, setRotation] = useState(0) // degrees

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => setImageObj(img)
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  const rotate = (amount) => {
    setRotation((prev) => (prev + amount) % 360)
  }

  const handleDownload = () => {
    if (!imageObj) return
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Determine new canvas dimensions
    const rads = (rotation * Math.PI) / 180
    canvas.width = Math.abs(imageObj.width * Math.cos(rads)) + Math.abs(imageObj.height * Math.sin(rads))
    canvas.height = Math.abs(imageObj.width * Math.sin(rads)) + Math.abs(imageObj.height * Math.cos(rads))

    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(rads)
    ctx.drawImage(imageObj, -imageObj.width / 2, -imageObj.height / 2)

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rotated-${file.name}`
      a.click()
      URL.revokeObjectURL(url)
    }, file.type)
  }

  return (
    <ToolPage 
      icon={RotateCcw} 
      title="Rotate Image" 
      color="#f97316" 
      bg="rgba(249, 115, 22, 0.1)"
      desc="Rotate images clockwise or counter-clockwise.">
      
      <div className="tool-workspace">
        {!file ? (
          <ImageUpload onImageLoaded={setFile} />
        ) : (
          <>
            <div className="tool-controls">
              <div className="control-row">
                <button className="styled-button secondary" onClick={() => rotate(-90)}>
                  <RotateCcw size={18} /> Rotate Left
                </button>
                <button className="styled-button secondary" onClick={() => rotate(90)}>
                  <RotateCw size={18} /> Rotate Right
                </button>
              </div>
              <div>
                <button className="styled-button" onClick={handleDownload}>
                  <Download size={18} /> Download Rotated Image
                </button>
              </div>
            </div>
            
            <div className="preview-container">
              <img 
                src={imageObj?.src} 
                alt="Rotated preview" 
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease'
                }} 
              />
            </div>
          </>
        )}
      </div>
    </ToolPage>
  )
}
