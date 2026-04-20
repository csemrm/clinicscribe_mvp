import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Field from '../components/Field'
import { login, setToken } from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = React.useState({ email: '', password: '' })
  const [error, setError] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await login(form)
      setToken(data.access)
      navigate('/app')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={onSubmit}>
        <p className="eyebrow">Welcome back</p>
        <h2>Login</h2>
        <Field label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Field label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error ? <div className="alert">{error}</div> : null}
        <Button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
        <p className="muted">Need an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  )
}
