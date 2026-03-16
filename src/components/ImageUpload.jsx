import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, AlertCircle } from 'lucide-react'
import { formatSize } from '../utils/imageUtils'
import './ImageUpload.css'

const ACCEPTED = {
  'image/png':  ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'image/gif':  ['.gif'],
  'image/bmp':  ['.bmp'],
}
const FMTS = ['PNG','JPEG','WebP','GIF','BMP']

export function ImageUpload({ onImageLoaded }) {
  const [preview,  setPreview]  = useState(null)
  const [fileInfo, setFileInfo] = useState(null)
  const [error,    setError]    = useState(null)

  const onDrop = useCallback((accepted, rejected) => {
    setError(null)
    if (rejected.length > 0) {
      setError('Unsupported file type. Use PNG, JPEG, WebP, GIF or BMP.')
      return
    }
    const file = accepted[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setFileInfo({ name: file.name, size: file.size, type: file.type })
    onImageLoaded(file)
  }, [onImageLoaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED, multiple: false, maxSize: 50 * 1024 * 1024,
  })

  const clear = (e) => {
    e.stopPropagation()
    setPreview(null); setFileInfo(null); setError(null)
    onImageLoaded(null)
  }

  return (
    <div className="upload-section">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${preview ? 'has-preview' : ''}`}>
        <input {...getInputProps()} />

        {preview ? (
          <div className="preview-wrap">
            <img src={preview} alt="preview" className="preview-img" />
            <div className="preview-overlay">
              <span className="preview-name">{fileInfo?.name}</span>
              <span className="preview-size">{formatSize(fileInfo?.size || 0)}</span>
            </div>
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
              {isDragActive ? 'Release to upload' : <><span>Choose file</span> or drag here</>}
            </p>
            <div className="drop-formats">
              {FMTS.map(f => <span key={f} className="fmt-chip">{f}</span>)}
            </div>
            <p className="drop-limit">Maximum 50 MB</p>
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