import { ArrowLeftRight } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { ImageConverter } from '../../components/ImageConverter'
import { useState } from 'react'
import { ImageUpload } from '../../components/ImageUpload'

export default function ImageConverterPage() {
  const [file, setFile] = useState(null)
  return (
    <ToolPage icon={ArrowLeftRight} title="Image Converter" color="#0096ff" bg="#e8f4ff"
      desc="Convert images between PNG, JPEG, WebP, GIF and BMP formats instantly in your browser.">
      <div style={{display:'flex',flexDirection:'column',gap:24}}>
        <ImageUpload onImageLoaded={setFile} />
        {file && <ImageConverter file={file} editedCanvas={null} onConvert={() => {}} />}
      </div>
    </ToolPage>
  )
}