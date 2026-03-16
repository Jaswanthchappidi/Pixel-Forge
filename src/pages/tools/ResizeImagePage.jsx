import { Maximize2, Download } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { ImageUpload } from '../../components/ImageUpload'
import { useState, useEffect } from 'react'
import './ToolStyles.css'

export default function ResizeImagePage() {
  const [file, setFile] = useState(null)
  const [imageObj, setImageObj] = useState(null)
  
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [maintainAspect, setMaintainAspect] = useState(true)
  const [aspectRatio, setAspectRatio] = useState(1)

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setImageObj(img)
      setWidth(img.width)
      setHeight(img.height)
      setAspectRatio(img.width / img.height)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleWidthChange = (e) => {
    const val = parseInt(e.target.value) || 0
    setWidth(val)
    if (maintainAspect && aspectRatio > 0) {
      setHeight(Math.round(val / aspectRatio))
    }
  }

  const handleHeightChange = (e) => {
    const val = parseInt(e.target.value) || 0
    setHeight(val)
    if (maintainAspect && aspectRatio > 0) {
      setWidth(Math.round(val * aspectRatio))
    }
  }

  const handleDownload = () => {
    if (!imageObj || width <= 0 || height <= 0) return
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(imageObj, 0, 0, width, height)
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resized-${file.name}`
      a.click()
      URL.revokeObjectURL(url)
    }, file.type)
  }

  return (
    <ToolPage 
      icon={Maximize2} 
      title="Resize Image" 
      color="#3b82f6" 
      bg="rgba(59, 130, 246, 0.1)"
      desc="Resize images to exact dimensions or scale proportionally.">
      
      <div className="tool-workspace">
        {!file ? (
          <ImageUpload onImageLoaded={setFile} />
        ) : (
          <>
            <div className="tool-controls">
              <div className="control-row">
                <div className="control-group">
                  <label>Width (px)</label>
                  <input type="number" className="styled-input" value={width} onChange={handleWidthChange} />
                </div>
                <div className="control-group">
                  <label>Height (px)</label>
                  <input type="number" className="styled-input" value={height} onChange={handleHeightChange} />
                </div>
              </div>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={maintainAspect} 
                  onChange={(e) => setMaintainAspect(e.target.checked)} 
                />
                Maintain Aspect Ratio
              </label>
              <div>
                <button className="styled-button" onClick={handleDownload}>
                  <Download size={18} /> Download Resized Image
                </button>
              </div>
            </div>
            
            <div className="preview-container">
              <img src={imageObj?.src} alt="Original preview" style={{ width: maintainAspect ? 'auto' : `${width}px`, height: maintainAspect ? 'auto' : `${height}px`, maxWidth: '100%' }} />
            </div>
          </>
        )}
      </div>
    </ToolPage>
  )
}
