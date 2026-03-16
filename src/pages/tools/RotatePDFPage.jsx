import { FileCog, RotateCw, Download } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { PDFUpload } from '../../components/PDFUpload'
import { useState } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import './ToolStyles.css'
import './PDFToolStyles.css'

export default function RotatePDFPage() {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pageRange, setPageRange] = useState('')
  const [rotation, setRotation] = useState(90) // 90, 180, 270

  const handleProcess = async () => {
    if (!file) return
    setIsProcessing(true)
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()
      const totalPages = pages.length
      
      let pagesToRotate = []
      
      if (pageRange.trim()) {
        const parts = pageRange.split(',')
        for (const part of parts) {
          const range = part.trim()
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(n => parseInt(n))
            if (start && end && start <= end) {
               for (let i = start; i <= end; i++) {
                 if (i > 0 && i <= totalPages) pagesToRotate.push(i - 1)
               }
            }
          } else {
            const pageNum = parseInt(range)
             if (pageNum && pageNum > 0 && pageNum <= totalPages) {
               pagesToRotate.push(pageNum - 1)
             }
          }
        }
      } else {
         pagesToRotate = Array.from({length: totalPages}, (_, i) => i)
      }
      
      pagesToRotate = [...new Set(pagesToRotate)]
      
      for (const idx of pagesToRotate) {
        const page = pages[idx]
        const currentRotation = page.getRotation().angle
        page.setRotation(degrees(currentRotation + rotation))
      }
      
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `rotated_${file.name}`
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
      icon={FileCog} 
      title="Rotate PDF" 
      color="#06b6d4" 
      bg="rgba(6, 182, 212, 0.1)"
      desc="Rotate specific PDF pages or all pages simultaneously.">
      
      <div className="pdf-workspace">
        {!file ? (
          <PDFUpload onPDFLoaded={setFile} />
        ) : (
          <div className="tool-controls">
             <div className="control-group">
                <label>Pages to Rotate (e.g. 1, 3-5)</label>
                <input 
                  type="text" 
                  className="styled-input" 
                  placeholder="Leave blank to rotate all pages" 
                  value={pageRange}
                  onChange={e => setPageRange(e.target.value)}
                />
             </div>
             <div className="control-group" style={{marginTop:'8px'}}>
                <label>Rotation Direction</label>
                <select className="styled-input" value={rotation} onChange={e => setRotation(Number(e.target.value))}>
                   <option value={90}>Right (90° Clockwise)</option>
                   <option value={-90}>Left (90° Counter-Clockwise)</option>
                   <option value={180}>Upside Down (180°)</option>
                </select>
             </div>
             
             <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <button className="styled-button secondary" onClick={() => setFile(null)} disabled={isProcessing}>
                  Cancel
                </button>
                <button className="styled-button" onClick={handleProcess} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : <><RotateCw size={18} /> Rotate PDF</>}
                </button>
             </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
