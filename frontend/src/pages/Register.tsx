import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../lib/auth'
import { Field } from '../components/Field'
import { Button } from '../components/Button'

export default function RegisterPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('Passw0rd!')
  const [clinicName, setClinicName] = useState('My Clinic')
  const [err, setErr] = useState('')

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-2">Register</h1>
      {err && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setErr('')
          try {
            await register(email, password, clinicName)
            nav('/dashboard')
          } catch (e: any) {
            setErr('Registration failed.')
          }
        }}
      >
        <Field label="Clinic name">
          <input className="w-full rounded-md border px-3 py-2" value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
        </Field>
        <Field label="Email">
          <input className="w-full rounded-md border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <input type="password" className="w-full rounded-md border px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button type="submit">Create account</Button>
      </form>
      <div className="mt-4 text-sm">
        Already have an account? <Link className="underline" to="/login">Login</Link>
      </div>
    </div>
  )
}
