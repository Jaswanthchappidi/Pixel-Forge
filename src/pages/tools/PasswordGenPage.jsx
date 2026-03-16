import { useState, useEffect } from 'react'
import { Key, Copy, Check, RefreshCw, ShieldCheck, ShieldAlert, Shield } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import './ToolStyles.css'

export default function PasswordGenPage() {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState({
    upper: true,
    lower: true,
    numbers: true,
    symbols: true
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fn = () => {
      const charset = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
      }

      let available = ''
      if (options.upper) available += charset.upper
      if (options.lower) available += charset.lower
      if (options.numbers) available += charset.numbers
      if (options.symbols) available += charset.symbols

      if (!available) {
        setPassword('Select at least one option')
        return
      }

      let result = ''
      const array = new Uint32Array(length)
      window.crypto.getRandomValues(array)
      
      for (let i = 0; i < length; i++) {
        result += available.charAt(array[i] % available.length)
      }
      setPassword(result)
    }
    fn()
  }, [length, options])

  const copy = () => {
    if (password === 'Select at least one option') return
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const getStrength = () => {
    if (password.length < 8) return { label: 'Weak', color: '#ef4444', icon: ShieldAlert }
    if (password.length < 12) return { label: 'Medium', color: '#f59e0b', icon: Shield }
    return { label: 'Strong', color: '#22c55e', icon: ShieldCheck }
  }

  const strength = getStrength()

  const handleRegenerate = () => {
    const charset = {
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lower: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }

    let available = ''
    if (options.upper) available += charset.upper
    if (options.lower) available += charset.lower
    if (options.numbers) available += charset.numbers
    if (options.symbols) available += charset.symbols

    if (!available) {
      setPassword('Select at least one option')
      return
    }

    let result = ''
    const array = new Uint32Array(length)
    window.crypto.getRandomValues(array)
    
    for (let i = 0; i < length; i++) {
      result += available.charAt(array[i] % available.length)
    }
    setPassword(result)
  }

  return (
    <ToolPage icon={Key} title="Password Generator" color="#059669" bg="rgba(5, 150, 105, 0.1)"
      desc="Create bulletproof passwords with customizable security options. All generation happens locally.">
      
      <div className="tool-workspace">
        <div className="tool-controls">
          <div className="control-section">
            <label className="control-label">Password Length: {length}</label>
            <input type="range" min="4" max="64" value={length} onChange={e => setLength(Number(e.target.value))} />
          </div>

          <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <label className="checkbox-label">
              <input type="checkbox" checked={options.upper} onChange={e => setOptions({...options, upper: e.target.checked})} />
              <span>Uppercase (A-Z)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={options.lower} onChange={e => setOptions({...options, lower: e.target.checked})} />
              <span>Lowercase (a-z)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={options.numbers} onChange={e => setOptions({...options, numbers: e.target.checked})} />
              <span>Numbers (0-9)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={options.symbols} onChange={e => setOptions({...options, symbols: e.target.checked})} />
              <span>Symbols (!@#$)</span>
            </label>
          </div>

          <div style={{ marginTop: '32px' }}>
             <button className="primary-button full-width" onClick={handleRegenerate}>
               <RefreshCw size={18} /> Regenerate Password
             </button>
          </div>
        </div>

        <div className="preview-area" style={{ flex: 1.5, background: 'var(--surface2)', borderRadius: '12px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', justifyContent: 'center' }}>
          <div className="password-display-card" style={{ padding: '24px', background: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border)', position: 'relative' }}>
            <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', color: 'var(--text-primary)', wordBreak: 'break-all', minHeight: '1.5em', paddingRight: '40px' }}>
              {password}
            </div>
            <button className="copy-icon-btn" style={{ position: 'absolute', right: '16px', top: '16px' }} onClick={copy} title="Copy">
              {copied ? <Check size={20} color="#22c55e" /> : <Copy size={20} />}
            </button>
            {copied && <span style={{ position: 'absolute', right: '50px', top: '18px', fontSize: '0.8rem', color: '#22c55e', fontWeight: 600 }}>Copied!</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
            <strength.icon size={20} color={strength.color} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>SECURITY STRENGTH</span>
              <span style={{ fontWeight: 700, color: strength.color }}>{strength.label.toUpperCase()}</span>
            </div>
            <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: strength.label === 'Strong' ? '100%' : strength.label === 'Medium' ? '60%' : '30%', height: '100%', background: strength.color }} />
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
