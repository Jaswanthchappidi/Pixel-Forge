import { Sparkles, Download } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { ImageUpload } from '../../components/ImageUpload'
import { useState, useRef, useEffect, useCallback } from 'react'
import './ToolStyles.css'

export default function ImageSharpenPage() {
  const [file, setFile] = useState(null)
  const [imageObj, setImageObj] = useState(null)
  const [sharpenAmount, setSharpenAmount] = useState(50) // 0 to 100
  const [isProcessing, setIsProcessing] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setImageObj(img)
      drawPreview(img, sharpenAmount)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  // Debounced draw to prevent UI freeze while dragging slider
  useEffect(() => {
    if (!imageObj) return
    const timer = setTimeout(() => {
      drawPreview(imageObj, sharpenAmount)
    }, 150)
    return () => clearTimeout(timer)
  }, [sharpenAmount, imageObj, drawPreview])

  const drawPreview = useCallback((img, amount) => {
    const canvas = canvasRef.current
    if (!canvas || !img) return
    setIsProcessing(true)
    
    // We defer the heavy processing slightly to let the UI update the "isProcessing" state
    setTimeout(() => {
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw original first
      ctx.drawImage(img, 0, 0)
      
      if (amount > 0) {
        // Apply sharpen convolution
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const w = imageData.width
        const h = imageData.height
        const w4 = w * 4
        
        // Map 0-100 to a sharpening value between 1 and 10 approx
        const mix = amount / 100
        
        // Kernel for sharpening
        //  0  -1   0
        // -1  5*m -1
        //  0  -1   0
        // We calculate weights
        const center = (4 * mix) + 1
        const edge = -mix
        
        // Output buffer
        const output = new Uint8ClampedArray(data.length)
        
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const i = (y * w + x) * 4
            
            for (let c = 0; c < 3; c++) { // R, G, B
              let val = 
                data[i - w4 + c] * edge + // Top
                data[i - 4 + c] * edge +  // Left
                data[i + c] * center +    // Center
                data[i + 4 + c] * edge +  // Right
                data[i + w4 + c] * edge   // Bottom
              
              output[i + c] = val
            }
            output[i + 3] = data[i + 3] // Alpha stays same
          }
        }
        
        // Copy edges (unprocessed)
        for (let x = 0; x < w; x++) {
          const top = (x) * 4
          const bottom = ((h - 1) * w + x) * 4
          for(let i=0; i<4; i++) { output[top+i] = data[top+i]; output[bottom+i] = data[bottom+i]; }
        }
        for (let y = 0; y < h; y++) {
          const left = (y * w) * 4
          const right = (y * w + w - 1) * 4
          for(let i=0; i<4; i++) { output[left+i] = data[left+i]; output[right+i] = data[right+i]; }
        }
        
        imageData.data.set(output)
        ctx.putImageData(imageData, 0, 0)
      }
      setIsProcessing(false)
    }, 10)
  }, [])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sharpened-${file.name}`
      a.click()
      URL.revokeObjectURL(url)
    }, file.type)
  }

  return (
    <ToolPage 
      icon={Sparkles} 
      title="Image Sharpen Tool" 
      color="#db2777" 
      bg="rgba(219, 39, 119, 0.1)"
      desc="Enhance edge contrast for a crisper look.">
      
      <div className="tool-workspace">
        {!file ? (
          <ImageUpload onImageLoaded={setFile} />
        ) : (
          <>
            <div className="tool-controls">
              <div className="control-row">
                <div className="control-group" style={{ flex: 1 }}>
                  <label>Sharpen Intensity ({sharpenAmount}%) {isProcessing && <span style={{color:'var(--accent)'}}>(Processing...)</span>}</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sharpenAmount} 
                    onChange={e => setSharpenAmount(Number(e.target.value))} 
                  />
                </div>
              </div>
              <div>
                <button className="styled-button" onClick={handleDownload} disabled={isProcessing}>
                  <Download size={18} /> Download Sharpened Image
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
