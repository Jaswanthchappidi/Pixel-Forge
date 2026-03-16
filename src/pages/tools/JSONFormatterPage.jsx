import { useState } from 'react'
import { FileJson, Copy, Check, RotateCcw, AlignLeft, Minimize, Search } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import './ToolStyles.css'

export default function JSONFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const formatJSON = (mode) => {
    setError('')
    if (!input.trim()) return
    try {
      const obj = JSON.parse(input)
      if (mode === 'beautify') {
        setOutput(JSON.stringify(obj, null, 2))
      } else {
        setOutput(JSON.stringify(obj))
      }
    } catch (err) {
      setError('Invalid JSON: ' + err.message)
      setOutput('')
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <ToolPage icon={FileJson} title="JSON Formatter" color="#2563eb" bg="rgba(37, 99, 235, 0.1)"
      desc="Validate, beautify, and minify your JSON code. Instant formatting with error detection.">
      
      <div className="tool-workspace" style={{ flexDirection: 'column', gap: '20px' }}>
        <div className="text-conversion-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%' }}>
          <div className="input-group">
            <label className="control-label">Raw JSON Input</label>
            <textarea 
              className="styled-textarea" 
              value={input} 
              onChange={e => setInput(e.target.value)}
              placeholder='{"name": "John", "age": 30}'
              style={{ height: '400px', fontFamily: 'monospace' }}
            />
            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px' }}><Search size={14} /> {error}</p>}
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="control-label" style={{ marginBottom: 0 }}>Formatted Result</label>
              <button className="copy-icon-btn" onClick={copy} disabled={!output} title="Copy Result">
                {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
              </button>
            </div>
            <textarea 
              className="styled-textarea" 
              value={output} 
              readOnly
              placeholder="Output will appear here..."
              style={{ height: '400px', background: 'rgba(255,255,255,0.03)', fontFamily: 'monospace' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '12px' }}>
          <button className="primary-button" onClick={() => formatJSON('beautify')} style={{ padding: '12px 24px' }}>
            <AlignLeft size={18} /> Beautify JSON
          </button>
          <button className="primary-button" onClick={() => formatJSON('minify')} style={{ padding: '12px 24px' }}>
             <Minimize size={18} /> Minify JSON
          </button>
          <button className="secondary-button" onClick={clear} style={{ padding: '12px 24px' }}>
             <RotateCcw size={18} /> Clear All
          </button>
        </div>
      </div>
    </ToolPage>
  )
}
