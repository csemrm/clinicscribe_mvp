import React from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/Button'
import Field from '../components/Field'
import { exportDocumentPdf, finalizeDocument, getDocument, submitReview, updateDocument } from '../lib/api'

export default function DocumentEditor() {
  const { documentId } = useParams()
  const [doc, setDoc] = React.useState(null)
  const [error, setError] = React.useState('')
  const [busy, setBusy] = React.useState('')
  const [reviewNotes, setReviewNotes] = React.useState('')

  const refresh = () => {
    getDocument(documentId)
      .then((data) => {
        setDoc(data)
        setReviewNotes(data.review_notes || '')
      })
      .catch((err) => setError(err.message))
  }

  React.useEffect(() => {
    refresh()
  }, [documentId])

  const save = async () => {
    setBusy('save')
    setError('')
    try {
      await updateDocument(documentId, { content: doc.content, review_notes: reviewNotes })
      refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const sendForReview = async () => {
    setBusy('review')
    setError('')
    try {
      await submitReview(documentId, { review_notes: reviewNotes })
      refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const finalize = async () => {
    setBusy('finalize')
    setError('')
    try {
      await finalizeDocument(documentId)
      refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const downloadPdf = async () => {
    setBusy('pdf')
    setError('')
    try {
      const blob = await exportDocumentPdf(documentId)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  if (!doc) return <div className="card panel">{error ? error : 'Loading…'}</div>

  return (
    <div className="stack">
      <div className="card panel">
        <div className="panel-head">
          <div>
            <h1>{doc.title || `Document ${doc.id}`}</h1>
            <p className="muted">Kind {doc.kind || '—'} · Status {doc.status || 'draft'}</p>
          </div>
          <div className="row">
            <Button variant="secondary" onClick={save} disabled={busy === 'save'}>{busy === 'save' ? 'Saving…' : 'Save'}</Button>
            <Button variant="secondary" onClick={sendForReview} disabled={busy === 'review'}>{busy === 'review' ? 'Sending…' : 'Submit review'}</Button>
            <Button onClick={finalize} disabled={busy === 'finalize'}>{busy === 'finalize' ? 'Finalizing…' : 'Finalize'}</Button>
          </div>
        </div>

        <Field label="Review notes" value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
        <label className="field">
          <span className="field-label">Content</span>
          <textarea className="textarea" rows="18" value={doc.content || ''} onChange={(e) => setDoc({ ...doc, content: e.target.value })} />
        </label>
      </div>

      <div className="card panel">
        <div className="panel-head">
          <h3>Export</h3>
          <Button variant="secondary" onClick={downloadPdf} disabled={busy === 'pdf'}>{busy === 'pdf' ? 'Exporting…' : 'Export PDF'}</Button>
        </div>
        <pre className="code-block">{JSON.stringify(doc.content_json || {}, null, 2)}</pre>
      </div>

      {error ? <div className="alert">{error}</div> : null}
    </div>
  )
}
