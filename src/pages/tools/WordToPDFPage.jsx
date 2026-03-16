import { useState } from 'react'
import { FileOutput, Upload, Download, Loader } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { jsPDF } from 'jspdf'
import { ToolPage } from '../../components/ToolPage'
import { formatSize } from '../../utils/imageUtils'

export default function WordToPDFPage() {
  const [file,    setFile]    = useState(null)
  const [text,    setText]    = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [fontSize, setFontSize] = useState(12)
  const [margin,  setMargin]  = useState(40)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
    onDrop: async ([f]) => {
      setFile(f); setDone(false)
      if (f.name.endsWith('.txt')) {
        setText(await f.text())
      } else {
        // For .docx, extract text using mammoth
        try {
          const mammoth = await import('mammoth')
          const ab = await f.arrayBuffer()
          const res = await mammoth.extractRawText({ arrayBuffer: ab })
          setText(res.value)
        } catch {
          setText('[Could not extract text from .docx — paste text below]')
        }
      }
    }
  })

  function buildPDF() {
    if (!text.trim()) return
    setLoading(true)
    try {
      const pdf = new jsPDF({ unit:'pt', format:'a4' })
      const pw  = pdf.internal.pageSize.getWidth()
      const ph  = pdf.internal.pageSize.getHeight()
      const maxW = pw - margin * 2
      pdf.setFontSize(fontSize)
      pdf.setFont('helvetica','normal')

      const lines = pdf.splitTextToSize(text, maxW)
      let y = margin + fontSize

      lines.forEach(line => {
        if (y + fontSize > ph - margin) {
          pdf.addPage()
          y = margin + fontSize
        }
        pdf.text(line, margin, y)
        y += fontSize * 1.4
      })

      const name = file ? file.name.replace(/\.[^.]+$/, '') : 'document'
      pdf.save(`${name}.pdf`)
      setDone(true)
    } finally { setLoading(false) }
  }

  return (
    <ToolPage icon={FileOutput} title="Word to PDF" color="#2e7d32" bg="#e8f5e9"
      desc="Convert .txt or .docx files to a clean PDF. Paste text directly or upload a file.">
      <div style={{display:'flex',flexDirection:'column',gap:20}}>
        <div {...getRootProps()} style={{border:`2px dashed ${isDragActive?'#2e7d32':'#e0e0e0'}`,borderRadius:12,padding:24,textAlign:'center',cursor:'pointer',background:isDragActive?'#e8f5e9':'#fafafa',transition:'all 0.2s'}}>
          <input {...getInputProps()} />
          {file
            ? <p style={{fontSize:'0.88rem',color:'#444'}}><strong>{file.name}</strong> — {formatSize(file.size)}</p>
            : <p style={{fontSize:'0.88rem',color:'#888'}}>Drop a .txt or .docx file</p>
          }
        </div>

        <div>
          <label style={{fontSize:'0.72rem',fontWeight:700,color:'#888',letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:'var(--font-mono)',display:'block',marginBottom:8}}>Text Content</label>
          <textarea
            value={text} onChange={e=>setText(e.target.value)}
            placeholder="Type or paste your text here, or upload a file above…"
            style={{width:'100%',height:240,padding:16,background:'#f9fafb',border:'1px solid #e0e0e0',borderRadius:10,fontSize:'0.85rem',color:'#444',fontFamily:'var(--font-sans)',resize:'vertical',lineHeight:1.6,outline:'none'}}
          />
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,padding:16,background:'#f9fafb',borderRadius:10,border:'1px solid #e8ecf0'}}>
          <div>
            <label style={{fontSize:'0.68rem',fontWeight:700,color:'#888',letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:'var(--font-mono)'}}>Font Size — {fontSize}pt</label>
            <input type="range" min={8} max={24} step={1} value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} style={{width:'100%',marginTop:8}} />
          </div>
          <div>
            <label style={{fontSize:'0.68rem',fontWeight:700,color:'#888',letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:'var(--font-mono)'}}>Margin — {margin}pt</label>
            <input type="range" min={20} max={80} step={5} value={margin} onChange={e=>setMargin(Number(e.target.value))} style={{width:'100%',marginTop:8}} />
          </div>
        </div>

        <button onClick={buildPDF} disabled={loading||!text.trim()} style={{padding:'13px 28px',background:'linear-gradient(135deg,#2e7d32,#66bb6a)',color:'#fff',border:'none',borderRadius:10,fontSize:'0.9rem',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:(loading||!text.trim())?0.6:1,boxShadow:'0 4px 16px rgba(46,125,50,0.3)'}}>
          {loading ? <><Loader size={16} className="spin"/>Building PDF…</> : <><Download size={16}/>Convert to PDF</>}
        </button>
        {done && <div style={{padding:'12px 16px',background:'#f0fdf9',border:'1px solid #b2ece0',borderRadius:8,fontSize:'0.82rem',color:'#00a87a',fontWeight:600}}>✓ PDF downloaded!</div>}
      </div>
    </ToolPage>
  )
}