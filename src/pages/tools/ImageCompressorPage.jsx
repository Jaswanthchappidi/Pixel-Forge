import { Minimize2 } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import { formatSize, downloadBlob } from '../../utils/imageUtils'
import { saveImage } from '../../utils/storage'

export default function ImageCompressorPage() {
  const [file,    setFile]    = useState(null)
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [maxMB,   setMaxMB]   = useState(1)
  const [quality, setQuality] = useState(80)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {'image/*':[]}, multiple: false,
    onDrop: ([f]) => { setFile(f); setResult(null) }
  })

  async function compress() {
    if (!file) return
    setLoading(true)
    try {
      const out = await imageCompression(file, { maxSizeMB: maxMB, maxWidthOrHeight: 1920, useWebWorker: true, initialQuality: quality/100 })
      const name = `${file.name.replace(/\.[^.]+$/,'')}_compressed${file.name.match(/\.[^.]+$/)?.[0]||'.jpg'}`
      await saveImage(out, { name, format: out.type.split('/')[1] })
      setResult({ blob: out, size: out.size, name })
    } finally { setLoading(false) }
  }

  const savings = result ? Math.round((1 - result.size / file.size) * 100) : null

  return (
    <ToolPage icon={Minimize2} title="Image Compressor" color="#00c9a7" bg="#e6faf7"
      desc="Reduce image file size without losing visible quality. Supports JPEG, PNG and WebP.">
      <div style={{display:'flex',flexDirection:'column',gap:24}}>
        <div {...getRootProps()} style={{border:`2px dashed ${isDragActive?'#00c9a7':'#e0e0e0'}`,borderRadius:12,padding:32,textAlign:'center',cursor:'pointer',background:isDragActive?'#f0fdf9':'#fafafa',transition:'all 0.2s'}}>
          <input {...getInputProps()} />
          {file ? <p style={{fontSize:'0.9rem',color:'#444'}}><strong>{file.name}</strong> — {formatSize(file.size)}</p>
                : <p style={{fontSize:'0.9rem',color:'#999'}}>Drop an image or click to browse</p>}
        </div>

        {file && (
          <div style={{display:'flex',flexDirection:'column',gap:16,padding:20,background:'#f9fafb',borderRadius:12,border:'1px solid #e8ecf0'}}>
            <div>
              <label style={{fontSize:'0.72rem',fontWeight:700,color:'#888',letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:'var(--font-mono)'}}>Max Size (MB) — {maxMB} MB</label>
              <input type="range" min={0.1} max={10} step={0.1} value={maxMB} onChange={e=>setMaxMB(Number(e.target.value))} style={{width:'100%',marginTop:8}} />
            </div>
            <div>
              <label style={{fontSize:'0.72rem',fontWeight:700,color:'#888',letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:'var(--font-mono)'}}>Quality — {quality}%</label>
              <input type="range" min={10} max={100} step={5} value={quality} onChange={e=>setQuality(Number(e.target.value))} style={{width:'100%',marginTop:8}} />
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',background:'#fff',borderRadius:8,border:'1px solid #e8ecf0'}}>
              <span style={{fontSize:'0.82rem',color:'#555'}}>Original: <strong>{formatSize(file.size)}</strong></span>
              <span style={{color:'#ccc'}}>→</span>
              {result && <span style={{fontSize:'0.82rem',color:'#00a87a',fontWeight:700}}>{formatSize(result.size)} <span style={{background:'#00c9a7',color:'#fff',borderRadius:100,padding:'1px 7px',fontSize:'0.65rem',fontWeight:800}}>-{savings}%</span></span>}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={compress} disabled={loading} style={{flex:1,padding:'12px 24px',background:'linear-gradient(135deg,#00c9a7,#0096ff)',color:'#fff',border:'none',borderRadius:10,fontSize:'0.88rem',fontWeight:700,cursor:'pointer',opacity:loading?0.6:1}}>
                {loading ? 'Compressing…' : 'Compress Image'}
              </button>
              {result && <button onClick={()=>downloadBlob(result.blob,result.name)} style={{padding:'12px 20px',background:'#fff',border:'1.5px solid #00c9a7',color:'#00a87a',borderRadius:10,fontSize:'0.85rem',fontWeight:600,cursor:'pointer'}}>Download</button>}
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}