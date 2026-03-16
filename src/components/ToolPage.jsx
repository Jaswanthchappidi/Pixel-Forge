import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import './ToolPage.css'

export function ToolPage({ icon, title, desc, color = '#00c9a7', bg = '#e6faf7', children, badge }) {
  const Icon = icon
  return (
    <div className="tool-page">
      {/* Breadcrumb */}
      <div className="tool-page-nav">
        <div className="tool-page-nav-inner">
          <Link to="/" className="back-link">
            <ArrowLeft size={14} /> All Tools
          </Link>
        </div>
      </div>

      {/* Tool header */}
      <div className="tool-page-hero" style={{ '--tool-color': color, '--tool-bg': bg }}>
        <div className="tool-page-hero-inner">
          <div className="tool-page-icon" style={{ background: bg, color }}>
            {Icon && <Icon size={32} strokeWidth={1.6} />}
          </div>
          <div className="tool-page-meta">
            <div className="tool-page-title-row">
              <h1 className="tool-page-title">{title}</h1>
              {badge && <span className="tool-page-badge" style={{ background: color }}>{badge}</span>}
            </div>
            <p className="tool-page-desc">{desc}</p>
          </div>
          <div className="tool-page-private-badge">
            🔒 Files never leave your device
          </div>
        </div>
      </div>

      {/* Tool content */}
      <div className="tool-page-content">
        <div className="tool-page-content-inner">
          {children}
        </div>
      </div>
    </div>
  )
}