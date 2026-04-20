import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Field from '../components/Field'
import { createPatient, listPatients } from '../lib/api'

export default function Patients() {
  const [patients, setPatients] = React.useState([])
  const [error, setError] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [form, setForm] = React.useState({ first_name: '', last_name: '', date_of_birth: '', sex: 'other', mrn: '', notes: '' })

  const refresh = () => {
    listPatients()
      .then((data) => setPatients(Array.isArray(data) ? data : data.results || []))
      .catch((err) => setError(err.message))
  }

  React.useEffect(() => {
    refresh()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await createPatient(form)
      setForm({ first_name: '', last_name: '', date_of_birth: '', sex: 'other', mrn: '', notes: '' })
      refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack">
      <div className="panel-head">
        <div>
          <h1>Patients</h1>
          <p className="muted">Add or review demo patients.</p>
        </div>
      </div>

      <div className="grid two">
        <form className="card panel" onSubmit={onSubmit}>
          <h3>Quick add patient</h3>
          <div className="grid two">
            <Field label="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
            <Field label="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
          </div>
          <Field label="Date of birth" type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} required />
          <div className="grid two">
            <Field label="Sex" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} />
            <Field label="MRN" value={form.mrn} onChange={(e) => setForm({ ...form, mrn: e.target.value })} />
          </div>
          <Field label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          {error ? <div className="alert">{error}</div> : null}
          <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Create patient'}</Button>
        </form>

        <section className="card panel">
          <h3>Directory</h3>
          <div className="list scroll">
            {patients.map((p) => (
              <Link key={p.id} to={`/app/patients/${p.id}`} className="list-item">
                <strong>{p.first_name} {p.last_name}</strong>
                <span className="muted">DOB {p.date_of_birth || '—'} · MRN {p.mrn || '—'}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
