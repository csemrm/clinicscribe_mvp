import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'
import { Field } from '../components/Field'
import { Button } from '../components/Button'

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [err, setErr] = useState('')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return patients
    return patients.filter(p => (p.name || '').toLowerCase().includes(s) || (p.mrn || '').toLowerCase().includes(s))
  }, [patients, q])

  async function load() {
    setErr('')
    try {
      setPatients(await api.patients.list())
    } catch {
      setErr('Failed to load patients.')
    }
  }

  useEffect(() => { load() }, [])

  return (
    <Layout>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="w-full max-w-md">
          <Field label="Search">
            <input className="w-full rounded-md border px-3 py-2" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or MRN" />
          </Field>
        </div>
        <Link to="/patients/new" className="hidden" />
      </div>

      {err && <div className="mb-4 rounded-md border bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <div className="rounded-md border bg-white">
        <div className="border-b px-4 py-3 font-semibold">Patients</div>
        <div className="divide-y">
          {filtered.map(p => (
            <Link key={p.id} to={`/patients/${p.id}`} className="block px-4 py-3 hover:bg-gray-50">
              <div className="text-sm font-medium">{p.name}</div>
              <div className="text-xs text-gray-600">DOB: {p.dob}{p.mrn ? ` • MRN: ${p.mrn}` : ''}</div>
            </Link>
          ))}
          {filtered.length === 0 && <div className="px-4 py-6 text-sm text-gray-600">No patients found.</div>}
        </div>
      </div>

      <div className="mt-6 rounded-md border bg-white p-4">
        <h3 className="font-semibold mb-3">Quick add patient</h3>
        <QuickAdd onCreated={load} />
      </div>
    </Layout>
  )
}

function QuickAdd({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('')
  const [dob, setDob] = useState('1990-01-01')
  const [mrn, setMrn] = useState('')
  const [context, setContext] = useState('')
  const [err, setErr] = useState('')

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={async (e) => {
      e.preventDefault()
      setErr('')
      try {
        await api.patients.create({ name, dob, mrn: mrn || null, context })
        setName(''); setMrn(''); setContext('')
        onCreated()
      } catch {
        setErr('Failed to create patient.')
      }
    }}>
      <Field label="Name">
        <input className="w-full rounded-md border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="DOB">
        <input type="date" className="w-full rounded-md border px-3 py-2" value={dob} onChange={(e) => setDob(e.target.value)} required />
      </Field>
      <Field label="MRN (optional)">
        <input className="w-full rounded-md border px-3 py-2" value={mrn} onChange={(e) => setMrn(e.target.value)} />
      </Field>
      <div className="md:col-span-2">
        <Field label="Patient context (optional)">
          <textarea className="w-full rounded-md border px-3 py-2" rows={3} value={context} onChange={(e) => setContext(e.target.value)} />
        </Field>
      </div>
      {err && <div className="md:col-span-2 rounded-md border bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      <div className="md:col-span-2">
        <Button type="submit">Create patient</Button>
      </div>
    </form>
  )
}
