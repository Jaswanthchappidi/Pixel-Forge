import { useEffect, useState, useCallback } from 'react'
import { Trash2, Download, Clock } from 'lucide-react'
import { getAllImages, deleteImage } from '../utils/storage'
import { formatSize, downloadBlob } from '../utils/imageUtils'
import './HistoryPanel.css'

export function HistoryPanel({ refreshTrigger }) {
  const [images, setImages] = useState([])

  const load = useCallback(async () => {
    const all = await getAllImages()
    setImages(all.sort((a, b) => b.createdAt - a.createdAt))
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [refreshTrigger, load])

  const handleDelete = async (id) => { await deleteImage(id); load() }
  const handleDownload = (img) => downloadBlob(img.blob, img.name)

  if (images.length === 0) return (
    <div className="history-empty">
      <Clock size={28} />
      <p>No conversions yet — your history will appear here</p>
    </div>
  )

  return (
    <div className="history-list">
      {images.map((img, i) => (
        <div key={img.id} className="history-card" style={{ animationDelay: `${i * 0.05}s` }}>
          <div className="history-thumb">
            <img src={URL.createObjectURL(img.blob)} alt={img.name}
              onLoad={e => URL.revokeObjectURL(e.target.src)} />
          </div>
          <div className="history-info">
            <span className="history-name">{img.name}</span>
            <div className="history-meta">
              <span className="history-fmt">{img.format?.toUpperCase()}</span>
              <span className="history-size">{formatSize(img.size)}</span>
            </div>
            <span className="history-time">
              {new Date(img.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
            </span>
          </div>
          <div className="history-actions">
            <button className="h-action dl" onClick={() => handleDownload(img)} title="Download">
              <Download size={13} />
            </button>
            <button className="h-action del" onClick={() => handleDelete(img.id)} title="Delete">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}