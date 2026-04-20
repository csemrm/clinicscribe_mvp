import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Field from '../components/Field'
import { createEncounter, listPatients, previewChiefComplaint } from '../lib/api'

export default function EncounterNew() {
  const navigate = useNavigate()
  const [patients, setPatients] = React.useState([])
  const [error, setError] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [previewBusy, setPreviewBusy] = React.useState(false)
  const autoFillChief = React.useRef(true)
  const [previewMeta, setPreviewMeta] = React.useState({ chief_complaint: '', source: '', error: '' })
  const [form, setForm] = React.useState({ patient: '', visit_date: '', chief_complaint: '', raw_notes: '' })

  React.useEffect(() => {
    listPatients()
      .then((data) => setPatients(Array.isArray(data) ? data : data.results || []))
      .catch((err) => setError(err.message))
  }, [])

  React.useEffect(() => {
    const notes = (form.raw_notes || '').trim()
    if (!notes) {
      setPreviewMeta({ chief_complaint: '', source: '', error: '' })
      return undefined
    }

    const timer = window.setTimeout(async () => {
      try {
        setPreviewBusy(true)
        const result = await previewChiefComplaint(notes)
        const suggestion = result?.chief_complaint || ''
        const source = result?.metadata?.source || ''
        setPreviewMeta({ chief_complaint: suggestion, source, error: '' })
        setForm((current) => {
          if (!autoFillChief.current) return current
          if ((current.chief_complaint || '').trim()) return current
          return { ...current, chief_complaint: suggestion }
        })
      } catch (err) {
        setPreviewMeta((current) => ({ ...current, error: err.message }))
      } finally {
        setPreviewBusy(false)
      }
    }, 650)

    return () => window.clearTimeout(timer)
  }, [form.raw_notes])

  const regenerateChiefComplaint = async () => {
    const notes = (form.raw_notes || '').trim()
    if (!notes) return
    setBusy(true)
    setError('')
    try {
      const result = await previewChiefComplaint(notes)
      const suggestion = result?.chief_complaint || ''
      setPreviewMeta({ chief_complaint: suggestion, source: result?.metadata?.source || '', error: '' })
      autoFillChief.current = true
      setForm((current) => ({ ...current, chief_complaint: suggestion }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const created = await createEncounter({ ...form, patient: Number(form.patient) })
      navigate(`/app/encounters/${created.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card panel narrow" onSubmit={onSubmit}>
      <h1>New encounter</h1>
      <label className="field">
        <span className="field-label">Patient</span>
        <select className="input" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required>
          <option value="">Select patient</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
        </select>
      </label>
      <Field label="Visit date" type="date" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} required />
      <Field
        label="Chief complaint"
        value={form.chief_complaint}
        onChange={(e) => {
          autoFillChief.current = false
          setForm({ ...form, chief_complaint: e.target.value })
        }}
        hint={previewBusy ? 'Generating suggestion…' : (previewMeta.chief_complaint ? `AI suggestion: ${previewMeta.chief_complaint}${previewMeta.source ? ` · ${previewMeta.source}` : ''}` : '')}
      />
      <Field label="Raw notes" value={form.raw_notes} onChange={(e) => setForm({ ...form, raw_notes: e.target.value })} />
      <div className="row">
        <Button type="button" variant="secondary" onClick={regenerateChiefComplaint} disabled={!form.raw_notes || busy}>
          Regenerate chief complaint
        </Button>
        {previewMeta.error ? <span className="field-hint">{previewMeta.error}</span> : null}
      </div>
      {error ? <div className="alert">{error}</div> : null}
      <Button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create encounter'}</Button>
    </form>
  )
}
