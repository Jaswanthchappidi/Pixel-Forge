import { useState, useCallback } from 'react'
import { Files, Upload, X, ArrowUp, ArrowDown, Download, Loader } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { ToolPage } from '../../components/ToolPage'
import { formatSize } from '../../utils/imageUtils'

export default function MergePDFPage() {
  const [files,   setFiles]   = useState([])
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState(null)

  const onDrop = useCallback((accepted) => {
    const newFiles = accepted.map(f => ({ file: f, id: Date.now() + Math.random() }))
    setFiles(prev => [...prev, ...newFiles])
    setDone(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: {'application/pdf':['.pdf']}, multiple: true
  })

  const remove  = id  => setFiles(prev => prev.filter(f => f.id !== id))
  const moveUp  = idx => setFiles(prev => { if(!idx) return prev; const a=[...prev]; [a[idx-1],a[idx]]=[a[idx],a[idx-1]]; return a })
  const moveDown= idx => setFiles(prev => { if(idx===prev.length-1) return prev; const a=[...prev]; [a[idx],a[idx+1]]=[a[idx+1],a[idx]]; return a })

  async function mergePDFs() {
    if (files.length < 2) return
    setLoading(true); setError(null)
    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
      const { jsPDF } = await import('jspdf')

      const pdf = new jsPDF({ unit:'pt', format:'a4' })
      let isFirst = true

      for (const { file } of files) {
        const ab = await file.arrayBuffer()
        const srcPdf = await pdfjsLib.getDocument({ data: ab }).promise

        for (let i = 1; i <= srcPdf.numPages; i++) {
          const page = await srcPdf.getPage(i)
          const vp   = page.getViewport({ scale: 1 })
          const cv   = document.createElement('canvas')
          cv.width   = vp.width; cv.height = vp.height
          await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise

          const imgData = cv.toDataURL('image/jpeg', 0.85)
          if (!isFirst) pdf.addPage([vp.width, vp.height])
          else pdf.internal.pageSize = { width: vp.width, height: vp.height }
          pdf.addImage(imgData, 'JPEG', 0, 0, vp.width, vp.height)
          isFirst = false
        }
      }

      pdf.save('merged.pdf')
      setDone(true)
    } catch(e) {
      setError(e.message || 'Merge failed')
    } finally { setLoading(false) }
  }

  return (
    <ToolPage icon={Files} title="Merge PDF" color="#f57c00" bg="#fff8e1"
      desc="Combine multiple PDF files into one. Drag to reorder before merging.">
      <div style={{display:'flex',flexDirection:'column',gap:20}}>
        <div {...getRootProps()} style={{border:`2px dashed ${isDragActive?'#f57c00':'#e0e0e0'}`,borderRadius:12,padding:28,textAlign:'center',cursor:'pointer',background:isDragActive?'#fff8e1':'#fafafa',transition:'all 0.2s'}}>
          <input {...getInputProps()} />
          <Files size={24} style={{margin:'0 auto 10px',color:isDragActive?'#f57c00':'#bbb',display:'block'}} />
          <p style={{fontSize:'0.88rem',color:'#888'}}>{isDragActive?'Drop PDFs here':'Drop PDF files or click to browse'}</p>
        </div>

        {files.length > 0 && (
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <span style={{fontSize:'0.8rem',fontWeight:600,color:'#555'}}>{files.length} PDF{files.length>1?'s':''} — drag arrows to reorder</span>
              <button onClick={()=>setFiles([])} style={{fontSize:'0.72rem',color:'#f44336',background:'transparent',border:'none',cursor:'pointer'}}>Clear all</button>
            </div>
            {files.map(({file,id},i) => (
              <div key={id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'#fff',border:'1px solid #e8ecf0',borderRadius:8}}>
                <span style={{fontSize:'0.78rem',fontWeight:700,color:'#f57c00',fontFamily:'var(--font-mono)',minWidth:24}}>#{i+1}</span>
                <span style={{fontSize:'0.8rem',color:'#555',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.name}</span>
                <span style={{fontSize:'0.68rem',color:'#aaa',fontFamily:'var(--font-mono)'}}>{formatSize(file.size)}</span>
                <div style={{display:'flex',gap:4}}>
                  <button onClick={()=>moveUp(i)} style={{padding:'4px',background:'#f5f7fa',border:'1px solid #e0e0e0',borderRadius:5,cursor:'pointer',display:'flex',alignItems:'center'}}><ArrowUp size={12}/></button>
                  <button onClick={()=>moveDown(i)} style={{padding:'4px',background:'#f5f7fa',border:'1px solid #e0e0e0',borderRadius:5,cursor:'pointer',display:'flex',alignItems:'center'}}><ArrowDown size={12}/></button>
                  <button onClick={()=>remove(id)} style={{padding:'4px',background:'#fff5f5',border:'1px solid #fcc',borderRadius:5,cursor:'pointer',display:'flex',alignItems:'center',color:'#e44'}}><X size={12}/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {files.length >= 2 && (
          <button onClick={mergePDFs} disabled={loading} style={{padding:'13px 28px',background:'linear-gradient(135deg,#f57c00,#ffb74d)',color:'#fff',border:'none',borderRadius:10,fontSize:'0.9rem',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:loading?0.7:1,boxShadow:'0 4px 16px rgba(245,124,0,0.3)'}}>
            {loading?<><Loader size={16} className="spin"/>Merging…</>:<><Download size={16}/>Merge {files.length} PDFs</>}
          </button>
        )}
        {files.length === 1 && <p style={{fontSize:'0.8rem',color:'#aaa',textAlign:'center'}}>Add at least one more PDF to merge</p>}
        {done && <div style={{padding:'12px 16px',background:'#f0fdf9',border:'1px solid #b2ece0',borderRadius:8,fontSize:'0.82rem',color:'#00a87a',fontWeight:600}}>✓ Merged PDF downloaded!</div>}
        {error && <div style={{padding:'12px 16px',background:'#fff5f5',border:'1px solid #fcc',borderRadius:8,fontSize:'0.82rem',color:'#e44'}}>{error}</div>}
      </div>
    </ToolPage>
  )
}