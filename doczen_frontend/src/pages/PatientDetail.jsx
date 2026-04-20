import React from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/Button'
import Field from '../components/Field'
import { createEncounter, getPatient, listEncounters } from '../lib/api'

export default function PatientDetail() {
  const { patientId } = useParams()
  const [patient, setPatient] = React.useState(null)
  const [encounters, setEncounters] = React.useState([])
  const [error, setError] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [form, setForm] = React.useState({ visit_date: '', chief_complaint: '', raw_notes: '' })

  const refresh = () => {
    Promise.all([getPatient(patientId), listEncounters()])
      .then(([p, e]) => {
        setPatient(p)
        const rows = Array.isArray(e) ? e : e.results || []
        setEncounters(rows.filter((item) => String(item.patient_id || item.patient || '') === String(patientId)))
      })
      .catch((err) => setError(err.message))
  }

  React.useEffect(() => {
    refresh()
  }, [patientId])

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await createEncounter({ patient: Number(patientId), ...form })
      setForm({ visit_date: '', chief_complaint: '', raw_notes: '' })
      refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!patient) return <div className="card panel">{error ? error : 'Loading…'}</div>

  return (
    <div className="stack">
      <div className="card panel">
        <h1>{patient.first_name} {patient.last_name}</h1>
        <p className="muted">DOB {patient.date_of_birth || '—'} · MRN {patient.mrn || '—'} · Sex {patient.sex || '—'}</p>
        {patient.notes ? <p>{patient.notes}</p> : null}
      </div>

      <div className="grid two">
        <form className="card panel" onSubmit={onSubmit}>
          <h3>New encounter</h3>
          <Field label="Visit date" type="date" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} required />
          <Field label="Chief complaint" value={form.chief_complaint} onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })} />
          <Field label="Raw notes" value={form.raw_notes} onChange={(e) => setForm({ ...form, raw_notes: e.target.value })} />
          {error ? <div className="alert">{error}</div> : null}
          <Button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create encounter'}</Button>
        </form>

        <section className="card panel">
          <div className="panel-head">
            <h3>Encounters</h3>
            <Link to="/app/encounters/new">Open form</Link>
          </div>
          <div className="list scroll">
            {encounters.map((e) => (
              <Link key={e.id} to={`/app/encounters/${e.id}`} className="list-item">
                <strong>Encounter #{e.id}</strong>
                <span className="muted">{e.status || 'open'} · {e.visit_date || e.created_at}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
