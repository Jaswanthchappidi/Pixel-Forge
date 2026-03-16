import { useState } from 'react'
import { Palette, Copy, Check, Type, Hash, Droplet } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import './ToolStyles.css'

export default function ColorPickerPage() {
  const [color, setColor] = useState('#4f46e5')
  const [copied, setCopied] = useState('')

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  // Convert Hex to RGB
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r}, ${g}, ${b}`
  }

  // Convert Hex to HSL
  const hexToHsl = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255
    let g = parseInt(hex.slice(3, 5), 16) / 255
    let b = parseInt(hex.slice(5, 7), 16) / 255
    let max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2
    if (max === min) h = s = 0
    else {
      let d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
        default: break
      }
      h /= 6
    }
    return `${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`
  }

  const rgbValue = hexToRgb(color)
  const hslValue = hexToHsl(color)

  return (
    <ToolPage icon={Palette} title="General Color Picker" color="#4f46e5" bg="rgba(79, 70, 229, 0.1)"
      desc="Select and export colors in multiple formats including HEX, RGB, and HSL.">
      
      <div className="tool-workspace">
        <div className="tool-controls" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="picker-container" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="custom-picker">
              <HexColorPicker color={color} onChange={setColor} style={{ width: '100%', maxWidth: '300px', height: '260px' }} />
              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>HEX</span>
                <HexColorInput color={color} onChange={setColor} className="styled-input" style={{ width: '100px' }} />
              </div>
            </div>
          </div>

          <div className="swatches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'].map(c => (
              <div key={c} onClick={() => setColor(c)} style={{ height: '40px', background: c, borderRadius: '6px', cursor: 'pointer', border: color === c ? '2px solid white' : 'none' }} />
            ))}
          </div>
        </div>

        <div className="preview-area" style={{ background: 'var(--surface2)', borderRadius: '12px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '120px', height: '120px', background: color, borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} />
            <div>
              <h2 style={{ fontSize: '2rem', margin: 0 }}>{color.toUpperCase()}</h2>
              <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>Selected Shade</p>
            </div>
          </div>

          <div className="format-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'HEX', value: color.toUpperCase(), icon: Hash },
              { label: 'RGB', value: `rgb(${rgbValue})`, icon: Droplet },
              { label: 'HSL', value: `hsl(${hslValue})`, icon: Type },
            ].map(f => (
              <div key={f.label} className="format-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--surface-color)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <f.icon size={18} color="var(--text-secondary)" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{f.label}</span>
                    <span style={{ fontWeight: 600 }}>{f.value}</span>
                  </div>
                </div>
                <button className="copy-icon-btn" onClick={() => copyToClipboard(f.value, f.label)} title="Copy">
                  {copied === f.label ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
