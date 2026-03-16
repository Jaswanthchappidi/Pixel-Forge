import { Settings, FileText } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { PDFUpload } from '../../components/PDFUpload'
import { useState, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import { formatSize } from '../../utils/imageUtils'
import './ToolStyles.css'
import './PDFToolStyles.css'

export default function PDFMetadataPage() {
  const [file, setFile] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!file) return
    setLoading(true)
    setError('')
    
    const extractMetadata = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer, { updateMetadata: false })
        
        // Basic File Info
        const basicData = {
          name: file.name,
          size: formatSize(file.size),
          lastModified: new Date(file.lastModified).toLocaleString(),
        }
        
        // Core PDF Properties
        const pdfData = {
          title: pdfDoc.getTitle(),
          author: pdfDoc.getAuthor(),
          subject: pdfDoc.getSubject(),
          creator: pdfDoc.getCreator(),
          producer: pdfDoc.getProducer(),
          creationDate: pdfDoc.getCreationDate() ? pdfDoc.getCreationDate().toLocaleString() : null,
          modificationDate: pdfDoc.getModificationDate() ? pdfDoc.getModificationDate().toLocaleString() : null,
          layout: pdfDoc.getPageLayout(),
          mode: pdfDoc.getPageMode(),
          pageCount: pdfDoc.getPageCount(),
        }
        
        // Clean up empty string / null values for display
        const cleanedMetadata = {}
        for (const [key, value] of Object.entries({...basicData, ...pdfData})) {
          if (value !== undefined && value !== null && value !== '') {
            cleanedMetadata[key] = String(value)
          }
        }
        
        setMetadata(cleanedMetadata)
      } catch (err) {
        console.error(err)
        setError('Failed to extract metadata. The PDF might be corrupted or encrypted.')
      } finally {
        setLoading(false)
      }
    }
    
    extractMetadata()
  }, [file])

  return (
    <ToolPage 
      icon={Settings} 
      title="PDF Metadata Viewer" 
      color="#64748b" 
      bg="rgba(100, 116, 139, 0.1)"
      desc="View and analyze hidden properties and metadata in a PDF.">
      
      <div className="pdf-workspace">
        {!file ? (
          <PDFUpload onPDFLoaded={setFile} />
        ) : (
          <div className="tool-controls" style={{ alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <FileText size={32} color="var(--accent)" />
                <h3 style={{ margin: 0 }}>{file.name} Metadata</h3>
            </div>
            
            {loading ? (
              <p>Extracting data...</p>
            ) : error ? (
              <p style={{ color: 'var(--red)' }}>{error}</p>
            ) : metadata ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '20px' }}>
                <tbody>
                  {Object.entries(metadata).map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', textTransform: 'capitalize', width: '35%' }}>
                        {k.replace(/([A-Z])/g, ' $1').trim()}
                      </th>
                      <td style={{ padding: '12px 8px', color: 'var(--text-primary)', wordBreak: 'break-word' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            
            <button className="styled-button secondary" onClick={() => setFile(null)} style={{ marginTop: '10px' }}>
              Analyze Another PDF
            </button>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
