import { Image as ImageIcon, Download } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { PDFUpload } from '../../components/PDFUpload'
import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
// We must set up the worker for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

import './ToolStyles.css'
import './PDFToolStyles.css'

export default function ExtractImagesPDFPage() {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedImages, setExtractedImages] = useState([]) // Array of data URLs

  const handleProcess = async () => {
    if (!file) return
    setIsProcessing(true)
    setExtractedImages([])
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      
      const images = []
      
      // Simple extraction strategy: render each page to an offscreen canvas
      // This technically renders the page as an image, effectively extracting the "visuals"
      // True internal object extraction is very complex and brittle in JS.
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2.0 }) // High res
        
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        }
        
        await page.render(renderContext).promise
        images.push(canvas.toDataURL('image/png'))
      }
      
      setExtractedImages(images)
    } catch (err) {
      console.error(err)
      alert('Error extracting images from PDF.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ToolPage 
      icon={ImageIcon} 
      title="Extract Images from PDF" 
      color="#ec4899" 
      bg="rgba(236, 72, 153, 0.1)"
      desc="Convert every page of a PDF document into a high-quality image.">
      
      <div className="pdf-workspace">
        {!file ? (
          <PDFUpload onPDFLoaded={setFile} />
        ) : extractedImages.length === 0 ? (
          <div className="tool-controls" style={{ alignItems: 'center', textAlign: 'center', padding: '40px' }}>
             <h3>Extract pages from {file.name} as images?</h3>
             <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button className="styled-button secondary" onClick={() => setFile(null)} disabled={isProcessing}>
                  Cancel
                </button>
                <button className="styled-button" onClick={handleProcess} disabled={isProcessing}>
                  {isProcessing ? 'Extracting...' : 'Extract Images'}
                </button>
             </div>
          </div>
        ) : (
          <div className="tool-controls">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'16px' }}>
               <h3 style={{margin:0}}>Extracted {extractedImages.length} Images</h3>
               <button className="styled-button secondary" onClick={() => {setFile(null); setExtractedImages([]);}}>
                  Start Over
               </button>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {extractedImages.map((src, i) => (
                  <div key={i} style={{ background: 'var(--surface3)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                    <img src={src} alt={`Page ${i+1}`} style={{ width: '100%', height: '200px', objectFit: 'contain', background: '#fff', borderRadius: '4px' }} />
                    <a href={src} download={`page_${i+1}.png`} className="styled-button" style={{ width: '100%', marginTop: '8px', justifyContent: 'center', boxSizing: 'border-box', textDecoration: 'none' }}>
                      <Download size={14} /> Download P. {i + 1}
                    </a>
                  </div>
                ))}
             </div>
             
          </div>
        )}
      </div>
    </ToolPage>
  )
}
