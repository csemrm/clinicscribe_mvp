import React from 'react'
import { Link, Navigate, NavLink, useLocation } from 'react-router-dom'
import Button from './Button'
import { clearToken, getMe } from '../lib/api'

export function Protected({ children }) {
  const token = localStorage.getItem('doczen_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function Layout({ children }) {
  const [me, setMe] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const location = useLocation()

  React.useEffect(() => {
    let active = true
    getMe()
      .then((data) => {
        if (active) setMe(data)
      })
      .catch(() => {
        clearToken()
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [location.pathname])

  const logout = () => {
    clearToken()
    window.location.href = '/login'
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/app" className="brand">
          <span className="brand-mark">D</span>
          <span>
            <strong>Doczen AI</strong>
            <small>Medical admin assistant</small>
          </span>
        </Link>

        <nav className="nav">
          <NavLink to="/app" end>Dashboard</NavLink>
          <NavLink to="/app/patients">Patients</NavLink>
          <NavLink to="/app/encounters/new">New Encounter</NavLink>
        </nav>

        <div className="sidebar-card">
          <div className="muted">Signed in as</div>
          <div>{loading ? 'Loading…' : (me?.email || 'Demo user')}</div>
          <Button variant="secondary" onClick={logout}>Logout</Button>
        </div>
      </aside>

      <main className="content">
        {children}
      </main>
    </div>
  )
}
