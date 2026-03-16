import { useState, useEffect, useCallback } from 'react'
import { QrCode, Download, Share2, Copy, Check } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import QRCode from 'qrcode'
import './ToolStyles.css'

export default function QRGeneratorPage() {
  const [text, setText] = useState('https://google.com')
  const [qrUrl, setQrUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [margin, setMargin] = useState(4)
  const [width, setWidth] = useState(300)
  const [dark, setDark] = useState('#000000')
  const [light, setLight] = useState('#ffffff')

  const generateQR = useCallback(async () => {
    if (!text.trim()) return
    try {
      const url = await QRCode.toDataURL(text, {
        margin,
        width,
        color: {
          dark,
          light
        }
      })
      setQrUrl(url)
    } catch (err) {
      console.error(err)
    }
  }, [text, margin, width, dark, light])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generateQR()
  }, [generateQR])

  function download() {
    const a = document.createElement('a')
    a.href = qrUrl
    a.download = `qrcode-${Date.now()}.png`
    a.click()
  }

  function copyText() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolPage icon={QrCode} title="QR Code Generator" color="#0d9488" bg="rgba(13, 148, 136, 0.1)"
      desc="Convert any text, URL, or contact info into a high-quality QR code instantly.">
      
      <div className="tool-workspace">
        <div className="tool-controls">
          <div className="control-section">
            <label className="control-label">Enter Text or URL</label>
            <div style={{ position: 'relative' }}>
              <textarea 
                className="styled-textarea" 
                value={text} 
                onChange={e => setText(e.target.value)}
                placeholder="https://example.com"
                style={{ minHeight: '100px' }}
              />
              <button className="input-action-btn" onClick={copyText} title="Copy Text">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="control-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="control-group">
              <label>Size ({width}px)</label>
              <input type="range" min="100" max="1000" step="50" value={width} onChange={e => setWidth(Number(e.target.value))} />
            </div>
            <div className="control-group">
              <label>Margin ({margin})</label>
              <input type="range" min="0" max="10" step="1" value={margin} onChange={e => setMargin(Number(e.target.value))} />
            </div>
          </div>

          <div className="control-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="control-group">
              <label>Foreground Color</label>
              <input type="color" className="color-input-full" value={dark} onChange={e => setDark(e.target.value)} />
            </div>
            <div className="control-group">
              <label>Background Color</label>
              <input type="color" className="color-input-full" value={light} onChange={e => setLight(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button className="primary-button full-width" onClick={download}>
              <Download size={18} /> Download QR Code (PNG)
            </button>
          </div>
        </div>

        <div className="preview-area" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', borderRadius: '12px', minHeight: '350px' }}>
          {qrUrl ? (
            <div className="qr-preview-card fade-up">
              <img src={qrUrl} alt="QR Code Preview" style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }} />
            </div>
          ) : (
            <div className="empty-preview">
              <QrCode size={48} color="var(--text-secondary)" opacity={0.3} />
              <p>Enter text to generate QR</p>
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
