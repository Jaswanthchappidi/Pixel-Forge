import { FileImage } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { PDFToImage } from '../../components/PDFToImage'
export default function PDFToImagePage() {
  return (
    <ToolPage icon={FileImage} title="PDF to Image" color="#f44336" bg="#ffebee"
      desc="Convert every page of a PDF into high-quality PNG or JPEG images. Choose resolution up to 216 DPI.">
      <PDFToImage />
    </ToolPage>
  )
}