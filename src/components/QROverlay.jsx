import { useState, useRef, useEffect } from 'react'
import { QrCode, Download, RefreshCw, CheckCircle, AlertCircle, Link } from 'lucide-react'
import { downloadBlob, formatSize } from '../utils/imageUtils'
import { saveImage } from '../utils/storage'
import './QROverlay.css'

const POSITIONS = [
  { id: 'top-left',     label: 'Top Left'     },
  { id: 'top-right',    label: 'Top Right'    },
  { id: 'bottom-left',  label: 'Bottom Left'  },
  { id: 'bottom-right', label: 'Bottom Right' },
  { id: 'center',       label: 'Center'       },
]

export function QROverlay({ file, editedCanvas }) {
  const previewRef = useRef(null)

  const [url,       setUrl]       = useState('https://')
  const [position,  setPosition]  = useState('bottom-right')
  const [qrSize,    setQrSize]    = useState(18)   // % of image width
  const [margin,    setMargin]    = useState(2)    // % margin from edge
  const [opacity,   setOpacity]   = useState(90)
  const [bgStyle,   setBgStyle]   = useState('white') // white | transparent | dark
  const [status,    setStatus]    = useState('idle')
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState(null)
  const [qrPreview, setQrPreview] = useState(null) // QR data URL for live preview

  // Generate QR preview whenever URL changes
  useEffect(() => {
    if (!url || url === 'https://') { setQrPreview(null); return }
    let cancelled = false
    import('qrcode').then(({ default: QRCode }) => {
      const bg = bgStyle === 'dark' ? '#1a1a2e' : bgStyle === 'transparent' ? '#00000000' : '#ffffff'
      const fg = bgStyle === 'dark' ? '#ffffff' : '#000000'
      QRCode.toDataURL(url, {
        width: 200, margin: 1,
        color: { dark: fg, light: bg },
        errorCorrectionLevel: 'H',
      }).then(dataUrl => { if (!cancelled) setQrPreview(dataUrl) })
        .catch(() => {})
    })
    return () => { cancelled = true }
  }, [url, bgStyle])

  // Live canvas previews
  useEffect(() => {
    if (!file || !qrPreview) return
    renderPreview()
  // eslint-disable-next-line react-hooks/exhaustive-depswhy its happen
  }, [file, editedCanvas, qrPreview, position, qrSize, margin, opacity])

  async function renderPreview() {
    const canvas = previewRef.current
    if (!canvas) return
    const source = editedCanvas || await fileToCanvas(file)
    const qrImg  = await loadImage(qrPreview)

    canvas.width  = source.width
    canvas.height = source.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(source, 0, 0)

    const qrPx  = Math.round((qrSize / 100) * source.width)
    const mrgPx = Math.round((margin / 100) * source.width)
    const pos   = getPos(position, source.width, source.height, qrPx, mrgPx)

    ctx.globalAlpha = opacity / 100
    ctx.drawImage(qrImg, pos.x, pos.y, qrPx, qrPx)
    ctx.globalAlpha = 1
  }

  function getPos(pos, w, h, size, margin) {
    switch (pos) {
      case 'top-left':     return { x: margin,          y: margin }
      case 'top-right':    return { x: w - size - margin, y: margin }
      case 'bottom-left':  return { x: margin,          y: h - size - margin }
      case 'bottom-right': return { x: w - size - margin, y: h - size - margin }
      case 'center':       return { x: (w - size) / 2,  y: (h - size) / 2 }
      default:             return { x: margin,          y: margin }
    }
  }

  async function fileToCanvas(f) {
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const c = document.createElement('canvas')
        c.width = img.naturalWidth; c.height = img.naturalHeight
        c.getContext('2d').drawImage(img, 0, 0)
        URL.revokeObjectURL(img.src)
        resolve(c)
      }
      img.src = URL.createObjectURL(f)
    })
  }

  function loadImage(src) {
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.src = src
    })
  }

  async function applyAndExport() {
    if (!file || !qrPreview) return
    setStatus('loading'); setError(null)
    try {
      const source = editedCanvas || await fileToCanvas(file)
      const qrImg  = await loadImage(qrPreview)

      const out   = document.createElement('canvas')
      out.width   = source.width
      out.height  = source.height
      const ctx   = out.getContext('2d')
      ctx.drawImage(source, 0, 0)

      const qrPx  = Math.round((qrSize / 100) * source.width)
      const mrgPx = Math.round((margin / 100) * source.width)
      const pos   = getPos(position, source.width, source.height, qrPx, mrgPx)

      ctx.globalAlpha = opacity / 100
      ctx.drawImage(qrImg, pos.x, pos.y, qrPx, qrPx)
      ctx.globalAlpha = 1

      const blob = await new Promise(res => out.toBlob(res, 'image/png'))
      const name = `${file.name.replace(/\.[^.]+$/, '')}_qr.png`
      await saveImage(blob, { name, format: 'png' })
      setResult({ blob, size: blob.size, name })
      setStatus('done')
    } catch (e) {
      setError(e.message || 'Failed to apply QR code')
      setStatus('error')
    }
  }

  if (!file) return (
    <div className="qr-empty">
      <QrCode size={28} />
      <p>Upload an image first to add a QR code overlay</p>
    </div>
  )

  return (
    <div className="qr-wrap fade-up">
      <div className="qr-layout">
        {/* Left — settings */}
        <div className="qr-settings">
          {/* URL input */}
          <div className="qr-section">
            <p className="qr-section-title">URL or Text</p>
            <div className="qr-url-row">
              <Link size={14} className="qr-url-icon" />
              <input
                type="text"
                className="qr-url-input"
                placeholder="https://your-website.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Position */}
          <div className="qr-section">
            <p className="qr-section-title">Position</p>
            <div className="qr-pos-grid">
              {POSITIONS.map(p => (
                <button
                  key={p.id}
                  className={`qr-pos-btn ${position === p.id ? 'active' : ''}`}
                  onClick={() => setPosition(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div className="qr-section">
            <p className="qr-section-title">QR Style</p>
            <div className="qr-style-pills">
              {[
                { id:'white',       label:'White BG'       },
                { id:'transparent', label:'Transparent'    },
                { id:'dark',        label:'Dark BG'        },
              ].map(s => (
                <button key={s.id} className={`qr-style-pill ${bgStyle === s.id ? 'active' : ''}`} onClick={() => setBgStyle(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="qr-section">
            <div className="qr-slider-item">
              <div className="qr-slider-head">
                <span>QR Size</span>
                <span className="qr-slider-val">{qrSize}%</span>
              </div>
              <input type="range" className="range-input" min={5} max={50} step={1}
                value={qrSize} onChange={e => setQrSize(Number(e.target.value))} />
            </div>
            <div className="qr-slider-item">
              <div className="qr-slider-head">
                <span>Margin</span>
                <span className="qr-slider-val">{margin}%</span>
              </div>
              <input type="range" className="range-input" min={0} max={10} step={0.5}
                value={margin} onChange={e => setMargin(Number(e.target.value))} />
            </div>
            <div className="qr-slider-item">
              <div className="qr-slider-head">
                <span>Opacity</span>
                <span className="qr-slider-val">{opacity}%</span>
              </div>
              <input type="range" className="range-input" min={10} max={100} step={5}
                value={opacity} onChange={e => setOpacity(Number(e.target.value))} />
            </div>
          </div>

          {/* QR preview chip */}
          {qrPreview && (
            <div className="qr-chip">
              <img src={qrPreview} alt="QR preview" className="qr-chip-img" />
              <div className="qr-chip-info">
                <span className="qr-chip-label">QR Preview</span>
                <span className="qr-chip-url">{url.length > 32 ? url.slice(0, 32) + '…' : url}</span>
              </div>
            </div>
          )}

          {/* Apply button */}
          <div className="qr-actions">
            <button
              className={`qr-apply-btn ${status === 'loading' ? 'loading' : ''}`}
              onClick={applyAndExport}
              disabled={!qrPreview || status === 'loading' || url.length < 3}
            >
              {status === 'loading'
                ? <><RefreshCw size={14} className="spin" /> Applying…</>
                : <><QrCode size={15} /> Apply QR & Export</>
              }
            </button>
            {result && (
              <button className="qr-dl-btn" onClick={() => downloadBlob(result.blob, result.name)}>
                <Download size={14} /> Download
              </button>
            )}
          </div>

          {status === 'done' && (
            <div className="qr-success">
              <CheckCircle size={14} /> QR applied · {formatSize(result.size)} · Saved to history
            </div>
          )}
          {status === 'error' && (
            <div className="qr-error"><AlertCircle size={14} /> {error}</div>
          )}
        </div>

        {/* Right — live preview */}
        <div className="qr-preview-area">
          <p className="qr-section-title" style={{marginBottom:8}}>Live Preview</p>
          <div className="qr-canvas-frame">
            {qrPreview
              ? <canvas ref={previewRef} className="qr-canvas" />
              : <div className="qr-preview-placeholder">
                  <QrCode size={32} strokeWidth={1} />
                  <span>Enter a URL to see preview</span>
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}