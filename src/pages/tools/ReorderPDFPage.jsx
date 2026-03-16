import { ListOrdered, Download } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { PDFUpload } from '../../components/PDFUpload'
import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import './ToolStyles.css'
import './PDFToolStyles.css'

export default function ReorderPDFPage() {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderString, setOrderString] = useState('')
  const [error, setError] = useState('')

  const handleProcess = async () => {
    if (!file) return
    if (!orderString.trim()) {
      setError("Please provide a new page order.")
      return
    }
    
    setIsProcessing(true)
    setError('')
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const totalPages = pdfDoc.getPageCount()
      
      const indices = orderString.split(',').map(s => parseInt(s.trim()))
      
      const validIndices = []
      for (const idx of indices) {
        if (isNaN(idx) || idx < 1 || idx > totalPages) {
          throw new Error(`Invalid page number: ${idx}. Must be between 1 and ${totalPages}.`)
        }
        validIndices.push(idx - 1) // 0-indexed
      }
      
      const newPdf = await PDFDocument.create()
      const copiedPages = await newPdf.copyPages(pdfDoc, validIndices)
      copiedPages.forEach(page => newPdf.addPage(page))
      
      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `reordered_${file.name}`
      a.click()
      URL.revokeObjectURL(url)
      
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error processing PDF.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ToolPage 
      icon={ListOrdered} 
      title="Reorder PDF Pages" 
      color="#3b82f6" 
      bg="rgba(59, 130, 246, 0.1)"
      desc="Rearrange or delete pages from your PDF document easily.">
      
      <div className="pdf-workspace">
        {!file ? (
          <PDFUpload onPDFLoaded={setFile} />
        ) : (
          <div className="tool-controls">
             <div className="control-group">
                <label>New Page Order (comma separated)</label>
                <input 
                  type="text" 
                  className="styled-input" 
                  placeholder="e.g. 5, 4, 3, 2, 1" 
                  value={orderString}
                  onChange={e => setOrderString(e.target.value)}
                />
                <small style={{color:'var(--text-secondary)'}}>
                  Example: If you want to swap pages 1 and 2, and omit page 3, type: <code>2, 1</code>
                </small>
             </div>
             
             {error && <div style={{color: 'var(--red)', fontSize: '0.9rem'}}>{error}</div>}
             
             <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <button className="styled-button secondary" onClick={() => setFile(null)} disabled={isProcessing}>
                  Cancel
                </button>
                <button className="styled-button" onClick={handleProcess} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : <><Download size={18} /> Apply and Download</>}
                </button>
             </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
