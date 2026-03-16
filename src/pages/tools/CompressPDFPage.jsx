import { FileMinus, Download } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { PDFUpload } from '../../components/PDFUpload'
import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { formatSize } from '../../utils/imageUtils'
import './ToolStyles.css'
import './PDFToolStyles.css'

export default function CompressPDFPage() {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)

  const handleProcess = async () => {
    if (!file) return
    setIsProcessing(true)
    
    try {
      // pdf-lib doesn't have true "compression" (like image downsampling)
      // but re-saving the document often optimizes its structure and removes unused objects.
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false })
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      setResult({
         url,
         newSize: blob.size,
         oldSize: file.size,
         name: `compressed_${file.name}`
      })
      
    } catch (err) {
      console.error(err)
      alert('Error compressing PDF. File might be encrypted or corrupted.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ToolPage 
      icon={FileMinus} 
      title="Compress PDF" 
      color="#10b981" 
      bg="rgba(16, 185, 129, 0.1)"
      desc="Reduce file size of your PDF while maintaining optimal quality.">
      
      <div className="pdf-workspace">
        {!file ? (
          <PDFUpload onPDFLoaded={setFile} />
        ) : !result ? (
          <div className="tool-controls" style={{ alignItems: 'center', textAlign: 'center', padding: '40px' }}>
             <h3>Ready to compress {file.name}</h3>
             <p style={{ color: 'var(--text-secondary)'}}>Original size: {formatSize(file.size)}</p>
             <p style={{ color: 'var(--text-secondary)', fontSize:'0.85rem', maxWidth: '400px', margin: '16px auto'}}>
                Note: Client-side compression works by rebuilding the PDF structure. Images inside the PDF are not downscaled.
             </p>
             
             <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button className="styled-button secondary" onClick={() => setFile(null)} disabled={isProcessing}>
                  Cancel
                </button>
                <button className="styled-button" onClick={handleProcess} disabled={isProcessing}>
                  {isProcessing ? 'Compressing...' : 'Compress PDF'}
                </button>
             </div>
          </div>
        ) : (
          <div className="tool-controls" style={{ alignItems: 'center', textAlign: 'center', padding: '40px' }}>
             <h3 style={{ color: 'var(--green)' }}>Compression Complete!</h3>
             <div style={{ margin: '20px 0', background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', display: 'inline-block' }}>
                <p style={{ margin: '0 0 8px 0'}}>Original: <strong>{formatSize(result.oldSize)}</strong></p>
                <p style={{ margin: '0 0 8px 0'}}>New Size: <strong style={{color:'var(--accent)'}}>{formatSize(result.newSize)}</strong></p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                   {result.newSize < result.oldSize 
                     ? `Saved ${formatSize(result.oldSize - result.newSize)}!` 
                     : "This PDF was already highly optimized."}
                </p>
             </div>
             
             <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button className="styled-button secondary" onClick={() => {setFile(null); setResult(null);}}>
                  Start Over
                </button>
                <a href={result.url} download={result.name} className="styled-button" style={{textDecoration:'none'}}>
                  <Download size={18} /> Download Computed PDF
                </a>
             </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
