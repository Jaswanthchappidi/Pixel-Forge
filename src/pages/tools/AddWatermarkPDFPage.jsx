import { Baseline, Download } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { PDFUpload } from '../../components/PDFUpload'
import { useState } from 'react'
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib'
import './ToolStyles.css'
import './PDFToolStyles.css'

export default function AddWatermarkPDFPage() {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [text, setText] = useState('CONFIDENTIAL')
  const [opacity, setOpacity] = useState(30)
  const [rotation, setRotation] = useState(45)
  const [fontSize, setFontSize] = useState(60)

  const handleProcess = async () => {
    if (!file) return
    setIsProcessing(true)
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const pages = pdfDoc.getPages()
      
      for (const page of pages) {
        const { width, height } = page.getSize()
        
        // Measure text
        const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize)
        const textHeight = fontSize
        
        // Center of page
        const x = width / 2 - textWidth / 2
        const y = height / 2 - textHeight / 2

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0.8, 0.2, 0.2), // Reddish
          opacity: opacity / 100,
          rotate: degrees(rotation),
        })
      }
      
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `watermarked_${file.name}`
      a.click()
      URL.revokeObjectURL(url)
      
    } catch (err) {
      console.error(err)
      alert(err.message || 'Error processing PDF.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ToolPage 
      icon={Baseline} 
      title="Add Watermark to PDF" 
      color="#6366f1" 
      bg="rgba(99, 102, 241, 0.1)"
      desc="Stamp text over your PDF in seconds.">
      
      <div className="pdf-workspace">
        {!file ? (
          <PDFUpload onPDFLoaded={setFile} />
        ) : (
          <div className="tool-controls">
             <div className="control-row">
                 <div className="control-group" style={{ flex: 1 }}>
                    <label>Watermark Text</label>
                    <input 
                      type="text" 
                      className="styled-input" 
                      value={text}
                      onChange={e => setText(e.target.value)}
                    />
                 </div>
             </div>
             <div className="control-row">
                 <div className="control-group">
                    <label>Font Size ({fontSize}px)</label>
                    <input 
                      type="range" min="12" max="150"
                      value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
                    />
                 </div>
                 <div className="control-group">
                    <label>Opacity ({opacity}%)</label>
                    <input 
                      type="range" min="5" max="100"
                      value={opacity} onChange={e => setOpacity(Number(e.target.value))}
                    />
                 </div>
                 <div className="control-group">
                    <label>Rotation ({rotation}°)</label>
                    <input 
                      type="range" min="0" max="360"
                      value={rotation} onChange={e => setRotation(Number(e.target.value))}
                    />
                 </div>
             </div>
             
             <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <button className="styled-button secondary" onClick={() => setFile(null)} disabled={isProcessing}>
                  Cancel
                </button>
                <button className="styled-button" onClick={handleProcess} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : <><Download size={18} /> Add Watermark & Download</>}
                </button>
             </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
