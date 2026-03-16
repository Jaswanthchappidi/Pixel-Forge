import { Sliders } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { ImageUpload } from '../../components/ImageUpload'
import { ImageEditor } from '../../components/ImageEditor'
import { BeforeAfter } from '../../components/BeforeAfter'
import { useState } from 'react'
import { Columns } from 'lucide-react'

export default function ImageEditorPage() {
  const [file, setFile] = useState(null)
  const [editedCanvas, setEditedCanvas] = useState(null)
  const [showBA, setShowBA] = useState(false)
  return (
    <ToolPage icon={Sliders} title="Image Editor" color="#7c3aed" bg="#f3eeff"
      desc="Crop, resize, rotate, flip, apply filters, add text watermarks, vignette and grain effects.">
      <div style={{display:'flex',flexDirection:'column',gap:24}}>
        <ImageUpload onImageLoaded={f=>{setFile(f);setEditedCanvas(null);setShowBA(false)}} />
        {file && <>
          <ImageEditor file={file} onEditedCanvas={setEditedCanvas} />
          {editedCanvas && (
            <button onClick={()=>setShowBA(v=>!v)} style={{display:'flex',alignItems:'center',gap:7,padding:'8px 16px',background:showBA?'#f3eeff':'#fff',border:'1.5px solid #7c3aed',color:'#7c3aed',borderRadius:8,fontSize:'0.8rem',fontWeight:600,cursor:'pointer',width:'fit-content'}}>
              <Columns size={13} /> Before / After
            </button>
          )}
          {showBA && <BeforeAfter originalFile={file} editedCanvas={editedCanvas} />}
        </>}
      </div>
    </ToolPage>
  )
}