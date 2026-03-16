import { useState } from 'react'
import { Code2, Copy, Check, Download } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { ToolPage } from '../../components/ToolPage'
import { formatSize } from '../../utils/imageUtils'

const TabBtn = ({ id, label, tab, setTab }) => (
  <button onClick={()=>setTab(id)} style={{padding:'8px 20px',background:tab===id?'#546e7a':'transparent',color:tab===id?'#fff':'#888',border:`1px solid ${tab===id?'#546e7a':'#e0e0e0'}`,borderRadius:8,fontSize:'0.82rem',fontWeight:600,cursor:'pointer',transition:'all 0.15s'}}>
    {label}
  </button>
)

export default function Base64Page() {
  const [file,    setFile]    = useState(null)
  const [b64,     setB64]     = useState('')
  const [copied,  setCopied]  = useState(false)
  const [decInput,setDecInput]= useState('')
  const [decUrl,  setDecUrl]  = useState('')
  const [tab,     setTab]     = useState('encode') // encode | decode

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {'image/*':[]}, multiple: false,
    onDrop: ([f]) => {
      setFile(f)
      const reader = new FileReader()
      reader.onload = () => setB64(reader.result)
      reader.readAsDataURL(f)
    }
  })

  function copy() {
    navigator.clipboard.writeText(b64)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function decode() {
    const raw = decInput.trim()
    if (!raw) return
    const url = raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`
    setDecUrl(url)
  }

  function downloadDecoded() {
    const a = document.createElement('a')
    a.href = decUrl
    a.download = 'decoded-image.png'
    a.click()
  }

  return (
    <ToolPage icon={Code2} title="Image to Base64" color="#546e7a" bg="#eceff1"
      desc="Convert any image to a Base64 data URL string, or decode a Base64 string back to an image.">
      <div style={{display:'flex',flexDirection:'column',gap:20}}>
        <div style={{display:'flex',gap:8}}>
          <TabBtn id="encode" label="Image → Base64" tab={tab} setTab={setTab} />
          <TabBtn id="decode" label="Base64 → Image" tab={tab} setTab={setTab} />
        </div>

        {tab === 'encode' && (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div {...getRootProps()} style={{border:`2px dashed ${isDragActive?'#546e7a':'#e0e0e0'}`,borderRadius:12,padding:24,textAlign:'center',cursor:'pointer',background:isDragActive?'#eceff1':'#fafafa',transition:'all 0.2s'}}>
              <input {...getInputProps()} />
              {file ? <p style={{fontSize:'0.88rem',color:'#444'}}><strong>{file.name}</strong> — {formatSize(file.size)}</p>
                    : <p style={{fontSize:'0.88rem',color:'#888'}}>Drop an image or click to browse</p>}
            </div>

            {b64 && (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:'0.78rem',color:'#555',fontFamily:'var(--font-mono)'}}>
                    {b64.length.toLocaleString()} chars · {formatSize(b64.length * 0.75)}
                  </span>
                  <button onClick={copy} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',background:copied?'#e8f5e9':'#fff',border:`1.5px solid ${copied?'#4caf50':'#546e7a'}`,color:copied?'#4caf50':'#546e7a',borderRadius:8,fontSize:'0.78rem',fontWeight:600,cursor:'pointer'}}>
                    {copied ? <><Check size={13}/> Copied!</> : <><Copy size={13}/> Copy</>}
                  </button>
                </div>
                <textarea readOnly value={b64}
                  style={{width:'100%',height:160,padding:14,background:'#f9fafb',border:'1px solid #e0e0e0',borderRadius:10,fontSize:'0.72rem',fontFamily:'var(--font-mono)',color:'#555',resize:'vertical',lineHeight:1.5}} />
                <p style={{fontSize:'0.72rem',color:'#aaa'}}>Use in HTML: <code style={{background:'#f5f5f5',padding:'1px 6px',borderRadius:4,fontFamily:'var(--font-mono)'}}>{'<img src="[paste here]" />'}</code></p>
              </div>
            )}
          </div>
        )}

        {tab === 'decode' && (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <label style={{fontSize:'0.72rem',fontWeight:700,color:'#888',letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:'var(--font-mono)',display:'block',marginBottom:8}}>Paste Base64 String</label>
              <textarea
                value={decInput} onChange={e=>setDecInput(e.target.value)}
                placeholder="Paste your base64 string here (with or without data:image/... prefix)…"
                style={{width:'100%',height:140,padding:14,background:'#f9fafb',border:'1px solid #e0e0e0',borderRadius:10,fontSize:'0.78rem',fontFamily:'var(--font-mono)',color:'#555',resize:'vertical',lineHeight:1.5,outline:'none'}}
              />
            </div>
            <button onClick={decode} disabled={!decInput.trim()} style={{padding:'11px 24px',background:'linear-gradient(135deg,#546e7a,#78909c)',color:'#fff',border:'none',borderRadius:10,fontSize:'0.88rem',fontWeight:700,cursor:'pointer',width:'fit-content',opacity:decInput.trim()?1:0.5}}>
              Decode Image
            </button>
            {decUrl && (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <img src={decUrl} alt="decoded" style={{maxWidth:'100%',maxHeight:320,objectFit:'contain',borderRadius:10,border:'1px solid #e0e0e0',background:'repeating-conic-gradient(#f0f0f0 0% 25%, #fff 0% 50%) 0 0 / 16px 16px'}} />
                <button onClick={downloadDecoded} style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',background:'#fff',border:'1.5px solid #546e7a',color:'#546e7a',borderRadius:8,fontSize:'0.82rem',fontWeight:600,cursor:'pointer',width:'fit-content'}}>
                  <Download size={14}/> Download Image
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}