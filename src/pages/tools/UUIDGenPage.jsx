import { useState, useCallback } from 'react'
import { Fingerprint, Copy, Check, RefreshCw, Layers } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import './ToolStyles.css'

export default function UUIDGenPage() {
  const [count, setCount] = useState(5)
  const [uuids, setUuids] = useState(() => Array.from({ length: 5 }, () => crypto.randomUUID()))
  const [copied, setCopied] = useState(false)

  const generate = useCallback(() => {
    const newUuids = Array.from({ length: count }, () => crypto.randomUUID())
    setUuids(newUuids)
  }, [count])

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolPage icon={Fingerprint} title="UUID Generator" color="#475569" bg="rgba(71, 85, 105, 0.1)"
      desc="Generate secure, random UUID v4 identifiers. Supports bulk generation for developers.">
      
      <div className="tool-workspace" style={{ flexDirection: 'column', gap: '24px' }}>
        <div className="tool-controls" style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flex: 'none', width: '100%', maxWidth: 'none' }}>
          <div className="control-group" style={{ flex: 1 }}>
            <label>Number of UUIDs to generate</label>
            <input type="number" min="1" max="100" value={count} onChange={e => setCount(Math.min(100, Math.max(1, Number(e.target.value))))} className="styled-input" />
          </div>
          <button className="primary-button" onClick={generate} style={{ height: '44px', whiteSpace: 'nowrap' }}>
            <RefreshCw size={18} /> Generate New
          </button>
          <button className="secondary-button" onClick={copyAll} style={{ height: '44px', whiteSpace: 'nowrap' }}>
            {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Copied All' : 'Copy All'}
          </button>
        </div>

        <div className="result-area" style={{ background: 'var(--surface2)', borderRadius: '12px', padding: '24px', minHeight: '300px' }}>
          <div className="uuid-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {uuids.map((uuid, idx) => (
              <div key={idx} className="uuid-row fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '1rem', animationDelay: `${idx * 0.05}s` }}>
                <span style={{ color: 'var(--accent)' }}>{uuid}</span>
                <button className="copy-icon-btn" onClick={() => navigator.clipboard.writeText(uuid)} title="Copy UUID">
                  <Copy size={14} />
                </button>
              </div>
            ))}
          </div>
          {uuids.length === 0 && (
            <div className="empty-preview" style={{ height: '200px' }}>
              <Layers size={48} opacity={0.2} />
              <p>Click generate to create UUIDs</p>
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
