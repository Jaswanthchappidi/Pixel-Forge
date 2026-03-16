import { Type, Download } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { ImageUpload } from '../../components/ImageUpload'
import { useState, useEffect, useRef } from 'react'
import './ToolStyles.css'

export default function WatermarkImagePage() {
  const [file, setFile] = useState(null)
  const [imageObj, setImageObj] = useState(null)
  
  const [text, setText] = useState('My Watermark')
  const [color, setColor] = useState('#ffffff')
  const [opacity, setOpacity] = useState(50)
  const [size, setSize] = useState(48)
  const [position, setPosition] = useState('bottom-right')
  
  const canvasRef = useRef(null)

  const drawPreview = (img) => {
    const canvas = canvasRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')

    // Maintain aspect ratio, scale to max 800px width/height for preview
    const maxDim = 800
    let scale = 1
    if (img.width > maxDim || img.height > maxDim) {
       scale = Math.min(maxDim / img.width, maxDim / img.height)
    }
    
    canvas.width = img.width * scale
    canvas.height = img.height * scale
    
    // Draw original image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    
    // Draw Text Watermark
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold ${size}px Arial`
    
    // Parse color
    const c = document.createElement('canvas').getContext('2d')
    c.fillStyle = color
    const hex = c.fillStyle // normalizing
    let r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16)
    ctx.fillStyle = `rgba(${r},${g},${b},${opacity / 100})`

    let x = canvas.width / 2
    let y = canvas.height / 2
    
    if (position === 'top-left') { x=0; y=0; ctx.textAlign='left'; ctx.textBaseline='top'; }
    else if (position === 'top-center') { y=0; ctx.textBaseline='top'; }
    else if (position === 'top-right') { x=canvas.width; y=0; ctx.textAlign='right'; ctx.textBaseline='top'; }
    else if (position === 'bottom-left') { x=0; y=canvas.height; ctx.textAlign='left'; ctx.textBaseline='bottom'; }
    else if (position === 'bottom-center') { y=canvas.height; ctx.textBaseline='bottom'; }
    else if (position === 'bottom-right') { x=canvas.width; y=canvas.height; ctx.textAlign='right'; ctx.textBaseline='bottom'; }

    ctx.fillText(text, x, y)
  }

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setImageObj(img)
      drawPreview(img)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  useEffect(() => {
    if (imageObj) drawPreview(imageObj)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, color, opacity, size, position, imageObj])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `watermarked-${file.name}`
      a.click()
      URL.revokeObjectURL(url)
    }, file.type)
  }

  return (
    <ToolPage 
      icon={Type} 
      title="Watermark Image" 
      color="#8b5cf6" 
      bg="rgba(139, 92, 246, 0.1)"
      desc="Add text watermarks to your images to protect your work.">
      
      <div className="tool-workspace">
        {!file ? (
          <ImageUpload onImageLoaded={setFile} />
        ) : (
          <>
            <div className="tool-controls">
              <div className="control-row">
                <div className="control-group">
                  <label>Watermark Text</label>
                  <input type="text" className="styled-input" value={text} onChange={e => setText(e.target.value)} />
                </div>
                <div className="control-group">
                  <label>Position</label>
                  <select className="styled-input" value={position} onChange={e => setPosition(e.target.value)}>
                    <option value="top-left">Top Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                    <option value="center">Center</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
              </div>
              <div className="control-row">
                <div className="control-group">
                  <label>Color</label>
                  <input type="color" className="styled-input" style={{padding:0, height:'40px', width:'60px'}} value={color} onChange={e => setColor(e.target.value)} />
                </div>
                <div className="control-group">
                  <label>Size ({size}px)</label>
                  <input type="range" min="12" max="240" value={size} onChange={e => setSize(Number(e.target.value))} />
                </div>
                <div className="control-group">
                  <label>Opacity ({opacity}%)</label>
                  <input type="range" min="0" max="100" value={opacity} onChange={e => setOpacity(Number(e.target.value))} />
                </div>
              </div>
              <div>
                <button className="styled-button" onClick={handleDownload}>
                  <Download size={18} /> Download Watermarked Image
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
