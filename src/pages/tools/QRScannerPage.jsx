import { useState, useRef } from 'react'
import { ScanQrCode, Upload, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { useDropzone } from 'react-dropzone'
import jsQR from 'jsqr'
import './ToolStyles.css'

export default function QRScannerPage() {
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [file, setFile] = useState(null)
  const canvasRef = useRef(null)

  const onDrop = (accepted) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setError('')
    setResult('')
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        scanImage(img)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(f)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  })

  function scanImage(img) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    
    if (code) {
      setResult(code.data)
    } else {
      setError('No QR code found in this image. Try another one.')
    }
  }

  function copyResult() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUrl = result.startsWith('http://') || result.startsWith('https://')

  return (
    <ToolPage icon={ScanQrCode} title="QR Code Scanner" color="#0891b2" bg="rgba(8, 145, 178, 0.1)"
      desc="Extract data from any QR code. Just upload an image or drag and drop a screenshot.">
      
      <div className="tool-workspace">
        <div className="tool-controls" style={{ flex: '1 1 400px' }}>
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`} style={{ cursor: 'pointer', border: '2px dashed var(--border)', borderRadius: '12px', padding: '40px', textAlign: 'center', transition: 'all 0.2s', background: 'var(--surface2)' }}>
            <input {...getInputProps()} />
            <div className="drop-icon-wrap" style={{ margin: '0 auto 16px' }}>
              <Upload size={32} />
            </div>
            {file ? (
              <p style={{ fontWeight: 600 }}>{file.name}</p>
            ) : (
              <p>Drag & drop QR image here, or click to browse</p>
            )}
          </div>

          {result && (
            <div className="scan-result-card fade-up" style={{ marginTop: '24px' }}>
              <label className="control-label">Scanned Content</label>
              <div className="result-box" style={{ padding: '16px', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border)', position: 'relative' }}>
                <p style={{ wordBreak: 'break-all', fontSize: '1rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>{result}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button className="secondary-button" onClick={copyResult} style={{ flex: 1 }}>
                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Content</>}
                  </button>
                  {isUrl && (
                    <a href={result} target="_blank" rel="noopener noreferrer" className="primary-button" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <ExternalLink size={14} /> Open URL
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="error-badge fade-up" style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '0.9rem' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        <div className="preview-area" style={{ flex: '2 1 500px', background: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {file ? (
            <div style={{ padding: '20px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <img src={URL.createObjectURL(file)} alt="Preview" style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }} />
            </div>
          ) : (
            <div className="empty-preview" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
              <ScanQrCode size={64} style={{ marginBottom: '16px' }} />
              <p>Upload an image to scan</p>
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
