import { Droplet, Download } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { ImageUpload } from '../../components/ImageUpload'
import { useState, useRef, useEffect, useCallback } from 'react'
import './ToolStyles.css'

export default function ImageBlurPage() {
  const [file, setFile] = useState(null)
  const [imageObj, setImageObj] = useState(null)
  const [blurAmount, setBlurAmount] = useState(5)
  const canvasRef = useRef(null)

  const drawPreview = useCallback((img, blur) => {
    const canvas = canvasRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height
    
    // Apply blur using canvas filter
    ctx.filter = `blur(${blur}px)`
    ctx.drawImage(img, 0, 0)
    ctx.filter = 'none' // Reset filter
  }, [])

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setImageObj(img)
      drawPreview(img, blurAmount)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file, blurAmount, drawPreview])

  useEffect(() => {
    if (imageObj) drawPreview(imageObj, blurAmount)
  }, [blurAmount, imageObj, drawPreview])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `blurred-${file.name}`
      a.click()
      URL.revokeObjectURL(url)
    }, file.type)
  }

  return (
    <ToolPage 
      icon={Droplet} 
      title="Image Blur Tool" 
      color="#0ea5e9" 
      bg="rgba(14, 165, 233, 0.1)"
      desc="Apply blur effects to soften backgrounds or create depth.">
      
      <div className="tool-workspace">
        {!file ? (
          <ImageUpload onImageLoaded={setFile} />
        ) : (
          <>
            <div className="tool-controls">
              <div className="control-row">
                <div className="control-group" style={{ flex: 1 }}>
                  <label>Blur Intensity ({blurAmount}px)</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={blurAmount} 
                    onChange={e => setBlurAmount(Number(e.target.value))} 
                  />
                </div>
              </div>
              <div>
                <button className="styled-button" onClick={handleDownload}>
                  <Download size={18} /> Download Blurred Image
                </button>
              </div>
            </div>
            
            <div className="preview-container">
              <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '4px' }} />
            </div>
          </>
        )}
      </div>
    </ToolPage>
  )
}
