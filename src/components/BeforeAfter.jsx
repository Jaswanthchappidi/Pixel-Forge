import { useEffect, useRef, useState } from 'react'
import { Columns } from 'lucide-react'
import './BeforeAfter.css'

export function BeforeAfter({ originalFile, editedCanvas }) {
  const containerRef = useRef(null)
  const [sliderX,   setSliderX]   = useState(50)   // 0–100 %
  const [dragging,  setDragging]  = useState(false)
  const [origUrl,   setOrigUrl]   = useState(null)
  const [editedUrl, setEditedUrl] = useState(null)

  // Create original preview URL
  useEffect(() => {
    if (!originalFile) return
    const url = URL.createObjectURL(originalFile)
    setOrigUrl(url)
    return () => URL.revokeObjectURL(url)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalFile])

  // Capture edited canvas as data URL
  useEffect(() => {
    if (!editedCanvas) return
    setEditedUrl(editedCanvas.toDataURL('image/png'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedCanvas])

  function getPct(clientX) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return 50
    const pct = ((clientX - rect.left) / rect.width) * 100
    return Math.min(100, Math.max(0, pct))
  }

  const onMouseDown = (e) => { e.preventDefault(); setDragging(true) }
  const onMouseMove = (e) => { if (dragging) setSliderX(getPct(e.clientX)) }
  const onMouseUp   = ()  => setDragging(false)
  const onTouchMove = (e) => { setSliderX(getPct(e.touches[0].clientX)) }

  if (!originalFile) return null

  const showEdited = !!editedUrl

  return (
    <div className="ba-wrap fade-up">
      <div className="ba-header">
        <Columns size={14} />
        <span>Before / After — drag the slider</span>
        {!showEdited && (
          <span className="ba-hint">Make an edit first to see the difference</span>
        )}
      </div>

      <div
        ref={containerRef}
        className={`ba-container ${dragging ? 'dragging' : ''}`}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchMove={onTouchMove}
        onTouchEnd={onMouseUp}
      >
        {/* AFTER (edited) — full width below */}
        <div className="ba-layer after">
          {showEdited
            ? <img src={editedUrl} alt="after" className="ba-img" draggable={false} />
            : <img src={origUrl}   alt="after" className="ba-img" draggable={false} />
          }
          <span className="ba-label after-label">After</span>
        </div>

        {/* BEFORE (original) — clipped on left side */}
        <div className="ba-layer before" style={{ clipPath: `inset(0 ${100 - sliderX}% 0 0)` }}>
          <img src={origUrl} alt="before" className="ba-img" draggable={false} />
          <span className="ba-label before-label">Before</span>
        </div>

        {/* Divider */}
        <div
          className="ba-divider"
          style={{ left: `${sliderX}%` }}
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
        >
          <div className="ba-line" />
          <div className="ba-handle">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 5L3 10L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 5L17 10L13 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="ba-line" />
        </div>
      </div>
    </div>
  )
}