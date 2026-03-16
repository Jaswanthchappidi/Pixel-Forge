import { Hash, Download } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { PDFUpload } from '../../components/PDFUpload'
import { useState } from 'react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import './ToolStyles.css'
import './PDFToolStyles.css'

export default function AddPageNumbersPDFPage() {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [position, setPosition] = useState('bottom-center')
  const [startNumber, setStartNumber] = useState(1)

  const handleProcess = async () => {
    if (!file) return
    setIsProcessing(true)
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const pages = pdfDoc.getPages()
      
      let counter = startNumber
      const margin = 30
      const fontSize = 12

      for (const page of pages) {
        const { width, height } = page.getSize()
        const text = String(counter)
        const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize)
        
        let x = margin
        let y = margin
        
        if (position === 'bottom-center') {
          x = (width / 2) - (textWidth / 2)
        } else if (position === 'bottom-right') {
          x = width - margin - textWidth
        } else if (position === 'top-left') {
          y = height - margin - fontSize
        } else if (position === 'top-center') {
          x = (width / 2) - (textWidth / 2)
          y = height - margin - fontSize
        } else if (position === 'top-right') {
          x = width - margin - textWidth
          y = height - margin - fontSize
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0, 0, 0), // Black
        })
        counter++
      }
      
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `numbered_${file.name}`
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
      icon={Hash} 
      title="Add Page Numbers" 
      color="#f97316" 
      bg="rgba(249, 115, 22, 0.1)"
      desc="Insert page numbers into PDF documents.">
      
      <div className="pdf-workspace">
        {!file ? (
          <PDFUpload onPDFLoaded={setFile} />
        ) : (
          <div className="tool-controls">
             <div className="control-row">
                 <div className="control-group">
                    <label>Position</label>
                    <select className="styled-input" value={position} onChange={e => setPosition(e.target.value)}>
                       <option value="bottom-left">Bottom Left</option>
                       <option value="bottom-center">Bottom Center</option>
                       <option value="bottom-right">Bottom Right</option>
                       <option value="top-left">Top Left</option>
                       <option value="top-center">Top Center</option>
                       <option value="top-right">Top Right</option>
                    </select>
                 </div>
                 <div className="control-group">
                    <label>Start Numbering At</label>
                    <input 
                      type="number" 
                      className="styled-input" 
                      value={startNumber}
                      onChange={e => setStartNumber(Number(e.target.value))}
                    />
                 </div>
             </div>
             
             <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <button className="styled-button secondary" onClick={() => setFile(null)} disabled={isProcessing}>
                  Cancel
                </button>
                <button className="styled-button" onClick={handleProcess} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : <><Download size={18} /> Add Numbers & Download</>}
                </button>
             </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
