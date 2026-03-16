import { QrCode } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { QROverlay } from '../../components/QROverlay'
import { ImageUpload } from '../../components/ImageUpload'
import { useState } from 'react'
export default function QRCodePage() {
  const [file, setFile] = useState(null)
  return (
    <ToolPage icon={QrCode} title="QR Code Overlay" color="#00897b" bg="#e0f2f1"
      desc="Generate a QR code from any URL and stamp it onto your image. Choose position, size and opacity.">
      <div style={{display:'flex',flexDirection:'column',gap:24}}>
        <ImageUpload onImageLoaded={setFile} />
        <QROverlay file={file} editedCanvas={null} />
      </div>
    </ToolPage>
  )
}