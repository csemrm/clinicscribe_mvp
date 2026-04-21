import { useState, useEffect } from 'react'
import { Menu, X, Activity } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const COLORS = {
  navy: '#07172f',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  blue: '#2563eb',
  cyan: '#38bdf8',
}

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const transparent = isHome && !scrolled

  const navLinks = [
    { label: 'Product', href: '#features' },
    { label: 'Security', href: '#trust' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ]

  const headerStyle = transparent
    ? {
        background: 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }
    : {
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
        borderBottom: `1px solid ${COLORS.border}`,
      }

  const linkColor = transparent ? 'rgba(255,255,255,0.82)' : COLORS.muted
  const linkHover = transparent ? '#ffffff' : COLORS.blue

  const scrollToSection = (hash) => {
    const id = hash.replace('#', '')
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMobileOpen(false)
    }
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={headerStyle}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #1d4ed8)',
              boxShadow: '0 10px 30px rgba(37,99,235,0.24)',
            }}
          >
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span
            className="text-xl font-bold"
            style={{
              fontFamily: 'Syne, sans-serif',
              color: transparent ? '#ffffff' : COLORS.navy,
            }}
          >
            DocZen
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors"
              style={{ color: linkColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = linkHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = linkColor
              }}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(link.href)
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium transition-colors"
            style={{ color: linkColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = linkHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = linkColor
            }}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #1d4ed8)',
              boxShadow: '0 10px 30px rgba(37,99,235,0.24)',
            }}
          >
            Get Started
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: transparent ? '#ffffff' : COLORS.navy }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden px-6 py-4 flex flex-col gap-4"
          style={{
            background: '#ffffff',
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium"
              style={{ color: COLORS.muted }}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(link.href)
              }}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            className="text-sm font-medium"
            style={{ color: COLORS.muted }}
            onClick={() => setMobileOpen(false)}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="mt-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold text-center"
            style={{ background: 'linear-gradient(135deg, #38bdf8, #1d4ed8)' }}
            onClick={() => setMobileOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  )
}

export default Navbar
