import { useState } from 'react'
import { Download, Loader, ArrowRight, Zap, CheckCircle, AlertCircle, Minimize2 } from 'lucide-react'
import { convertImage, compressImage, downloadBlob, formatSize, FORMATS } from '../utils/imageUtils'
import { saveImage } from '../utils/storage'
import './ImageConverter.css'

export function ImageConverter({ file, editedCanvas, onConvert }) {
  const [fmt,      setFmt]      = useState('jpeg')
  const [quality,  setQuality]  = useState(85)
  const [compress, setCompress] = useState(false)
  const [maxMB,    setMaxMB]    = useState(1)
  const [status,   setStatus]   = useState(null)
  const [result,   setResult]   = useState(null)
  const [error,    setError]    = useState(null)

  const srcFmt  = file?.name?.split('.').pop()?.toLowerCase() || '?'
  const srcSize = file?.size || 0

  const savings = result
    ? Math.max(0, Math.round((1 - result.size / srcSize) * 100))
    : null

  async function handleConvert() {
    if (!file) return
    setStatus('loading'); setError(null); setResult(null)
    try {
      let blob

      // Step 1: Convert format (or export from canvas if edited)
      if (editedCanvas) {
        blob = await new Promise(res =>
          editedCanvas.toBlob(res, `image/${fmt}`, quality / 100)
        )
      } else {
        blob = await convertImage(file, fmt, quality / 100)
      }

      // Step 2: Compress if enabled
      if (compress) {
        const compressFile = new File([blob], `out.${fmt}`, { type: blob.type })
        blob = await compressImage(compressFile, maxMB, 1920)
      }

      const name = `${file.name.replace(/\.[^.]+$/, '')}.${fmt}`
      await saveImage(blob, { name, format: fmt })
      setResult({ blob, size: blob.size, name })
      setStatus('done')
      onConvert?.()
    } catch (e) {
      setError(e.message || 'Conversion failed')
      setStatus('error')
    }
  }

  return (
    <div className="converter-wrap fade-up">

      {/* ── Format picker ─────────────────────────── */}
      <div className="conv-section">
        <p className="conv-section-title">Output Format</p>
        <div className="format-grid">
          {FORMATS.map(f => (
            <button
              key={f}
              className={`format-card ${fmt === f ? 'selected' : ''}`}
              onClick={() => setFmt(f)}
            >
              <span className="format-name">{f.toUpperCase()}</span>
              <span className="format-ext">.{f}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Quality slider (always visible for lossy) ─ */}
      {(fmt === 'jpeg' || fmt === 'webp') && (
        <div className="conv-section">
          <div className="section-head-row">
            <p className="conv-section-title">Quality</p>
            <span className={`quality-badge ${quality < 60 ? 'low' : quality < 85 ? 'mid' : 'high'}`}>
              {quality < 60 ? 'Low' : quality < 85 ? 'Medium' : 'High'} — {quality}%
            </span>
          </div>
          <div className="quality-track-wrap">
            <span className="track-label">Smaller</span>
            <input
              type="range"
              className="range-input"
              min={10} max={100} step={1}
              value={quality}
              onChange={e => setQuality(Number(e.target.value))}
            />
            <span className="track-label">Sharper</span>
          </div>
          <div className="quality-marks">
            {[10,25,50,75,90,100].map(v => (
              <button
                key={v}
                className={`q-mark ${quality === v ? 'active' : ''}`}
                onClick={() => setQuality(v)}
              >{v}%</button>
            ))}
          </div>
        </div>
      )}

      {/* ── Compression panel ─────────────────────── */}
      <div className="conv-section compression-section">
        <div className="compress-toggle-row">
          <div className="compress-icon-wrap">
            <Minimize2 size={16} />
          </div>
          <div className="compress-text">
            <p className="conv-section-title" style={{ marginBottom: 2 }}>Smart Compression</p>
            <p className="compress-sub">Reduce file size using browser-image-compression</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={compress}
              onChange={e => setCompress(e.target.checked)}
            />
            <span className="toggle-track" />
          </label>
        </div>

        {compress && (
          <div className="compress-options fade-up">
            <div className="compress-opt-row">
              <div className="compress-opt">
                <p className="opt-label">Max File Size</p>
                <div className="size-input-row">
                  {[0.1, 0.25, 0.5, 1, 2, 5].map(v => (
                    <button
                      key={v}
                      className={`size-chip ${maxMB === v ? 'active' : ''}`}
                      onClick={() => setMaxMB(v)}
                    >
                      {v < 1 ? `${v * 1000}KB` : `${v}MB`}
                    </button>
                  ))}
                </div>
                <div className="custom-size-row">
                  <span className="opt-label">Custom (MB)</span>
                  <input
                    type="number"
                    min={0.05} max={50} step={0.05}
                    value={maxMB}
                    onChange={e => setMaxMB(Number(e.target.value))}
                    style={{ width: 80 }}
                  />
                </div>
              </div>
            </div>
            <div className="compress-note">
              <span className="note-dot" />
              Output will be ≤ {maxMB < 1 ? `${maxMB * 1000} KB` : `${maxMB} MB`} · Runs entirely in your browser
            </div>
          </div>
        )}
      </div>

      {/* ── Conversion summary ────────────────────── */}
      <div className="conversion-summary">
        <div className="summary-left">
          <span className="fmt-badge src">{srcFmt.toUpperCase()}</span>
          <span className="summary-filesize">{formatSize(srcSize)}</span>
        </div>
        <ArrowRight size={14} className="arrow-icon" />
        <div className="summary-right">
          <span className="fmt-badge dst">{fmt.toUpperCase()}</span>
          {result && <span className="summary-result-size">{formatSize(result.size)}</span>}
          {savings !== null && savings > 0 && (
            <span className="savings-tag">−{savings}%</span>
          )}
        </div>
      </div>

      {/* ── Actions ───────────────────────────────── */}
      <div className="action-row">
        <button
          className={`convert-btn ${status === 'loading' ? 'loading' : ''}`}
          onClick={handleConvert}
          disabled={!file || status === 'loading'}
        >
          {status === 'loading'
            ? <><Loader size={15} className="spin" /> {compress ? 'Compressing…' : 'Converting…'}</>
            : <><Zap size={15} /> {compress ? 'Convert & Compress' : 'Convert Now'}</>
          }
        </button>

        {status === 'done' && (
          <button
            className="download-btn"
            onClick={() => downloadBlob(result.blob, result.name)}
          >
            <Download size={15} /> Download {result?.name}
          </button>
        )}
      </div>

      {/* ── Feedback ──────────────────────────────── */}
      {status === 'done' && (
        <div className="conv-success">
          <CheckCircle size={15} />
          <span>
            Saved to browser storage
            {savings > 0 && <strong> · {savings}% smaller</strong>}
            {savings === 0 && ' · Same size (already optimal)'}
          </span>
        </div>
      )}
      {error && (
        <div className="conv-error">
          <AlertCircle size={15} /> {error}
        </div>
      )}
    </div>
  )
}