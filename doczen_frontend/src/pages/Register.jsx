import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Field from '../components/Field'
import { register, setToken } from '../lib/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = React.useState({ email: '', password: '', first_name: '', last_name: '' })
  const [error, setError] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await register(form)
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
        <p className="eyebrow">Create access</p>
        <h2>Register</h2>
        <div className="grid two">
          <Field label="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <Field label="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
        </div>
        <Field label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Field label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error ? <div className="alert">{error}</div> : null}
        <Button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</Button>
        <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  )
}
