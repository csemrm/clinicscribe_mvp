import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../lib/auth'
import { Field } from '../components/Field'
import { Button } from '../components/Button'

export default function LoginPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState('clinician@demo.com')
  const [password, setPassword] = useState('Passw0rd!')
  const [err, setErr] = useState('')

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-2">Login</h1>
      <p className="text-sm text-gray-600 mb-4">ClinicScribe — documentation assistance only.</p>
      {err && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setErr('')
          try {
            await login(email, password)
            nav('/dashboard')
          } catch (e: any) {
            setErr('Login failed.')
          }
        }}
      >
        <Field label="Email">
          <input className="w-full rounded-md border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <input type="password" className="w-full rounded-md border px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button type="submit">Login</Button>
      </form>
      <div className="mt-4 text-sm">
        No account? <Link className="underline" to="/register">Register</Link>
      </div>
    </div>
  )
}
