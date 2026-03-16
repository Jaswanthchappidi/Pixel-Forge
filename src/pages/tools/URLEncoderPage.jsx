import { useState } from 'react'
import { Link2, Copy, Check, ArrowDownUp } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import './ToolStyles.css'

export default function URLEncoderPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('encode') // encode | decode
  const [copied, setCopied] = useState(false)

  const process = (val, currentMode) => {
    setInput(val)
    if (!val.trim()) {
      setOutput('')
      return
    }
    try {
      if (currentMode === 'encode') {
        setOutput(encodeURIComponent(val))
      } else {
        setOutput(decodeURIComponent(val))
      }
    } catch (err) {
      setOutput('Error: ' + err.message)
    }
  }

  const toggleMode = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode'
    setMode(newMode)
    const oldOutput = output
    setInput(oldOutput)
    process(oldOutput, newMode)
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolPage icon={Link2} title="URL Encoder/Decoder" color="#ea580c" bg="rgba(234, 88, 12, 0.1)"
      desc="Safely encode special characters for URLs or decode encoded strings back to their original format.">
      
      <div className="tool-workspace" style={{ flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="secondary-button" onClick={toggleMode} style={{ gap: '12px', padding: '10px 24px' }}>
            <ArrowDownUp size={16} /> 
            {mode === 'encode' ? 'Switch to Decode' : 'Switch to Encode'}
          </button>
        </div>

        <div className="text-conversion-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%' }}>
          <div className="input-group">
            <label className="control-label">{mode === 'encode' ? 'Plain String (to encode)' : 'Encoded URL (to decode)'}</label>
            <textarea 
              className="styled-textarea" 
              value={input} 
              onChange={e => process(e.target.value, mode)}
              placeholder={mode === 'encode' ? 'e.g. hello world!' : 'e.g. hello%20world%21'}
              style={{ height: '300px' }}
            />
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="control-label" style={{ marginBottom: 0 }}>{mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}</label>
              <button className="copy-icon-btn" onClick={copy} disabled={!output} title="Copy Result">
                {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
              </button>
            </div>
            <textarea 
              className="styled-textarea" 
              value={output} 
              readOnly
              placeholder="Output will appear here..."
              style={{ height: '300px', background: 'rgba(255,255,255,0.03)' }}
            />
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
