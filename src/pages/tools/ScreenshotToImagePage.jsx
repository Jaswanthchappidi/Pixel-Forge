import { FileImage, Download, ClipboardPaste } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { ImageUpload } from '../../components/ImageUpload'
import { useState, useEffect } from 'react'
import './ToolStyles.css'

export default function ScreenshotToImagePage() {
  const [file, setFile] = useState(null)
  const [imageSrc, setImageSrc] = useState(null)

  useEffect(() => {
    const handlePaste = (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          const blob = item.getAsFile()
          // create a proper file with a name since clipboard paste doesnt give a good one
          const newFile = new File([blob], `Screenshot_${new Date().getTime()}.png`, { type: item.type })
          setFile(newFile)
          setImageSrc(URL.createObjectURL(newFile))
          e.preventDefault()
          break
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  const handleManualUpload = (f) => {
    if (!f) {
      setFile(null)
      setImageSrc(null)
      return
    }
    setFile(f)
    setImageSrc(URL.createObjectURL(f))
  }

  const handleDownload = () => {
    if (!imageSrc || !file) return
    const a = document.createElement('a')
    a.href = imageSrc
    a.download = file.name
    a.click()
  }

  return (
    <ToolPage 
      icon={FileImage} 
      title="Screenshot to Image" 
      color="#4f46e5" 
      bg="rgba(79, 70, 229, 0.1)"
      desc="Paste screenshots or upload captures and save as images.">
      
      <div className="tool-workspace">
        {!file ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div 
              style={{ 
                border: '2px dashed var(--accent)', 
                borderRadius: '12px', 
                padding: '40px 20px', 
                textAlign: 'center',
                background: 'rgba(79, 70, 229, 0.05)',
                cursor: 'pointer'
              }}
              onClick={() => document.execCommand('paste')} // Mostly for UX context, users usually just press Ctrl+V
            >
              <ClipboardPaste size={48} color="var(--accent)" style={{ marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Press Ctrl+V (or Cmd+V) to Paste Screenshot</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Any image copied to your clipboard will load instantly.</p>
            </div>
            
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>— OR —</div>
            
            <ImageUpload onImageLoaded={handleManualUpload} />
          </div>
        ) : (
          <>
            <div className="tool-controls">
              <div className="control-row" style={{ justifyContent: 'space-between', width: '100%' }}>
                <div style={{ color: 'var(--text-primary)'}}>
                  <strong>File:</strong> {file.name}
                </div>
                <div style={{ display:'flex', gap: '16px' }}>
                  <button className="styled-button secondary" onClick={() => handleManualUpload(null)}>
                    Clear / Start Over
                  </button>
                  <button className="styled-button" onClick={handleDownload}>
                    <Download size={18} /> Save as Image
                  </button>
                </div>
              </div>
            </div>
            
            <div className="preview-container" style={{ background: '#000', padding: 0 }}>
              <img src={imageSrc} alt="Screenshot preview" />
            </div>
          </>
        )}
      </div>
    </ToolPage>
  )
}
