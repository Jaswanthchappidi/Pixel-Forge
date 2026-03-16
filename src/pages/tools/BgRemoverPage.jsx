import { Sparkles } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { ImageUpload } from '../../components/ImageUpload'
import { BgRemoval } from '../../components/BgRemoval'
import { useState } from 'react'
export default function BgRemoverPage() {
  const [file, setFile] = useState(null)
  return (
    <ToolPage icon={Sparkles} title="Remove Background" color="#e040fb" bg="#fce4ff" badge="AI"
      desc="AI-powered background removal using a neural network — runs 100% in your browser via WebAssembly.">
      <div style={{display:'flex',flexDirection:'column',gap:24}}>
        <ImageUpload onImageLoaded={setFile} />
        <BgRemoval file={file} />
      </div>
    </ToolPage>
  )
}