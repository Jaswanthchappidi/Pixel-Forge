import { Pipette, Copy, CheckCircle2 } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { ImageUpload } from '../../components/ImageUpload'
import { useState, useRef, useEffect } from 'react'
import './ToolStyles.css'

export default function ImageColorPickerPage() {
  const [file, setFile] = useState(null)
  const [colorHex, setColorHex] = useState('#000000')
  const [colorRgb, setColorRgb] = useState('rgb(0, 0, 0)')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
      }
      URL.revokeObjectURL(url)
    }
    img.src = url
  }, [file])

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    
    // Calculate click coordinates relative to the original image resolution
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const pixel = ctx.getImageData(x, y, 1, 1).data
    
    const r = pixel[0]
    const g = pixel[1]
    const b = pixel[2]
    
    setColorRgb(`rgb(${r}, ${g}, ${b})`)
    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
    setColorHex(hex)
    setCopied(false)
  }

  const handleCanvasMouseMove = () => {
     // Optional: could implement a hover magnifier here
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(colorHex)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolPage 
      icon={Pipette} 
      title="Image Color Picker" 
      color="#d97706" 
      bg="rgba(217, 119, 6, 0.1)"
      desc="Pick colors from any image and copy HEX values instantly.">
      
      <div className="tool-workspace">
        {!file ? (
          <ImageUpload onImageLoaded={setFile} />
        ) : (
          <>
            <div className="tool-controls" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  backgroundColor: colorHex, 
                  borderRadius: '12px',
                  border: '2px solid var(--border)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>{colorHex}</h2>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{colorRgb}</p>
                </div>
              </div>
              <button className="styled-button" onClick={copyToClipboard}>
                {copied ? <><CheckCircle2 size={18} /> Copied!</> : <><Copy size={18} /> Copy HEX</>}
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
              Click anywhere on the image to pick a color.
            </p>
            
            <div className="preview-container" style={{ padding: 0, background: 'transparent', cursor: 'crosshair' }}>
              <canvas 
                ref={canvasRef} 
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
                style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: '8px' }} 
              />
            </div>
          </>
        )}
      </div>
    </ToolPage>
  )
}
