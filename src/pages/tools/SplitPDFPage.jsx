import { SplitSquareHorizontal, Download } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { PDFUpload } from '../../components/PDFUpload'
import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import './ToolStyles.css'
import './PDFToolStyles.css'

export default function SplitPDFPage() {
  const [file, setFile] = useState(null)
  const [pageRange, setPageRange] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleProcess = async () => {
    if (!file) return
    setIsProcessing(true)
    setError('')
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const totalPages = pdfDoc.getPageCount()
      
      const newPdf = await PDFDocument.create()
      let pagesToExtract = []
      
      // Parse ranges (e.g. "1, 3-5, 8")
      if (pageRange.trim()) {
        const parts = pageRange.split(',')
        for (const part of parts) {
          const range = part.trim()
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(n => parseInt(n))
            if (start && end && start <= end) {
              for (let i = start; i <= end; i++) {
                if (i > 0 && i <= totalPages) pagesToExtract.push(i - 1) // 0-indexed
              }
            }
          } else {
            const pageNum = parseInt(range)
            if (pageNum && pageNum > 0 && pageNum <= totalPages) {
              pagesToExtract.push(pageNum - 1)
            }
          }
        }
      } else {
         // if empty, assume all pages
         pagesToExtract = Array.from({length: totalPages}, (_, i) => i)
      }
      
      // Remove duplicates and sort
      pagesToExtract = [...new Set(pagesToExtract)].sort((a,b) => a-b)
      
      if (pagesToExtract.length === 0) {
        throw new Error("Invalid page range specified.")
      }
      
      const copiedPages = await newPdf.copyPages(pdfDoc, pagesToExtract)
      copiedPages.forEach(page => newPdf.addPage(page))
      
      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `extracted_${file.name}`
      a.click()
      URL.revokeObjectURL(url)
      
    } catch (err) {
      console.error(err)
      setError(err.message || 'An error occurred while processing the PDF.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ToolPage 
      icon={SplitSquareHorizontal} 
      title="Split PDF" 
      color="#8b5cf6" 
      bg="rgba(139, 92, 246, 0.1)"
      desc="Extract specific pages from your PDF file.">
      
      <div className="pdf-workspace">
        {!file ? (
          <PDFUpload onPDFLoaded={setFile} />
        ) : (
          <div className="tool-controls">
             <div className="control-group">
                <label>Pages to Extract (e.g. 1, 3-5, 8)</label>
                <input 
                  type="text" 
                  className="styled-input" 
                  placeholder="Leave blank to extract all" 
                  value={pageRange}
                  onChange={e => setPageRange(e.target.value)}
                />
             </div>
             
             {error && <div style={{color: 'var(--red)', fontSize: '0.9rem'}}>{error}</div>}
             
             <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <button className="styled-button secondary" onClick={() => setFile(null)} disabled={isProcessing}>
                  Cancel
                </button>
                <button className="styled-button" onClick={handleProcess} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : <><Download size={18} /> Download Extracted PDF</>}
                </button>
             </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
