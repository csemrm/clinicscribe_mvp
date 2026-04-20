import React from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/Button'
import Field from '../components/Field'
import {
  generateAvs,
  generateForm,
  generateSoap,
  getEncounter,
  listDocuments,
  previewChiefComplaint,
  updateEncounter,
  uploadAttachment,
} from '../lib/api'

export default function EncounterDetail() {
  const { encounterId } = useParams()
  const [encounter, setEncounter] = React.useState(null)
  const [documents, setDocuments] = React.useState([])
  const [error, setError] = React.useState('')
  const [busy, setBusy] = React.useState('')
  const [previewBusy, setPreviewBusy] = React.useState(false)
  const [previewError, setPreviewError] = React.useState('')
  const [file, setFile] = React.useState(null)
  const autoFillChief = React.useRef(true)

  const refresh = React.useCallback(() => {
    Promise.all([getEncounter(encounterId), listDocuments(encounterId)])
      .then(([enc, docs]) => {
        setEncounter(enc)
        setDocuments(Array.isArray(docs) ? docs : docs.results || [])
      })
      .catch((err) => setError(err.message))
  }, [encounterId])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  React.useEffect(() => {
    const notes = (encounter?.raw_notes || '').trim()
    if (!notes) return undefined

    const timer = window.setTimeout(async () => {
      try {
        setPreviewBusy(true)
        const result = await previewChiefComplaint(notes)
        const suggestion = result?.chief_complaint || ''
        setEncounter((current) => {
          if (!current) return current
          if (!autoFillChief.current) return current
          if ((current.chief_complaint || '').trim()) return current
          return { ...current, chief_complaint: suggestion }
        })
        setPreviewError('')
      } catch (err) {
        setPreviewError(err.message)
      } finally {
        setPreviewBusy(false)
      }
    }, 650)

    return () => window.clearTimeout(timer)
  }, [encounter?.raw_notes])

  const regenerateChiefComplaint = async () => {
    if (!encounter?.raw_notes) return
    setPreviewBusy(true)
    setPreviewError('')
    try {
      const result = await previewChiefComplaint(encounter.raw_notes)
      const suggestion = result?.chief_complaint || ''
      autoFillChief.current = true
      setEncounter((current) => ({ ...current, chief_complaint: suggestion }))
      await updateEncounter(encounterId, {
        raw_notes: encounter.raw_notes,
        chief_complaint: suggestion,
      })
      refresh()
    } catch (err) {
      setPreviewError(err.message)
    } finally {
      setPreviewBusy(false)
    }
  }

  const run = async (kind) => {
    setBusy(kind)
    setError('')
    try {
      if (kind === 'soap') await generateSoap(encounterId)
      if (kind === 'avs') await generateAvs(encounterId)
      if (kind === 'form') await generateForm(encounterId)
      refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const saveNotes = async () => {
    setBusy('save')
    setError('')
    try {
      await updateEncounter(encounterId, { raw_notes: encounter.raw_notes, chief_complaint: encounter.chief_complaint })
      refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const sendAttachment = async () => {
    if (!file) return
    setBusy('upload')
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      await uploadAttachment(encounterId, formData)
      setFile(null)
      refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  if (!encounter) return <div className="card panel">{error ? error : 'Loading…'}</div>

  return (
    <div className="stack">
      <div className="card panel">
        <div className="panel-head">
          <div>
            <h1>Encounter #{encounter.id}</h1>
            <p className="muted">Status {encounter.status || 'open'} · Visit {encounter.visit_date || '—'}</p>
          </div>
          <Button variant="secondary" onClick={saveNotes} disabled={busy === 'save'}>{busy === 'save' ? 'Saving…' : 'Save notes'}</Button>
        </div>

        {encounter.red_flags?.length ? (
          <div className="alert warning">
            <strong>Red flags</strong>
            <div>{Array.isArray(encounter.red_flags) ? encounter.red_flags.join(', ') : String(encounter.red_flags)}</div>
          </div>
        ) : null}

        <div className="grid two">
          <Field
            label="Chief complaint"
            value={encounter.chief_complaint || ''}
            onChange={(e) => {
              autoFillChief.current = false
              setEncounter({ ...encounter, chief_complaint: e.target.value })
            }}
            hint={previewBusy ? 'Generating suggestion…' : ''}
          />
          <Field label="Raw notes" value={encounter.raw_notes || ''} onChange={(e) => setEncounter({ ...encounter, raw_notes: e.target.value })} />
        </div>
        <div className="row">
          <Button variant="secondary" onClick={regenerateChiefComplaint} disabled={previewBusy || !encounter.raw_notes}>
            {previewBusy ? 'Regenerating…' : 'Regenerate chief complaint'}
          </Button>
          {previewError ? <span className="field-hint">{previewError}</span> : null}
        </div>
      </div>

      <div className="grid three">
        <Button onClick={() => run('soap')} disabled={busy}>{busy === 'soap' ? 'Generating…' : 'Generate SOAP'}</Button>
        <Button onClick={() => run('avs')} disabled={busy}>{busy === 'avs' ? 'Generating…' : 'Generate AVS'}</Button>
        <Button onClick={() => run('form')} disabled={busy}>{busy === 'form' ? 'Generating…' : 'Generate Form'}</Button>
      </div>

      <div className="card panel">
        <h3>Attachments</h3>
        <div className="row">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Button variant="secondary" onClick={sendAttachment} disabled={busy === 'upload'}>{busy === 'upload' ? 'Uploading…' : 'Upload'}</Button>
        </div>
      </div>

      <section className="card panel">
        <div className="panel-head">
          <h3>Generated documents</h3>
          <Link to="/app/patients">Back to patients</Link>
        </div>
        <div className="list">
          {documents.map((doc) => (
            <Link key={doc.id} to={`/app/documents/${doc.id}`} className="list-item">
              <strong>{doc.title || doc.kind || `Document ${doc.id}`}</strong>
              <span className="muted">{doc.kind || 'draft'} · {doc.status || 'draft'}</span>
            </Link>
          ))}
        </div>
      </section>

      {error ? <div className="alert">{error}</div> : null}
    </div>
  )
}
