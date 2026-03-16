import { useState } from 'react'
import { FileText, Upload, Download, Loader, AlertCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { ToolPage } from '../../components/ToolPage'
import { formatSize } from '../../utils/imageUtils'

export default function PDFToWordPage() {
  const [file,    setFile]    = useState(null)
  const [text,    setText]    = useState('')
  const [status,  setStatus]  = useState('idle')
  const [error,   setError]   = useState(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {'application/pdf':['.pdf']}, multiple: false,
    onDrop: ([f]) => { setFile(f); setText(''); setStatus('idle'); setError(null) }
  })

  async function extractText() {
    if (!file) return
    setStatus('loading'); setError(null)
    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
      const ab  = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise
      let full  = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page    = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items.map(item => item.str).join(' ')
        full += `--- Page ${i} ---\n${pageText}\n\n`
      }
      setText(full)
      setStatus('done')
    } catch(e) {
      setError(e.message || 'Failed to extract text')
      setStatus('error')
    }
  }

  function downloadDocx() {
    // Create a simple RTF/text file (true DOCX needs server-side)
    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${file.name.replace('.pdf','')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolPage icon={FileText} title="PDF to Word" color="#1976d2" bg="#e3f2fd"
      desc="Extract all text from a PDF and export it as a Word-compatible document. Runs entirely in your browser.">
      <div style={{display:'flex',flexDirection:'column',gap:20}}>
        <div {...getRootProps()} style={{border:`2px dashed ${isDragActive?'#1976d2':'#e0e0e0'}`,borderRadius:12,padding:28,textAlign:'center',cursor:'pointer',background:isDragActive?'#e3f2fd':'#fafafa',transition:'all 0.2s'}}>
          <input {...getInputProps()} />
          <FileText size={24} style={{margin:'0 auto 10px',color:isDragActive?'#1976d2':'#bbb',display:'block'}} />
          {file
            ? <p style={{fontSize:'0.9rem',color:'#444'}}><strong>{file.name}</strong> — {formatSize(file.size)}</p>
            : <p style={{fontSize:'0.88rem',color:'#888'}}>Drop a PDF or click to browse</p>
          }
        </div>

        {file && status === 'idle' && (
          <button onClick={extractText} style={{padding:'13px 28px',background:'linear-gradient(135deg,#1976d2,#42a5f5)',color:'#fff',border:'none',borderRadius:10,fontSize:'0.9rem',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(25,118,210,0.3)'}}>
            Extract Text from PDF
          </button>
        )}

        {status === 'loading' && (
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'16px',background:'#f0f7ff',borderRadius:10,color:'#1976d2',fontSize:'0.85rem'}}>
            <Loader size={16} className="spin" /> Reading PDF pages…
          </div>
        )}

        {status === 'error' && (
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:'#fff5f5',border:'1px solid #fcc',borderRadius:8,color:'#e44',fontSize:'0.82rem'}}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {status === 'done' && text && (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:'0.8rem',color:'#555',fontWeight:600}}>Extracted text preview</span>
              <button onClick={downloadDocx} style={{display:'flex',alignItems:'center',gap:7,padding:'8px 16px',background:'#fff',border:'1.5px solid #1976d2',color:'#1976d2',borderRadius:8,fontSize:'0.8rem',fontWeight:600,cursor:'pointer'}}>
                <Download size={14} /> Download .txt
              </button>
            </div>
            <textarea
              readOnly value={text}
              style={{width:'100%',height:320,padding:16,background:'#f9fafb',border:'1px solid #e0e0e0',borderRadius:10,fontSize:'0.82rem',color:'#444',fontFamily:'var(--font-mono)',resize:'vertical',lineHeight:1.6}}
            />
          </div>
        )}
      </div>
    </ToolPage>
  )
}