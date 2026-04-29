import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Field from '../components/Field'
import { register, setToken } from '../lib/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = React.useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    clinic_name: '',
    clinic_slug: ''
  })
  const [error, setError] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const slugify = (text) =>
    text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const finalSlug = form.clinic_slug || slugify(form.clinic_name || '')

      const payload = {
        username: form.email,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        clinic_name: form.clinic_name,
        clinic_slug: finalSlug
      }

      const data = await register(payload)
      setToken(data.access)
      navigate('/app')
    } catch (err) {
      const msg = err?.response?.data
        ? JSON.stringify(err.response.data)
        : err.message
      setError(msg)
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
        <Field
          label="Clinic Name"
          value={form.clinic_name}
          onChange={(e) => {
            const name = e.target.value
            setForm({
              ...form,
              clinic_name: name,
              clinic_slug: slugify(name)
            })
          }}
          required
        />
        <Field label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Field label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error ? <div className="alert">{error}</div> : null}
        <Button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</Button>
        <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  )
}
