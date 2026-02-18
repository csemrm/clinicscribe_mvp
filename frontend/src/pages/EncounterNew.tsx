import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { Field } from '../components/Field'
import { Button } from '../components/Button'
import { useNavigate } from 'react-router-dom'

export default function EncounterNewPage() {
  const nav = useNavigate()
  const [patients, setPatients] = useState<any[]>([])
  const [patientId, setPatientId] = useState<number | null>(null)
  const [visitType, setVisitType] = useState('Follow-up')
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0,16))
  const [rawNotes, setRawNotes] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const p = await api.patients.list()
        setPatients(p)
        if (p[0]) setPatientId(p[0].id)
      } catch {
        setErr('Failed to load patients.')
      }
    })()
  }, [])

  return (
    <Layout>
      <div className="rounded-md border bg-white p-4">
        <h1 className="text-xl font-semibold mb-4">New encounter</h1>
        {err && <div className="mb-4 rounded-md border bg-red-50 p-3 text-sm text-red-700">{err}</div>}
        <form className="grid gap-3 md:grid-cols-2" onSubmit={async (e) => {
          e.preventDefault()
          setErr('')
          try {
            if (!patientId) throw new Error('No patient selected')
            const enc = await api.encounters.create({
              patient_id: patientId,
              visit_type: visitType,
              occurred_at: new Date(occurredAt).toISOString(),
              raw_notes: rawNotes,
            })
            nav(`/encounters/${enc.id}`)
          } catch {
            setErr('Failed to create encounter.')
          }
        }}>
          <Field label="Patient">
            <select className="w-full rounded-md border px-3 py-2" value={patientId ?? ''} onChange={(e) => setPatientId(Number(e.target.value))}>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.dob})</option>)}
            </select>
          </Field>
          <Field label="Visit type">
            <input className="w-full rounded-md border px-3 py-2" value={visitType} onChange={(e) => setVisitType(e.target.value)} />
          </Field>
          <Field label="Occurred at">
            <input type="datetime-local" className="w-full rounded-md border px-3 py-2" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Raw notes (typed or dictated)">
              <textarea className="w-full rounded-md border px-3 py-2" rows={8} value={rawNotes} onChange={(e) => setRawNotes(e.target.value)} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Button type="submit">Create encounter</Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
