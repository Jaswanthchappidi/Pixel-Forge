import { useEffect, useState } from 'react'
import { Camera, MapPin, Calendar, Aperture, Trash2, CheckCircle } from 'lucide-react'
import { downloadBlob } from '../utils/imageUtils'
import './ExifViewer.css'

const FIELDS = [
  { key:'Make',             label:'Camera Make',   icon:'📷' },
  { key:'Model',            label:'Camera Model',  icon:'📷' },
  { key:'LensModel',        label:'Lens',          icon:'🔭' },
  { key:'DateTimeOriginal', label:'Date Taken',    icon:'📅' },
  { key:'ExposureTime',     label:'Exposure',      icon:'⏱'  },
  { key:'FNumber',          label:'Aperture',      icon:'🔵' },
  { key:'ISO',              label:'ISO',           icon:'💡' },
  { key:'FocalLength',      label:'Focal Length',  icon:'🔭' },
  { key:'Flash',            label:'Flash',         icon:'⚡' },
  { key:'WhiteBalance',     label:'White Balance', icon:'🌡' },
  { key:'GPSLatitude',      label:'GPS Latitude',  icon:'📍' },
  { key:'GPSLongitude',     label:'GPS Longitude', icon:'📍' },
  { key:'ImageWidth',       label:'Width',         icon:'📐' },
  { key:'ImageHeight',      label:'Height',        icon:'📐' },
  { key:'Software',         label:'Software',      icon:'💻' },
]

export function ExifViewer({ file }) {
  const [exif,    setExif]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [stripped, setStripped] = useState(false)

  useEffect(() => {
    if (!file) { setExif(null); setStripped(false); return }
    setLoading(true)
    setStripped(false)

    import('exifr').then(({ default: exifr }) => {
      exifr.parse(file, { tiff: true, exif: true, gps: true, icc: false })
        .then(data => { setExif(data || {}); setLoading(false) })
        .catch(() => { setExif({}); setLoading(false) })
    })
  }, [file])

  async function stripMetadata() {
    if (!file) return
    // Draw to canvas and re-export (strips all EXIF)
    const img  = new Image()
    const url  = URL.createObjectURL(file)
    img.onload = () => {
      const c   = document.createElement('canvas')
      c.width   = img.naturalWidth
      c.height  = img.naturalHeight
      c.getContext('2d').drawImage(img, 0, 0)
      c.toBlob(blob => {
        const name = `${file.name.replace(/\.[^.]+$/, '')}_clean.jpg`
        downloadBlob(blob, name)
        setStripped(true)
      }, 'image/jpeg', 0.95)
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  if (!file) return null

  const fields = FIELDS.filter(f => exif && exif[f.key] !== undefined && exif[f.key] !== null)
  const hasGPS = exif?.GPSLatitude && exif?.GPSLongitude

  function formatVal(key, val) {
    if (key === 'ExposureTime') return `1/${Math.round(1/val)}s`
    if (key === 'FNumber')      return `f/${val}`
    if (key === 'FocalLength')  return `${val}mm`
    if (key === 'DateTimeOriginal') return new Date(val).toLocaleString()
    if (key === 'GPSLatitude' || key === 'GPSLongitude') return Number(val).toFixed(6) + '°'
    if (typeof val === 'number') return val.toString()
    return String(val)
  }

  return (
    <div className="exif-wrap">
      {loading && <div className="exif-loading">Reading metadata…</div>}

      {!loading && exif && (
        <>
          {fields.length === 0 ? (
            <div className="exif-empty">No EXIF metadata found in this image</div>
          ) : (
            <div className="exif-grid">
              {fields.map(({ key, label, icon }) => (
                <div key={key} className="exif-row">
                  <span className="exif-icon">{icon}</span>
                  <span className="exif-label">{label}</span>
                  <span className="exif-value">{formatVal(key, exif[key])}</span>
                </div>
              ))}
              {hasGPS && (
                <a
                  className="exif-map-link"
                  href={`https://maps.google.com/?q=${exif.GPSLatitude},${exif.GPSLongitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin size={12} /> View on Google Maps
                </a>
              )}
            </div>
          )}

          <div className="exif-actions">
            <button className="exif-strip-btn" onClick={stripMetadata}>
              <Trash2 size={13} /> Strip Metadata & Download
            </button>
            {stripped && (
              <span className="exif-stripped"><CheckCircle size={12} /> Metadata stripped</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}