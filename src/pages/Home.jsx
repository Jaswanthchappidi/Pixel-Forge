import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { TOOLS } from '../constants/tools'
import './Home.css'

export function Home() {
  return (
    <div className="home-page">
      {/* Hero */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-badge">
            <Zap size={12} />
            100% Free · No Upload · Works Offline
          </div>
          <h1 className="hero-title">
            Every image & PDF tool<br />
            <span className="hero-accent">you'll ever need</span>
          </h1>
          <p className="hero-sub">
            All tools run entirely in your browser — no files ever leave your device.
          </p>
          <div className="hero-stats">
            <div className="stat"><strong>42</strong><span>Tools</span></div>
            <div className="stat-div" />
            <div className="stat"><strong>0</strong><span>Uploads</span></div>
            <div className="stat-div" />
            <div className="stat"><strong>100%</strong><span>Free</span></div>
          </div>
        </div>
      </div>

      {/* Tool sections */}
      <div className="tools-container">
        {TOOLS.map(section => (
          <div key={section.category} className="tool-section">
            <h2 className="section-heading">{section.category}</h2>
            <div className="tool-grid">
              {section.items.map(tool => {
                const Icon = tool.icon
                return (
                  <Link key={tool.slug} to={`/tools/${tool.slug}`} className="tool-card">
                    <div className="tool-card-icon" style={{ background: tool.bg, color: tool.color }}>
                      <Icon size={26} strokeWidth={1.8} />
                    </div>
                    <div className="tool-card-body">
                      <div className="tool-card-title-row">
                        <h3 className="tool-card-title">{tool.title}</h3>
                        {tool.badge && (
                          <span className="tool-badge" style={{ background: tool.color }}>
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="tool-card-desc">{tool.desc}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom trust bar */}
      <div className="trust-bar">
        <div className="trust-inner">
          {[
            { icon: '🔒', title: 'Private',  desc: 'Files never leave your browser' },
            { icon: '⚡', title: 'Fast',     desc: 'No upload wait time'            },
            { icon: '🆓', title: 'Free',     desc: 'No account or payment needed'   },
            { icon: '📱', title: 'Any Device',desc: 'Works on phone, tablet, PC'    },
          ].map(t => (
            <div key={t.title} className="trust-item">
              <span className="trust-icon">{t.icon}</span>
              <div>
                <p className="trust-title">{t.title}</p>
                <p className="trust-desc">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}