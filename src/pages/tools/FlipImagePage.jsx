import { FlipHorizontal, FlipVertical, Download } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { ImageUpload } from '../../components/ImageUpload'
import { useState, useEffect } from 'react'
import './ToolStyles.css'

export default function FlipImagePage() {
  const [file, setFile] = useState(null)
  const [imageObj, setImageObj] = useState(null)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => setImageObj(img)
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleDownload = () => {
    if (!imageObj) return
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = imageObj.width
    canvas.height = imageObj.height

    ctx.translate(
      flipH ? canvas.width : 0,
      flipV ? canvas.height : 0
    )
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    ctx.drawImage(imageObj, 0, 0)

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `flipped-${file.name}`
      a.click()
      URL.revokeObjectURL(url)
    }, file.type)
  }

  return (
    <ToolPage 
      icon={FlipHorizontal} 
      title="Flip Image" 
      color="#6366f1" 
      bg="rgba(99, 102, 241, 0.1)"
      desc="Flip images horizontally or vertically.">
      
      <div className="tool-workspace">
        {!file ? (
          <ImageUpload onImageLoaded={setFile} />
        ) : (
          <>
            <div className="tool-controls">
              <div className="control-row">
                <button 
                  className={`styled-button ${flipH ? '' : 'secondary'}`} 
                  onClick={() => setFlipH(!flipH)}>
                  <FlipHorizontal size={18} /> Flip Horizontal
                </button>
                <button 
                  className={`styled-button ${flipV ? '' : 'secondary'}`} 
                  onClick={() => setFlipV(!flipV)}>
                  <FlipVertical size={18} /> Flip Vertical
                </button>
              </div>
              <div>
                <button className="styled-button" onClick={handleDownload}>
                  <Download size={18} /> Download Flipped Image
                </button>
              </div>
            </div>
            
            <div className="preview-container">
              <img 
                src={imageObj?.src} 
                alt="Flipped preview" 
                style={{ 
                  transform: `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
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
