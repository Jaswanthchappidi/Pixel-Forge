import { useState } from 'react'
import { Sparkles, Download, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { downloadBlob, formatSize } from '../utils/imageUtils'
import { saveImage } from '../utils/storage'
import './BgRemoval.css'

export function BgRemoval({ file }) {
  const [status,   setStatus]   = useState('idle')
  const [progress, setProgress] = useState('')
  const [result,   setResult]   = useState(null)
  const [error,    setError]    = useState(null)
  const [bgColor,  setBgColor]  = useState('transparent')

  const originalUrl = file ? URL.createObjectURL(file) : null

  async function handleRemove() {
    if (!file) return
    setStatus('loading')
    setProgress('Loading AI model…')
    setError(null)
    setResult(null)

    try {
      const { removeBackground } = await import('@imgly/background-removal')

      setProgress('Starting neural network…')

      const resultBlob = await removeBackground(file, {
        output: { format: 'image/png', quality: 1.0 },
        progress: (key, current, total) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100)
            if (key.startsWith('fetch')) setProgress(`Downloading model… ${pct}%`)
            else setProgress(`Processing… ${pct}%`)
          }
        },
      })

      let finalBlob = resultBlob
      if (bgColor !== 'transparent') {
        finalBlob = await compositeBackground(resultBlob, bgColor)
      }

      const url  = URL.createObjectURL(finalBlob)
      const name = `${file.name.replace(/\.[^.]+$/, '')}_nobg.png`
      setResult({ blob: finalBlob, url, size: finalBlob.size, name })
      await saveImage(finalBlob, { name, format: 'png' })
      setStatus('done')

    } catch (e) {
      console.error(e)
      setError(e.message || 'Background removal failed')
      setStatus('error')
    }
  }

  async function compositeBackground(blob, color) {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(blob)
      img.onload = () => {
        const c   = document.createElement('canvas')
        c.width   = img.naturalWidth
        c.height  = img.naturalHeight
        const ctx = c.getContext('2d')
        ctx.fillStyle = color
        ctx.fillRect(0, 0, c.width, c.height)
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)
        c.toBlob(resolve, 'image/png')
      }
      img.src = url
    })
  }

  const BG_COLORS = [
    { label: 'Transparent', value: 'transparent' },
    { label: 'White',       value: '#ffffff'      },
    { label: 'Black',       value: '#000000'      },
    { label: 'Light Grey',  value: '#f0f0f0'      },
    { label: 'Navy',        value: '#1a2740'      },
    { label: 'Green',       value: '#22c55e'      },
  ]

  if (!file) return (
    <div className="bgr-empty">
      <Sparkles size={28} />
      <p>Upload an image to remove its background</p>
    </div>
  )

  return (
    <div className="bgr-wrap fade-up">


      <div className="bgr-preview-grid">
        <div className="bgr-preview-box">
          <span className="bgr-preview-label">Original</span>
          <img src={originalUrl} alt="original" className="bgr-img" />
          <span className="bgr-preview-size">{formatSize(file.size)}</span>
        </div>

        <div className="bgr-arrow">→</div>

        <div className="bgr-preview-box result-box" style={{ background: bgColor === 'transparent' ? undefined : bgColor }}>
          <span className="bgr-preview-label">Result</span>
          {result
            ? <img src={result.url} alt="result" className="bgr-img" />
            : <div className="bgr-placeholder">
                {status === 'loading'
                  ? <div className="bgr-loading-state">
                      <div className="bgr-spinner" />
                      <p>{progress}</p>
                    </div>
                  : <Sparkles size={32} strokeWidth={1} />
                }
              </div>
          }
          {result && <span className="bgr-preview-size">{formatSize(result.size)}</span>}
        </div>
      </div>

      <div className="bgr-section">
        <p className="bgr-section-title">Replace Background With</p>
        <div className="bgr-colors">
          {BG_COLORS.map(c => (
            <button
              key={c.value}
              className={`bgr-color-btn ${bgColor === c.value ? 'selected' : ''}`}
              onClick={() => setBgColor(c.value)}
            >
              <span className="color-swatch" style={{
                background: c.value === 'transparent'
                  ? 'repeating-conic-gradient(#444 0% 25%, #222 0% 50%) 0 0 / 10px 10px'
                  : c.value
              }} />
              <span className="color-label">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bgr-actions">
        <button
          className={`bgr-run-btn ${status === 'loading' ? 'loading' : ''}`}
          onClick={handleRemove}
          disabled={status === 'loading'}
        >
          {status === 'loading'
            ? <><div className="bgr-btn-spinner" /> {progress}</>
            : <><Sparkles size={16} /> Remove Background</>
          }
        </button>

        {result && (
          <button className="bgr-download-btn" onClick={() => downloadBlob(result.blob, result.name)}>
            <Download size={15} /> Download PNG
          </button>
        )}
      </div>

      {status === 'done' && (
        <div className="bgr-success">
          <CheckCircle size={15} /> Background removed · Saved to history
        </div>
      )}

      {status === 'error' && (
        <div className="bgr-error">
          <AlertCircle size={15} /> {error}
        </div>
      )}

    </div>
  )
}