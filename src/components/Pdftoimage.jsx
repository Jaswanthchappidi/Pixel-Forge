import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  FileText, Download, Loader, ChevronLeft, ChevronRight,
  Package, AlertCircle, CheckCircle, Image
} from 'lucide-react'
import JSZip from 'jszip'
import { formatSize } from '../utils/imageUtils'
import './PDFToImage.css'

export function PDFToImage() {
  const [pdfFile,   setPdfFile]   = useState(null)
  const [pages,     setPages]     = useState([])     // [{canvas, blob, num}]
  const [status,    setStatus]    = useState('idle') // idle|loading|done|error
  const [progress,  setProgress]  = useState({ done:0, total:0 })
  const [error,     setError]     = useState(null)
  const [format,    setFormat]    = useState('png')
  const [quality,   setQuality]   = useState(90)
  const [scale,     setScale]     = useState(2)      // 1=72dpi, 2=144dpi, 3=216dpi
  const [preview,   setPreview]   = useState(0)      // current page index

  const onDrop = useCallback((accepted) => {
    const f = accepted[0]
    if (!f || f.type !== 'application/pdf') return
    setPdfFile(f); setPages([]); setStatus('idle'); setError(null); setPreview(0)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  })

  async function convertPDF() {
    if (!pdfFile) return
    setStatus('loading'); setError(null); setPages([])

    try {
      // Dynamic import to keep bundle small
      const pdfjsLib = await import('pdfjs-dist')

      // Set worker using CDN
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf         = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const numPages    = pdf.numPages

      setProgress({ done: 0, total: numPages })

      const results = []

      for (let i = 1; i <= numPages; i++) {
        const page     = await pdf.getPage(i)
        const viewport = page.getViewport({ scale })
        const canvas   = document.createElement('canvas')
        canvas.width   = viewport.width
        canvas.height  = viewport.height

        await page.render({
          canvasContext: canvas.getContext('2d'),
          viewport,
        }).promise

        const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png'
        const blob = await new Promise(res => canvas.toBlob(res, mime, quality / 100))

        results.push({ canvas, blob, num: i, width: viewport.width, height: viewport.height })
        setProgress({ done: i, total: numPages })
        setPages([...results])
      }

      setStatus('done')
    } catch (e) {
      console.error(e)
      setError(e.message || 'PDF conversion failed')
      setStatus('error')
    }
  }

  function downloadPage(page) {
    const url = URL.createObjectURL(page.blob)
    const a   = document.createElement('a')
    a.href     = url
    a.download = `page-${page.num}.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function downloadAll() {
    if (!pages.length) return
    if (pages.length === 1) { downloadPage(pages[0]); return }

    const zip    = new JSZip()
    const folder = zip.folder('pdf-pages')
    pages.forEach(p => folder.file(`page-${p.num}.${format}`, p.blob))
    const zipBlob = await zip.generateAsync({ type:'blob', compression:'DEFLATE' })
    const url     = URL.createObjectURL(zipBlob)
    const a       = document.createElement('a')
    a.href        = url
    a.download    = `${pdfFile.name.replace('.pdf','')}-pages.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className="pdf-wrap fade-up">

      {/* Drop zone */}
      <div {...getRootProps()} className={`pdf-drop ${isDragActive ? 'active' : ''} ${pdfFile ? 'has-file' : ''}`}>
        <input {...getInputProps()} />
        {pdfFile ? (
          <div className="pdf-file-row">
            <FileText size={20} className="pdf-file-icon" />
            <div className="pdf-file-info">
              <span className="pdf-file-name">{pdfFile.name}</span>
              <span className="pdf-file-size">{formatSize(pdfFile.size)}</span>
            </div>
            <button className="pdf-change-btn" onClick={e => { e.stopPropagation(); setPdfFile(null); setPages([]) }}>
              Change
            </button>
          </div>
        ) : (
          <div className="pdf-drop-inner">
            <FileText size={28} strokeWidth={1.5} />
            <span>{isDragActive ? 'Drop PDF here' : 'Drop a PDF or click to browse'}</span>
            <span className="pdf-drop-sub">PDF files only</span>
          </div>
        )}
      </div>

      {/* Settings */}
      {pdfFile && (
        <div className="pdf-settings">
          <div className="pdf-setting-row">
            <div className="pdf-setting-group">
              <p className="pdf-setting-label">Output Format</p>
              <div className="pdf-fmt-pills">
                {['png','jpeg'].map(f => (
                  <button key={f} className={`pdf-fmt-pill ${format === f ? 'active' : ''}`} onClick={() => setFormat(f)}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="pdf-setting-group">
              <p className="pdf-setting-label">Resolution</p>
              <div className="pdf-fmt-pills">
                {[{v:1,l:'72 DPI'},{v:2,l:'144 DPI'},{v:3,l:'216 DPI'}].map(({v,l}) => (
                  <button key={v} className={`pdf-fmt-pill ${scale === v ? 'active' : ''}`} onClick={() => setScale(v)}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {format === 'jpeg' && (
              <div className="pdf-setting-group">
                <p className="pdf-setting-label">Quality — {quality}%</p>
                <input type="range" className="range-input" min={10} max={100} step={5}
                  value={quality} onChange={e => setQuality(Number(e.target.value))} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress */}
      {status === 'loading' && (
        <div className="pdf-progress">
          <div className="pdf-progress-header">
            <span className="pdf-progress-label">
              <Loader size={13} className="spin" />
              Converting page {progress.done} of {progress.total}…
            </span>
            <span className="pdf-progress-pct">{pct}%</span>
          </div>
          <div className="pdf-progress-bar">
            <div className="pdf-progress-fill" style={{ width:`${pct}%` }} />
          </div>
        </div>
      )}

      {/* Actions */}
      {pdfFile && status !== 'loading' && (
        <div className="pdf-actions">
          <button className="pdf-convert-btn" onClick={convertPDF}>
            <Image size={15} /> Convert to Images
          </button>
          {pages.length > 0 && (
            <button className="pdf-download-all-btn" onClick={downloadAll}>
              <Package size={15} /> Download All ({pages.length} {pages.length === 1 ? 'page' : 'pages'})
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="pdf-error">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Pages preview */}
      {pages.length > 0 && (
        <div className="pdf-pages-section">
          <div className="pdf-pages-header">
            <span className="pdf-pages-count">
              <CheckCircle size={13} /> {pages.length} page{pages.length > 1 ? 's' : ''} converted
            </span>
            <div className="pdf-page-nav">
              <button className="pdf-nav-btn" onClick={() => setPreview(p => Math.max(0, p-1))} disabled={preview === 0}>
                <ChevronLeft size={14} />
              </button>
              <span className="pdf-page-indicator">{preview + 1} / {pages.length}</span>
              <button className="pdf-nav-btn" onClick={() => setPreview(p => Math.min(pages.length-1, p+1))} disabled={preview === pages.length-1}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Single page preview */}
          {pages[preview] && (
            <div className="pdf-page-preview">
              <div className="pdf-preview-frame">
                <img
                  src={URL.createObjectURL(pages[preview].blob)}
                  alt={`Page ${pages[preview].num}`}
                  className="pdf-preview-img"
                />
                <div className="pdf-preview-meta">
                  <span>Page {pages[preview].num}</span>
                  <span>{pages[preview].width} × {pages[preview].height}px</span>
                  <span>{formatSize(pages[preview].blob.size)}</span>
                </div>
              </div>
              <button className="pdf-dl-page-btn" onClick={() => downloadPage(pages[preview])}>
                <Download size={14} /> Download Page {pages[preview].num}
              </button>
            </div>
          )}

          {/* Page thumbnails */}
          {pages.length > 1 && (
            <div className="pdf-thumbnails">
              {pages.map((p, i) => (
                <button
                  key={p.num}
                  className={`pdf-thumb ${i === preview ? 'active' : ''}`}
                  onClick={() => setPreview(i)}
                >
                  <img src={URL.createObjectURL(p.blob)} alt={`p${p.num}`} />
                  <span>{p.num}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}