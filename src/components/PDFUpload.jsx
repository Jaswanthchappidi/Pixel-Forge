import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, AlertCircle, FileText } from 'lucide-react'
import { formatSize } from '../utils/imageUtils'
import './ImageUpload.css'

const ACCEPTED = { 'application/pdf': ['.pdf'] }

export function PDFUpload({ onPDFLoaded }) {
  const [fileInfo, setFileInfo] = useState(null)
  const [error, setError] = useState(null)

  const onDrop = useCallback((accepted, rejected) => {
    setError(null)
    if (rejected.length > 0) {
      setError('Unsupported file type. Please upload a PDF.')
      return
    }
    const file = accepted[0]
    if (!file) return
    setFileInfo({ name: file.name, size: file.size })
    onPDFLoaded(file)
  }, [onPDFLoaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED, multiple: false, maxSize: 100 * 1024 * 1024,
  })

  const clear = (e) => {
    e.stopPropagation()
    setFileInfo(null)
    setError(null)
    onPDFLoaded(null)
  }

  return (
    <div className="upload-section">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${fileInfo ? 'has-preview' : ''}`}>
        <input {...getInputProps()} />

        {fileInfo ? (
          <div className="preview-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--surface2)' }}>
            <FileText size={48} color="var(--accent)" style={{ marginBottom: '16px' }} />
            <span className="preview-name" style={{ color: 'var(--text-primary)' }}>{fileInfo.name}</span>
            <span className="preview-size" style={{ color: 'var(--text-secondary)' }}>{formatSize(fileInfo.size)}</span>
            <button className="remove-btn" onClick={clear} title="Remove">
              <X size={13} />
            </button>
          </div>
        ) : (
          <div className="drop-inner">
            <div className="drop-icon-wrap">
              <Upload size={24} strokeWidth={1.5} />
            </div>
            <p className="drop-title">
              {isDragActive ? 'Release to upload PDF' : <><span>Choose PDF</span> or drag here</>}
            </p>
            <div className="drop-formats">
              <span className="fmt-chip">PDF</span>
            </div>
            <p className="drop-limit">Maximum 100 MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  )
}
