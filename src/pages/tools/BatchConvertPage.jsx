import { Package } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { BatchConverter } from '../../components/BatchConverter'
export default function BatchConvertPage() {
  return (
    <ToolPage icon={Package} title="Batch Convert" color="#ff6f00" bg="#fff3e0"
      desc="Upload multiple images at once, convert them all to your chosen format, and download as a single ZIP file.">
      <BatchConverter />
    </ToolPage>
  )
}