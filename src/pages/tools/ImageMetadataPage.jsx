import { FileText } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { ImageUpload } from '../../components/ImageUpload'
import { useState, useEffect } from 'react'
import EXIF from 'exif-js' // Ensure this was installed via npm install exif-js
import './ToolStyles.css'

export default function ImageMetadataPage() {
  const [file, setFile] = useState(null)
  
  const [basicData, setBasicData] = useState(null)
  const [exifData, setExifData] = useState(null)
  const [loading, setLoading] = useState(false)

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  useEffect(() => {
    if (!file) return
    setLoading(true)
    
    // Get basic file info & dimensions
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setBasicData({
        name: file.name,
        type: file.type || 'Unknown',
        size: formatSize(file.size),
        lastModified: new Date(file.lastModified).toLocaleString(),
        dimensions: `${img.width} x ${img.height} px`,
      })
      URL.revokeObjectURL(url)
    }
    img.src = url

    // Extract EXIF
    EXIF.getData(file, function() {
      const tags = EXIF.getAllTags(this) || {}
      
      // Filter out huge array data like thumbnails
      const cleanTags = {}
      for (let key in tags) {
        if (key === 'thumbnail' || key === 'MakerNote' || key === 'UserComment') continue
        let val = tags[key]
        if (val && typeof val === 'object' && val.length > 50) continue
        
        // Convert to string safely
        if (typeof val === 'object' && val.numerator && val.denominator) {
            val = `${val.numerator}/${val.denominator} (${(val.numerator/val.denominator).toFixed(4)})`
        }
        cleanTags[key] = String(val)
      }
      
      setExifData(Object.keys(cleanTags).length > 0 ? cleanTags : null)
      setLoading(false)
    })
  }, [file])

  return (
    <ToolPage 
      icon={FileText} 
      title="Image Metadata Viewer" 
      color="#0284c7" 
      bg="rgba(2, 132, 199, 0.1)"
      desc="View image dimensions, file type, and hidden EXIF metadata.">
      
      <div className="tool-workspace">
        {!file ? (
          <ImageUpload onImageLoaded={setFile} />
        ) : (
          <div className="tool-controls" style={{ alignItems: 'flex-start' }}>
            <h3>Basic File Information</h3>
            {basicData && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '20px' }}>
                <tbody>
                  {Object.entries(basicData).map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '8px 0', color: 'var(--text-secondary)', textTransform: 'capitalize', width: '30%' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</th>
                      <td style={{ padding: '8px 0', color: 'var(--text-primary)' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <h3>EXIF Metadata</h3>
            {loading ? (
              <p>Extracting data...</p>
            ) : exifData ? (
              <div style={{ maxHeight: '400px', overflowY: 'auto', width: '100%', background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)'}}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <tbody>
                    {Object.entries(exifData).map(([k, v]) => (
                      <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '6px 0', color: 'var(--text-secondary)', width: '40%', fontSize: '0.85rem' }}>{k}</th>
                        <td style={{ padding: '6px 0', color: 'var(--text-primary)', wordBreak: 'break-all', fontSize: '0.85rem' }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No EXIF data found in this image. (Images downloaded from social media often have EXIF stripped).</p>
            )}
            
            <button className="styled-button secondary" onClick={() => setFile(null)} style={{ marginTop: '20px' }}>
              Upload Another Image
            </button>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
