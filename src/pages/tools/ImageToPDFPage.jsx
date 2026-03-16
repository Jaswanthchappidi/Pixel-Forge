import { useState, useCallback } from 'react'
import { FilePlus, Upload, X, Download, Loader, ArrowUp, ArrowDown } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { jsPDF } from 'jspdf'
import { ToolPage } from '../../components/ToolPage'
import { formatSize } from '../../utils/imageUtils'

export default function ImageToPDFPage() {
  const [images,  setImages]  = useState([])
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [pageSize, setPageSize] = useState('a4')
  const [fit,     setFit]     = useState('fit')  // fit | fill | original

  const onDrop = useCallback((accepted) => {
    const newFiles = accepted.map(f => ({ file: f, url: URL.createObjectURL(f), id: Date.now() + Math.random() }))
    setImages(prev => [...prev, ...newFiles])
    setDone(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: {'image/*':[]}, multiple: true
  })

  const remove = (id) => setImages(prev => prev.filter(i => i.id !== id))
  const moveUp = (idx) => {
    if (idx === 0) return
    setImages(prev => { const a=[...prev]; [a[idx-1],a[idx]]=[a[idx],a[idx-1]]; return a })
  }
  const moveDown = (idx) => {
    setImages(prev => { if (idx===prev.length-1) return prev; const a=[...prev]; [a[idx],a[idx+1]]=[a[idx+1],a[idx]]; return a })
  }

  async function buildPDF() {
    if (!images.length) return
    setLoading(true)
    try {
      const sizes = { a4:[595,842], a3:[842,1191], letter:[612,792], square:[595,595] }
      const [pw,ph] = sizes[pageSize] || sizes.a4

      const pdf = new jsPDF({ unit:'pt', format:[pw,ph], orientation:'portrait' })
      let first = true

      for (const { url } of images) {
        const img = await loadImg(url)
        let iw = img.width, ih = img.height
        let x=0,y=0,w=pw,h=ph

        if (fit === 'fit') {
          const scale = Math.min(pw/iw, ph/ih)
          w = iw*scale; h = ih*scale
          x = (pw-w)/2; y = (ph-h)/2
        } else if (fit === 'original') {
          w=iw; h=ih; x=(pw-w)/2; y=(ph-h)/2
        }

        if (!first) pdf.addPage([pw,ph])
        pdf.addImage(img, 'JPEG', x, y, w, h)
        first = false
      }

      pdf.save('pixelforge-images.pdf')
      setDone(true)
    } finally { setLoading(false) }
  }

  function loadImg(url) {
    return new Promise(res => {
      const i = new Image()
      i.onload = () => res(i)
      i.src = url
    })
  }

  return (
    <ToolPage icon={FilePlus} title="Image to PDF" color="#e91e63" bg="#fce4ec"
      desc="Combine one or more images into a single PDF. Drag to reorder pages before converting.">
      <div style={{display:'flex',flexDirection:'column',gap:20}}>
        {/* Drop zone */}
        <div {...getRootProps()} style={{border:`2px dashed ${isDragActive?'#e91e63':'#e0e0e0'}`,borderRadius:12,padding:28,textAlign:'center',cursor:'pointer',background:isDragActive?'#fce4ec':'#fafafa',transition:'all 0.2s'}}>
          <input {...getInputProps()} />
          <Upload size={22} style={{margin:'0 auto 10px',color:isDragActive?'#e91e63':'#bbb',display:'block'}} />
          <p style={{fontSize:'0.88rem',color:'#888'}}>{isDragActive?'Drop images here':'Drop images or click to browse'}</p>
          <p style={{fontSize:'0.72rem',color:'#bbb',marginTop:4}}>PNG · JPEG · WebP · GIF · BMP</p>
        </div>

        {/* Image list */}
        {images.length > 0 && (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:'0.8rem',fontWeight:600,color:'#555'}}>{images.length} image{images.length>1?'s':''} — drag to reorder</span>
              <button onClick={()=>setImages([])} style={{fontSize:'0.72rem',color:'#f44336',background:'transparent',border:'none',cursor:'pointer'}}>Clear all</button>
            </div>
            {images.map((img,i) => (
              <div key={img.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:'#fff',border:'1px solid #e8ecf0',borderRadius:8}}>
                <img src={img.url} style={{width:40,height:40,objectFit:'cover',borderRadius:5,flexShrink:0}} />
                <span style={{fontSize:'0.8rem',color:'#555',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{img.file.name}</span>
                <span style={{fontSize:'0.7rem',color:'#aaa',fontFamily:'var(--font-mono)',flexShrink:0}}>{formatSize(img.file.size)}</span>
                <div style={{display:'flex',gap:4}}>
                  <button onClick={()=>moveUp(i)} style={{padding:'4px',background:'#f5f7fa',border:'1px solid #e0e0e0',borderRadius:5,cursor:'pointer',display:'flex',alignItems:'center'}}><ArrowUp size={12}/></button>
                  <button onClick={()=>moveDown(i)} style={{padding:'4px',background:'#f5f7fa',border:'1px solid #e0e0e0',borderRadius:5,cursor:'pointer',display:'flex',alignItems:'center'}}><ArrowDown size={12}/></button>
                  <button onClick={()=>remove(img.id)} style={{padding:'4px',background:'#fff5f5',border:'1px solid #fcc',borderRadius:5,cursor:'pointer',display:'flex',alignItems:'center',color:'#e44'}}><X size={12}/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Options */}
        {images.length > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,padding:16,background:'#f9fafb',borderRadius:10,border:'1px solid #e8ecf0'}}>
            <div>
              <label style={{fontSize:'0.68rem',fontWeight:700,color:'#888',letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:'var(--font-mono)'}}>Page Size</label>
              <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                {['a4','a3','letter','square'].map(s=>(
                  <button key={s} onClick={()=>setPageSize(s)} style={{padding:'6px 12px',background:pageSize===s?'#e91e63':'#fff',color:pageSize===s?'#fff':'#555',border:`1.5px solid ${pageSize===s?'#e91e63':'#e0e0e0'}`,borderRadius:7,fontSize:'0.75rem',fontWeight:600,cursor:'pointer',textTransform:'uppercase'}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{fontSize:'0.68rem',fontWeight:700,color:'#888',letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:'var(--font-mono)'}}>Image Fit</label>
              <div style={{display:'flex',gap:6,marginTop:8}}>
                {[{v:'fit',l:'Fit'},{v:'fill',l:'Fill'},{v:'original',l:'Original'}].map(({v,l})=>(
                  <button key={v} onClick={()=>setFit(v)} style={{padding:'6px 12px',background:fit===v?'#e91e63':'#fff',color:fit===v?'#fff':'#555',border:`1.5px solid ${fit===v?'#e91e63':'#e0e0e0'}`,borderRadius:7,fontSize:'0.75rem',fontWeight:600,cursor:'pointer'}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {images.length > 0 && (
          <button onClick={buildPDF} disabled={loading} style={{padding:'13px 28px',background:'linear-gradient(135deg,#e91e63,#f06292)',color:'#fff',border:'none',borderRadius:10,fontSize:'0.9rem',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:loading?0.7:1,boxShadow:'0 4px 16px rgba(233,30,99,0.3)'}}>
            {loading ? <><Loader size={16} className="spin" /> Building PDF…</> : <><FilePlus size={16} /> Create PDF ({images.length} page{images.length>1?'s':''})</>}
          </button>
        )}
        {done && <div style={{padding:'12px 16px',background:'#f0fdf9',border:'1px solid #b2ece0',borderRadius:8,fontSize:'0.82rem',color:'#00a87a',fontWeight:600}}>✓ PDF downloaded successfully!</div>}
      </div>
    </ToolPage>
  )
}