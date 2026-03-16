import { useState, useRef, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Layers, Search, Menu, ChevronRight } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { TOOLS } from '../constants/tools'
import './Layout.css'

export function Layout() {
  const loc = useLocation()
  const isHome = loc.pathname === '/'
  const [showMenu, setShowMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const menuRef = useRef(null)
  const searchRef = useRef(null)

  // Flatten tools for search
  const allTools = TOOLS.flatMap(cat => cat.items)
  const filteredTools = searchQuery.trim() 
    ? allTools.filter(tool => 
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8) // Limit to 8 results
    : []

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchQuery('')
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setSearchQuery('')
        setShowMenu(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close menus on navigation
  useEffect(() => {
    setShowMenu(false)
    setSearchQuery('')
  }, [loc.pathname])

  return (
    <div className="site-layout">
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="site-logo">
            <div className="logo-icon"><Layers size={18} strokeWidth={2} /></div>
            <span className="logo-name">PixelForge</span>
          </Link>

          <div className="header-search" ref={searchRef}>
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for tools..." 
              className="search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {filteredTools.length > 0 && (
              <div className="search-results fade-up">
                {filteredTools.map(tool => (
                  <Link 
                    key={tool.slug} 
                    to={`/tools/${tool.slug}`}
                    className="search-result-item"
                  >
                    <div className="result-icon" style={{ background: tool.bg, color: tool.color }}>
                      <tool.icon size={16} />
                    </div>
                    <div className="result-info">
                      <div className="result-title">{tool.title}</div>
                      <div className="result-desc">{tool.desc}</div>
                    </div>
                    <ChevronRight size={14} className="result-arrow" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <nav className="site-nav" ref={menuRef}>
            <div className="menu-container">
              <button 
                className={`icon-btn ${showMenu ? 'active' : ''}`} 
                onClick={() => setShowMenu(!showMenu)}
                title="Tools Menu"
              >
                <Menu size={20} />
              </button>

              {showMenu && (
                <div className="tools-dropdown fade-up">
                  <div className="dropdown-header">
                    <h3>All Tools</h3>
                    <p>{TOOLS.reduce((acc, cat) => acc + cat.items.length, 0)} tools available</p>
                  </div>
                  <div className="dropdown-content">
                    {TOOLS.map(section => (
                      <div key={section.category} className="dropdown-section">
                        <h4 className="dropdown-section-title">{section.category}</h4>
                        <div className="dropdown-items">
                          {section.items.map(tool => (
                            <Link 
                              key={tool.slug} 
                              to={`/tools/${tool.slug}`}
                              className="dropdown-item"
                            >
                              <div className="dropdown-item-icon" style={{ color: tool.color }}>
                                <tool.icon size={16} />
                              </div>
                              <span className="dropdown-item-name">{tool.title}</span>
                              <ChevronRight size={14} className="dropdown-item-arrow" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="logo-icon sm"><Layers size={14} strokeWidth={2} /></div>
            <span>PixelForge</span>
          </div>
          <p className="footer-note">100% free · No upload · No server · Everything runs in your browser</p>
          <div className="footer-links">
            <Link to="/">All Tools</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}