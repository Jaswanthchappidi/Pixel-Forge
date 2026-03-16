import './DailyLimitBar.css'

export function DailyLimitBar({ usage, max }) {
  const pct  = Math.min(100, (usage / max) * 100)
  const warn = pct >= 80
  const full = pct >= 100
  return (
    <div className={`limit-widget ${warn ? 'warn' : ''} ${full ? 'full' : ''}`}>
      <span className="limit-label">Daily</span>
      <div className="limit-track">
        <div className="limit-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="limit-count">{full ? 'MAX' : `${usage}/${max}`}</span>
    </div>
  )
}