import { useEffect, useRef, useState } from 'react'
import {
  RotateCcw, RotateCw, FlipHorizontal, FlipVertical,
  Undo2, Redo2, Crop, Check, X as XIcon, Type,
  Pipette, BarChart2, Maximize2, SlidersHorizontal,
  Sparkles, Bold, Copy
} from 'lucide-react'
import { Histogram } from './Histogram'
import './ImageEditor.css'

const DEFAULT_FILTERS = { brightness:100, contrast:100, saturation:100, blur:0, grayscale:0, sepia:0 }
const DEFAULT_EFFECTS  = { vignette: 0, grain: 0 }
const DEFAULT_TEXT     = { show:false, content:'', size:52, color:'#ffffff', x:50, y:85, bold:false, opacity:90, stroke:true, font:'sans-serif' }

const SLIDERS = [
  { key:'brightness', label:'Brightness', min:0,   max:200, step:1,   unit:'%'  },
  { key:'contrast',   label:'Contrast',   min:0,   max:200, step:1,   unit:'%'  },
  { key:'saturation', label:'Saturation', min:0,   max:200, step:1,   unit:'%'  },
  { key:'grayscale',  label:'Grayscale',  min:0,   max:100, step:1,   unit:'%'  },
  { key:'sepia',      label:'Sepia',      min:0,   max:100, step:1,   unit:'%'  },
  { key:'blur',       label:'Blur',       min:0,   max:20,  step:0.5, unit:'px' },
]

const PRESETS = [
  { name:'Original', f:{ ...DEFAULT_FILTERS } },
  { name:'Chrome',   f:{ brightness:110, contrast:120, saturation:130, blur:0, grayscale:0,   sepia:0  } },
  { name:'Fade',     f:{ brightness:115, contrast:85,  saturation:80,  blur:0, grayscale:0,   sepia:15 } },
  { name:'Mono',     f:{ brightness:105, contrast:110, saturation:0,   blur:0, grayscale:100, sepia:0  } },
  { name:'Warm',     f:{ brightness:105, contrast:100, saturation:120, blur:0, grayscale:0,   sepia:30 } },
  { name:'Cool',     f:{ brightness:100, contrast:110, saturation:90,  blur:0, grayscale:10,  sepia:0  } },
]

const CTRL_TABS = [
  { id:'filters',   label:'Filters',   Icon: SlidersHorizontal },
  { id:'transform', label:'Transform', Icon: Crop              },
  { id:'effects',   label:'Effects',   Icon: Sparkles          },
  { id:'text',      label:'Text',      Icon: Type              },
]

// Seeded random for consistent grain
function seededRand(seed) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

export function ImageEditor({ file, onEditedCanvas }) {
  const canvasRef      = useRef(null)
  const imgRef         = useRef(null)       // current base Image element
  const cropOverRef    = useRef(null)       // overlay canvas for crop UI
  const isDragging     = useRef(false)

  const [filters,      setFilters]      = useState({ ...DEFAULT_FILTERS })
  const [rotation,     setRotation]     = useState(0)
  const [flipH,        setFlipH]        = useState(false)
  const [flipV,        setFlipV]        = useState(false)
  const [effects,      setEffects]      = useState({ ...DEFAULT_EFFECTS })
  const [textCfg,      setTextCfg]      = useState({ ...DEFAULT_TEXT })
  const [preset,       setPreset]       = useState('Original')
  const [activeTab,    setActiveTab]    = useState('filters')

  // Undo / Redo
  const [history,      setHistory]      = useState([])
  const [hIdx,         setHIdx]         = useState(-1)

  // Crop
  const [cropMode,     setCropMode]     = useState(false)
  const [cropStart,    setCropStart]    = useState(null)
  const [cropEnd,      setCropEnd]      = useState(null)

  // Resize
  const [resizeW,      setResizeW]      = useState('')
  const [resizeH,      setResizeH]      = useState('')
  const [lockAspect,   setLockAspect]   = useState(true)

  // Color picker
  const [pickerMode,   setPickerMode]   = useState(false)
  const [pickedColor,  setPickedColor]  = useState(null)

  // Histogram
  const [showHist,     setShowHist]     = useState(false)

  // ── Load file ──────────────────────────────────────────
  useEffect(() => {
    if (!file) return
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      setResizeW(img.width)
      setResizeH(img.height)
      setFilters({ ...DEFAULT_FILTERS })
      setRotation(0); setFlipH(false); setFlipV(false)
      setEffects({ ...DEFAULT_EFFECTS })
      setTextCfg({ ...DEFAULT_TEXT })
      setHistory([]); setHIdx(-1)
      setCropMode(false); setCropStart(null); setCropEnd(null)
      setPickerMode(false); setPickedColor(null)
      draw(img, DEFAULT_FILTERS, 0, false, false, DEFAULT_EFFECTS, { ...DEFAULT_TEXT })
    }
    img.src = URL.createObjectURL(file)
    return () => URL.revokeObjectURL(img.src)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  // ── Redraw on state change ─────────────────────────────
  useEffect(() => {
    if (imgRef.current) draw(imgRef.current, filters, rotation, flipH, flipV, effects, textCfg)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, rotation, flipH, flipV, effects, textCfg])

  // ── Draw function ──────────────────────────────────────
  function draw(img, f, rot, fh, fv, eff, txt) {
    const canvas = canvasRef.current
    if (!canvas || !img) return
    const rad = (rot * Math.PI) / 180
    const sin = Math.abs(Math.sin(rad)), cos = Math.abs(Math.cos(rad))
    canvas.width  = img.width  * cos + img.height * sin
    canvas.height = img.width  * sin + img.height * cos

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Image with filters
    ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%)`
    ctx.save()
    ctx.translate(canvas.width/2, canvas.height/2)
    ctx.rotate(rad)
    ctx.scale(fh ? -1 : 1, fv ? -1 : 1)
    ctx.drawImage(img, -img.width/2, -img.height/2)
    ctx.restore()
    ctx.filter = 'none'

    // Vignette
    if (eff.vignette > 0) {
      const grad = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, Math.min(canvas.width, canvas.height) * 0.25,
        canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height) * 0.75
      )
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(1, `rgba(0,0,0,${eff.vignette / 100})`)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Grain
    if (eff.grain > 0) {
      const rand   = seededRand(42)
      const id     = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data   = id.data
      const amount = eff.grain * 2.55
      for (let i = 0; i < data.length; i += 4) {
        const n = (rand() - 0.5) * amount
        data[i]   = Math.min(255, Math.max(0, data[i]   + n))
        data[i+1] = Math.min(255, Math.max(0, data[i+1] + n))
        data[i+2] = Math.min(255, Math.max(0, data[i+2] + n))
      }
      ctx.putImageData(id, 0, 0)
    }

    // Text overlay
    if (txt.show && txt.content) {
      ctx.save()
      ctx.globalAlpha = txt.opacity / 100
      ctx.font        = `${txt.bold ? 'bold ' : ''}${txt.size}px ${txt.font}`
      ctx.fillStyle   = txt.color
      ctx.textAlign   = 'center'
      const x = (txt.x / 100) * canvas.width
      const y = (txt.y / 100) * canvas.height
      if (txt.stroke) {
        ctx.strokeStyle = 'rgba(0,0,0,0.6)'
        ctx.lineWidth   = txt.size / 12
        ctx.strokeText(txt.content, x, y)
      }
      ctx.fillText(txt.content, x, y)
      ctx.restore()
    }

    onEditedCanvas?.(canvas)
  }

  // ── History ────────────────────────────────────────────
  function pushHistory() {
    const canvas = canvasRef.current
    if (!canvas) return
    const snap = {
      dataUrl: canvas.toDataURL(),
      filters: { ...filters }, rotation, flipH, flipV,
      effects: { ...effects }, textCfg: { ...textCfg }
    }
    const newHistory = history.slice(0, hIdx + 1)
    newHistory.push(snap)
    if (newHistory.length > 30) newHistory.shift()
    setHistory(newHistory)
    setHIdx(newHistory.length - 1)
  }

  function restoreSnap(snap) {
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      setFilters(snap.filters)
      setRotation(snap.rotation)
      setFlipH(snap.flipH)
      setFlipV(snap.flipV)
      setEffects(snap.effects)
      setTextCfg(snap.textCfg)
      draw(img, snap.filters, snap.rotation, snap.flipH, snap.flipV, snap.effects, snap.textCfg)
    }
    img.src = snap.dataUrl
  }

  function undo() {
    if (hIdx <= 0) return
    const newIdx = hIdx - 1
    setHIdx(newIdx)
    restoreSnap(history[newIdx])
  }

  function redo() {
    if (hIdx >= history.length - 1) return
    const newIdx = hIdx + 1
    setHIdx(newIdx)
    restoreSnap(history[newIdx])
  }

  // ── Keyboard shortcuts ─────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hIdx, history])

  // ── Crop ───────────────────────────────────────────────
  function getCanvasPos(e) {
    const canvas = canvasRef.current
    const rect   = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (canvas.width  / rect.width),
      y: (e.clientY - rect.top)  * (canvas.height / rect.height),
    }
  }

  function onCropMouseDown(e) { isDragging.current = true; const p = getCanvasPos(e); setCropStart(p); setCropEnd(p) }
  function onCropMouseMove(e) { if (isDragging.current) setCropEnd(getCanvasPos(e)) }
  function onCropMouseUp()    { isDragging.current = false }

  function applyCrop() {
    if (!cropStart || !cropEnd) return
    const canvas = canvasRef.current
    const x = Math.round(Math.min(cropStart.x, cropEnd.x))
    const y = Math.round(Math.min(cropStart.y, cropEnd.y))
    const w = Math.round(Math.abs(cropEnd.x - cropStart.x))
    const h = Math.round(Math.abs(cropEnd.y - cropStart.y))
    if (w < 4 || h < 4) return

    pushHistory()

    const tmp  = document.createElement('canvas')
    tmp.width  = w; tmp.height = h
    tmp.getContext('2d').drawImage(canvas, x, y, w, h, 0, 0, w, h)

    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      setResizeW(w); setResizeH(h)
      setRotation(0); setFlipH(false); setFlipV(false)
      draw(img, filters, 0, false, false, effects, textCfg)
    }
    img.src = tmp.toDataURL()
    setCropMode(false); setCropStart(null); setCropEnd(null)
  }

  function cancelCrop() { setCropMode(false); setCropStart(null); setCropEnd(null) }

  // Crop overlay drawing
  useEffect(() => {
    const ov = cropOverRef.current
    const cv = canvasRef.current
    if (!ov || !cv) return
    if (!cropMode) return
    ov.width  = cv.clientWidth
    ov.height = cv.clientHeight
    const ctx = ov.getContext('2d')
    ctx.clearRect(0, 0, ov.width, ov.height)

    if (cropStart && cropEnd) {
      const scaleX = ov.width  / cv.width
      const scaleY = ov.height / cv.height
      const x = Math.min(cropStart.x, cropEnd.x) * scaleX
      const y = Math.min(cropStart.y, cropEnd.y) * scaleY
      const w = Math.abs(cropEnd.x - cropStart.x) * scaleX
      const h = Math.abs(cropEnd.y - cropStart.y) * scaleY

      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.fillRect(0, 0, ov.width, ov.height)
      ctx.clearRect(x, y, w, h)
      ctx.strokeStyle = 'rgba(0,212,170,0.9)'
      ctx.lineWidth   = 2
      ctx.strokeRect(x, y, w, h)
      // Rule of thirds
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.moveTo(x + w/3, y); ctx.lineTo(x + w/3, y + h)
      ctx.moveTo(x + 2*w/3, y); ctx.lineTo(x + 2*w/3, y + h)
      ctx.moveTo(x, y + h/3); ctx.lineTo(x + w, y + h/3)
      ctx.moveTo(x, y + 2*h/3); ctx.lineTo(x + w, y + 2*h/3)
      ctx.stroke()
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.fillRect(0, 0, ov.width, ov.height)
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Drag to select crop area', ov.width/2, ov.height/2)
    }
  }, [cropMode, cropStart, cropEnd])

  // ── Resize ─────────────────────────────────────────────
  function applyResize() {
    const w = parseInt(resizeW), h = parseInt(resizeH)
    if (!w || !h || w < 1 || h < 1) return
    pushHistory()
    const canvas = canvasRef.current
    const tmp  = document.createElement('canvas')
    tmp.width  = w; tmp.height = h
    tmp.getContext('2d').drawImage(canvas, 0, 0, w, h)
    const img  = new Image()
    img.onload = () => {
      imgRef.current = img
      setRotation(0); setFlipH(false); setFlipV(false)
      draw(img, filters, 0, false, false, effects, textCfg)
    }
    img.src = tmp.toDataURL()
  }

  function onResizeW(val) {
    setResizeW(val)
    if (lockAspect && imgRef.current) {
      const ratio = imgRef.current.height / imgRef.current.width
      setResizeH(Math.round(val * ratio))
    }
  }
  function onResizeH(val) {
    setResizeH(val)
    if (lockAspect && imgRef.current) {
      const ratio = imgRef.current.width / imgRef.current.height
      setResizeW(Math.round(val * ratio))
    }
  }

  // ── Color Picker ───────────────────────────────────────
  function onCanvasClick(e) {
    if (!pickerMode) return
    const canvas = canvasRef.current
    const pos    = getCanvasPos(e)
    const pixel  = canvas.getContext('2d').getImageData(Math.round(pos.x), Math.round(pos.y), 1, 1).data
    const hex    = '#' + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2,'0')).join('')
    setPickedColor({ hex, r: pixel[0], g: pixel[1], b: pixel[2] })
  }

  // ── Helpers ────────────────────────────────────────────
  const setFilter   = (k, v) => { setPreset(''); setFilters(p => ({ ...p, [k]: Number(v) })) }
  const setEffect   = (k, v) => setEffects(p => ({ ...p, [k]: Number(v) }))
  const setTxt      = (k, v) => setTextCfg(p => ({ ...p, [k]: v }))
  const applyPreset = (p)    => { setPreset(p.name); setFilters({ ...p.f }) }
  const resetAll    = ()     => {
    setFilters({ ...DEFAULT_FILTERS }); setRotation(0); setFlipH(false); setFlipV(false)
    setEffects({ ...DEFAULT_EFFECTS }); setTextCfg({ ...DEFAULT_TEXT }); setPreset('Original')
  }

  if (!file) return null

  const cropRect = cropStart && cropEnd ? {
    x: Math.min(cropStart.x, cropEnd.x), y: Math.min(cropStart.y, cropEnd.y),
    w: Math.abs(cropEnd.x - cropStart.x), h: Math.abs(cropEnd.y - cropStart.y)
  } : null

  return (
    <div className="editor-wrap fade-up">
      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button className={`tool-btn ${hIdx <= 0 ? 'disabled' : ''}`} onClick={undo} title="Undo (Ctrl+Z)">
            <Undo2 size={14} /> Undo
          </button>
          <button className={`tool-btn ${hIdx >= history.length - 1 ? 'disabled' : ''}`} onClick={redo} title="Redo (Ctrl+Y)">
            <Redo2 size={14} /> Redo
          </button>
          <span className="toolbar-sep" />
          <button className={`tool-btn ${pickerMode ? 'active' : ''}`} onClick={() => { setPickerMode(v => !v); setCropMode(false) }} title="Color Picker">
            <Pipette size={14} /> Picker
          </button>
          <button className={`tool-btn ${showHist ? 'active' : ''}`} onClick={() => setShowHist(v => !v)} title="Histogram">
            <BarChart2 size={14} /> Histogram
          </button>
        </div>
        <div className="toolbar-right">
          {pickedColor && (
            <div className="picked-color-badge">
              <span className="picked-swatch" style={{ background: pickedColor.hex }} />
              <span className="picked-hex">{pickedColor.hex.toUpperCase()}</span>
              <span className="picked-rgb">rgb({pickedColor.r},{pickedColor.g},{pickedColor.b})</span>
              <button onClick={() => { navigator.clipboard.writeText(pickedColor.hex) }} title="Copy HEX">
                <Copy size={11} />
              </button>
            </div>
          )}
          <button className="tool-btn danger" onClick={resetAll}>
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* ── Canvas + Controls ────────────────────────── */}
      <div className="editor-grid">
        {/* Canvas */}
        <div className="canvas-area">
          <div className="canvas-frame" style={{ position:'relative' }}>
            <canvas
              ref={canvasRef}
              className="edit-canvas"
              style={{ cursor: pickerMode ? 'crosshair' : cropMode ? 'crosshair' : 'default' }}
              onClick={onCanvasClick}
            />
            {cropMode && (
              <canvas
                ref={cropOverRef}
                className="crop-overlay"
                onMouseDown={onCropMouseDown}
                onMouseMove={onCropMouseMove}
                onMouseUp={onCropMouseUp}
              />
            )}
          </div>

          {/* Crop confirm bar */}
          {cropMode && (
            <div className="crop-bar">
              <span className="crop-bar-info">
                {cropRect ? `${Math.round(cropRect.w)} × ${Math.round(cropRect.h)} px` : 'Drag to select'}
              </span>
              <button className="crop-apply-btn" onClick={applyCrop} disabled={!cropRect || cropRect.w < 4}>
                <Check size={14} /> Apply Crop
              </button>
              <button className="crop-cancel-btn" onClick={cancelCrop}>
                <XIcon size={14} /> Cancel
              </button>
            </div>
          )}

          {/* Histogram */}
          {showHist && <Histogram sourceCanvas={canvasRef.current} trigger={filters} />}
        </div>

        {/* Controls panel */}
        <div className="controls-panel">
          {/* Tab buttons */}
          <div className="ctrl-tab-bar">
            {CTRL_TABS.map((t) => (
              <button key={t.id} className={`ctrl-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                <t.Icon size={12} /> {t.label}
              </button>
            ))}
          </div>
          {/* ── Filters tab ──────────────────────────── */}
          {activeTab === 'filters' && (
            <div className="ctrl-body">
              <div className="ctrl-section">
                <div className="ctrl-section-head">Presets</div>
                <div className="ctrl-section-body">
                  <div className="presets-grid">
                    {PRESETS.map(p => (
                      <button key={p.name} className={`preset-btn ${preset === p.name ? 'current' : ''}`} onClick={() => applyPreset(p)}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="ctrl-section">
                <div className="ctrl-section-head">Adjustments</div>
                <div className="ctrl-section-body">
                  {SLIDERS.map(({ key, label, min, max, step, unit }) => (
                    <div key={key} className="slider-item">
                      <div className="slider-head">
                        <span className="slider-name">{label}</span>
                        <span className="slider-value">{filters[key]}{unit}</span>
                      </div>
                      <input type="range" className="range-input" min={min} max={max} step={step}
                        value={filters[key]}
                        onChange={e => setFilter(key, e.target.value)}
                        onMouseUp={pushHistory}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Transform tab ────────────────────────── */}
          {activeTab === 'transform' && (
            <div className="ctrl-body">
              <div className="ctrl-section">
                <div className="ctrl-section-head">Rotate & Flip</div>
                <div className="ctrl-section-body">
                  <div className="transform-grid">
                    <button className="t-btn" onClick={() => { setRotation(r => r - 90); pushHistory() }} title="Rotate Left"><RotateCcw size={15}/></button>
                    <button className="t-btn" onClick={() => { setRotation(r => r + 90); pushHistory() }} title="Rotate Right"><RotateCw size={15}/></button>
                    <button className={`t-btn ${flipH ? 'on' : ''}`} onClick={() => { setFlipH(v => !v); pushHistory() }} title="Flip H"><FlipHorizontal size={15}/></button>
                    <button className={`t-btn ${flipV ? 'on' : ''}`} onClick={() => { setFlipV(v => !v); pushHistory() }} title="Flip V"><FlipVertical size={15}/></button>
                  </div>
                </div>
              </div>
              <div className="ctrl-section">
                <div className="ctrl-section-head">Crop</div>
                <div className="ctrl-section-body">
                  <button
                    className={`full-btn ${cropMode ? 'active-btn' : ''}`}
                    onClick={() => { setCropMode(v => !v); setPickerMode(false) }}
                  >
                    <Crop size={14} /> {cropMode ? 'Exit Crop Mode' : 'Enter Crop Mode'}
                  </button>
                  <p className="ctrl-hint">Click the button then drag on the image to select crop area</p>
                </div>
              </div>
              <div className="ctrl-section">
                <div className="ctrl-section-head">Resize</div>
                <div className="ctrl-section-body">
                  <div className="resize-inputs">
                    <div className="resize-field">
                      <label>Width (px)</label>
                      <input type="number" value={resizeW} onChange={e => onResizeW(e.target.value)} min={1} />
                    </div>
                    <div className="resize-lock">
                      <button className={`lock-btn ${lockAspect ? 'on' : ''}`} onClick={() => setLockAspect(v => !v)} title="Lock aspect ratio">
                        {lockAspect ? '🔒' : '🔓'}
                      </button>
                    </div>
                    <div className="resize-field">
                      <label>Height (px)</label>
                      <input type="number" value={resizeH} onChange={e => onResizeH(e.target.value)} min={1} />
                    </div>
                  </div>
                  <button className="full-btn" onClick={applyResize}>
                    <Maximize2 size={14} /> Apply Resize
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Effects tab ──────────────────────────── */}
          {activeTab === 'effects' && (
            <div className="ctrl-body">
              <div className="ctrl-section">
                <div className="ctrl-section-head">Vignette</div>
                <div className="ctrl-section-body">
                  <div className="slider-item">
                    <div className="slider-head">
                      <span className="slider-name">Intensity</span>
                      <span className="slider-value">{effects.vignette}%</span>
                    </div>
                    <input type="range" className="range-input" min={0} max={100} step={1}
                      value={effects.vignette} onChange={e => setEffect('vignette', e.target.value)} onMouseUp={pushHistory} />
                  </div>
                  <div className="effect-preview vignette-preview" style={{ '--v': `${effects.vignette/100}` }} />
                </div>
              </div>
              <div className="ctrl-section">
                <div className="ctrl-section-head">Film Grain</div>
                <div className="ctrl-section-body">
                  <div className="slider-item">
                    <div className="slider-head">
                      <span className="slider-name">Amount</span>
                      <span className="slider-value">{effects.grain}%</span>
                    </div>
                    <input type="range" className="range-input" min={0} max={100} step={1}
                      value={effects.grain} onChange={e => setEffect('grain', e.target.value)} onMouseUp={pushHistory} />
                  </div>
                  <p className="ctrl-hint">Adds authentic film grain texture to the image</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Text tab ─────────────────────────────── */}
          {activeTab === 'text' && (
            <div className="ctrl-body">
              <div className="ctrl-section">
                <div className="ctrl-section-head">
                  Text Overlay
                  <label className="toggle" style={{ marginLeft: 'auto' }}>
                    <input type="checkbox" checked={textCfg.show} onChange={e => setTxt('show', e.target.checked)} />
                    <span className="toggle-track" />
                  </label>
                </div>
                <div className="ctrl-section-body">
                  <div className="text-input-row">
                    <input
                      type="text"
                      placeholder="Enter watermark text…"
                      value={textCfg.content}
                      onChange={e => setTxt('content', e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div className="text-options-grid">
                    <div className="text-opt">
                      <label>Font Size</label>
                      <div className="slider-head" style={{ marginTop:4 }}>
                        <input type="range" className="range-input" min={12} max={200} step={2}
                          value={textCfg.size} onChange={e => setTxt('size', Number(e.target.value))} />
                        <span className="slider-value" style={{ marginLeft:8, flexShrink:0 }}>{textCfg.size}px</span>
                      </div>
                    </div>
                    <div className="text-opt">
                      <label>Opacity</label>
                      <div className="slider-head" style={{ marginTop:4 }}>
                        <input type="range" className="range-input" min={10} max={100} step={5}
                          value={textCfg.opacity} onChange={e => setTxt('opacity', Number(e.target.value))} />
                        <span className="slider-value" style={{ marginLeft:8, flexShrink:0 }}>{textCfg.opacity}%</span>
                      </div>
                    </div>
                    <div className="text-opt">
                      <label>Position X</label>
                      <div className="slider-head" style={{ marginTop:4 }}>
                        <input type="range" className="range-input" min={0} max={100} step={1}
                          value={textCfg.x} onChange={e => setTxt('x', Number(e.target.value))} />
                        <span className="slider-value" style={{ marginLeft:8, flexShrink:0 }}>{textCfg.x}%</span>
                      </div>
                    </div>
                    <div className="text-opt">
                      <label>Position Y</label>
                      <div className="slider-head" style={{ marginTop:4 }}>
                        <input type="range" className="range-input" min={0} max={100} step={1}
                          value={textCfg.y} onChange={e => setTxt('y', Number(e.target.value))} />
                        <span className="slider-value" style={{ marginLeft:8, flexShrink:0 }}>{textCfg.y}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-bottom-row">
                    <div className="text-opt-inline">
                      <label>Color</label>
                      <input type="color" value={textCfg.color} onChange={e => setTxt('color', e.target.value)} className="color-input" />
                    </div>
                    <button className={`icon-toggle ${textCfg.bold ? 'on' : ''}`} onClick={() => setTxt('bold', !textCfg.bold)}>
                      <Bold size={13} /> Bold
                    </button>
                    <button className={`icon-toggle ${textCfg.stroke ? 'on' : ''}`} onClick={() => setTxt('stroke', !textCfg.stroke)}>
                      Outline
                    </button>
                  </div>

                  <div className="text-opt">
                    <label>Font</label>
                    <select value={textCfg.font} onChange={e => setTxt('font', e.target.value)} style={{ width:'100%', marginTop:6 }}>
                      <option value="sans-serif">Sans Serif</option>
                      <option value="serif">Serif</option>
                      <option value="monospace">Monospace</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Impact">Impact</option>
                      <option value="Arial Black">Arial Black</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}