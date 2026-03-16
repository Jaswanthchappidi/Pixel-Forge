import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Download, Loader, CheckCircle, AlertCircle, Package, Trash2 } from 'lucide-react'
import JSZip from 'jszip'
import { convertImage, compressImage, formatSize, FORMATS } from '../utils/imageUtils'
import { saveImage } from '../utils/storage'
import './BatchConverter.css'

const ACCEPTED = {
  'image/png':  ['.png'], 'image/jpeg': ['.jpg','.jpeg'],
  'image/webp': ['.webp'], 'image/gif':  ['.gif'], 'image/bmp': ['.bmp'],
}

export function BatchConverter() {
  const [files,    setFiles]    = useState([])           // array of File
  const [fmt,      setFmt]      = useState('jpeg')
  const [quality,  setQuality]  = useState(85)
  const [compress, setCompress] = useState(false)
  const [maxMB,    setMaxMB]    = useState(1)
  const [status,   setStatus]   = useState('idle')       // idle | running | done | error
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [results,  setResults]  = useState([])           // [{name, blob, size, status}]

  const onDrop = useCallback((accepted) => {
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      const fresh = accepted.filter(f => !existing.has(f.name))
      return [...prev, ...fresh]
    })
    setStatus('idle')
    setResults([])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED, multiple: true,
  })

  const removeFile = (name) => {
    setFiles(prev => prev.filter(f => f.name !== name))
  }

  const clearAll = () => { setFiles([]); setResults([]); setStatus('idle') }

  async function handleBatch() {
    if (!files.length) return
    setStatus('running')
    setResults([])
    setProgress({ done: 0, total: files.length })

    const out = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        let blob = await convertImage(file, fmt, quality / 100)
        if (compress) {
          const f2 = new File([blob], `out.${fmt}`, { type: blob.type })
          blob = await compressImage(f2, maxMB)
        }
        const name = `${file.name.replace(/\.[^.]+$/, '')}.${fmt}`
        await saveImage(blob, { name, format: fmt })
        out.push({ name, blob, size: blob.size, original: file.size, ok: true })
      } catch (e) {
        out.push({ name: file.name, error: e.message, ok: false })
      }
      setProgress({ done: i + 1, total: files.length })
      setResults([...out])
    }

    setStatus('done')
  }

  async function downloadZip() {
    const successful = results.filter(r => r.ok)
    if (!successful.length) return

    const zip = new JSZip()
    const folder = zip.folder('pixelforge-batch')
    successful.forEach(r => folder.file(r.name, r.blob))

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    })

    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pixelforge-batch-${Date.now()}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  const successCount = results.filter(r => r.ok).length
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0
  const totalSaved = results.filter(r => r.ok)
    .reduce((acc, r) => acc + (r.original - r.size), 0)

  return (
    <div className="batch-wrap fade-up">

      {/* Drop zone */}
      <div {...getRootProps()} className={`batch-drop ${isDragActive ? 'active' : ''} ${files.length ? 'has-files' : ''}`}>
        <input {...getInputProps()} />
        <div className="batch-drop-inner">
          <Upload size={20} strokeWidth={1.5} />
          <span>{isDragActive ? 'Drop images here' : 'Drop multiple images or click to browse'}</span>
          <span className="batch-drop-sub">PNG · JPEG · WebP · GIF · BMP</span>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="batch-files-section">
          <div className="batch-files-header">
            <span className="batch-files-count">{files.length} file{files.length > 1 ? 's' : ''} queued</span>
            <button className="batch-clear-btn" onClick={clearAll}>
              <Trash2 size={12} /> Clear all
            </button>
          </div>
          <div className="batch-file-list">
            {files.map(f => {
              const res = results.find(r => r.name === `${f.name.replace(/\.[^.]+$/, '')}.${fmt}`)
              return (
                <div key={f.name} className={`batch-file-row ${res?.ok ? 'done' : res?.error ? 'errored' : ''}`}>
                  <div className="batch-file-info">
                    <span className="batch-file-name">{f.name}</span>
                    <span className="batch-file-size">{formatSize(f.size)}</span>
                  </div>
                  <div className="batch-file-right">
                    {res?.ok && (
                      <>
                        <span className="batch-result-size">{formatSize(res.size)}</span>
                        {res.original > res.size && (
                          <span className="batch-savings">
                            −{Math.round((1 - res.size / res.original) * 100)}%
                          </span>
                        )}
                        <CheckCircle size={14} className="batch-ok-icon" />
                      </>
                    )}
                    {res?.error && <AlertCircle size={14} className="batch-err-icon" title={res.error} />}
                    {!res && status !== 'running' && (
                      <button className="batch-remove-btn" onClick={() => removeFile(f.name)}>
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Options */}
      {files.length > 0 && (
        <div className="batch-options">
          <div className="batch-opt-row">
            <div className="batch-opt-group">
              <p className="batch-opt-label">Output Format</p>
              <div className="batch-format-pills">
                {FORMATS.map(f => (
                  <button key={f} className={`batch-fmt-pill ${fmt === f ? 'active' : ''}`} onClick={() => setFmt(f)}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {(fmt === 'jpeg' || fmt === 'webp') && (
              <div className="batch-opt-group">
                <p className="batch-opt-label">Quality — {quality}%</p>
                <input type="range" className="range-input" min={10} max={100} step={1}
                  value={quality} onChange={e => setQuality(Number(e.target.value))} />
              </div>
            )}

            <div className="batch-opt-group">
              <p className="batch-opt-label">Compress</p>
              <label className="toggle">
                <input type="checkbox" checked={compress} onChange={e => setCompress(e.target.checked)} />
                <span className="toggle-track" />
              </label>
              {compress && (
                <div className="batch-max-size">
                  <span className="batch-opt-label">Max MB</span>
                  <input type="number" min={0.05} max={20} step={0.05}
                    value={maxMB} onChange={e => setMaxMB(Number(e.target.value))}
                    style={{ width: 72 }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      {status === 'running' && (
        <div className="batch-progress-section">
          <div className="batch-progress-header">
            <span className="batch-progress-label">
              <Loader size={13} className="spin" />
              Processing {progress.done} / {progress.total}
            </span>
            <span className="batch-progress-pct">{pct}%</span>
          </div>
          <div className="batch-progress-bar">
            <div className="batch-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="batch-actions">
          <button
            className="batch-run-btn"
            onClick={handleBatch}
            disabled={status === 'running' || !files.length}
          >
            {status === 'running'
              ? <><Loader size={15} className="spin" /> Converting {progress.done}/{progress.total}…</>
              : <><Package size={15} /> Convert {files.length} Image{files.length > 1 ? 's' : ''}</>
            }
          </button>

          {status === 'done' && successCount > 0 && (
            <button className="batch-zip-btn" onClick={downloadZip}>
              <Download size={15} /> Download ZIP ({successCount} files)
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      {status === 'done' && (
        <div className="batch-summary">
          <div className="batch-summary-item">
            <span className="summary-num">{successCount}</span>
            <span className="summary-lbl">Converted</span>
          </div>
          <div className="batch-summary-divider" />
          <div className="batch-summary-item">
            <span className="summary-num">{results.length - successCount}</span>
            <span className="summary-lbl">Failed</span>
          </div>
          <div className="batch-summary-divider" />
          <div className="batch-summary-item">
            <span className="summary-num accent">{totalSaved > 0 ? formatSize(totalSaved) : '—'}</span>
            <span className="summary-lbl">Saved</span>
          </div>
        </div>
      )}
    </div>
  )
}