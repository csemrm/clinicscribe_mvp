import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { Button } from '../components/Button'
import { diffLines } from 'diff'

function DiffView({ a, b }: { a: string; b: string }) {
  const parts = useMemo(() => diffLines(a || '', b || ''), [a, b])
  return (
    <pre className="whitespace-pre-wrap text-xs font-mono rounded-md border p-3 bg-gray-50 overflow-auto">
      {parts.map((p, i) => (
        <span key={i} className={p.added ? 'bg-green-100' : p.removed ? 'bg-red-100' : ''}>
          {p.value}
        </span>
      ))}
    </pre>
  )
}

export default function DocumentEditorPage() {
  const { id } = useParams()
  const did = Number(id)
  const [doc, setDoc] = useState<any>(null)
  const [finalText, setFinalText] = useState('')
  const [structured, setStructured] = useState<any>({})
  const [showDiff, setShowDiff] = useState(false)
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setErr('')
    try {
      const d = await api.documents.get(did)
      setDoc(d)
      setFinalText(d.final_text || '')
      setStructured(d.structured_json || {})
    } catch {
      setErr('Failed to load document.')
    }
  }

  useEffect(() => { load() }, [did])

  async function save() {
    setSaving(true); setErr('')
    try {
      await api.documents.update(did, { final_text: finalText, structured_json: structured })
      await load()
    } catch {
      setErr('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  async function submitReview() {
    setErr('')
    try { await api.documents.submitReview(did); await load() } catch { setErr('Submit review failed.') }
  }

  async function finalize() {
    setErr('')
    try { await api.documents.finalize(did); await load() } catch { setErr('Finalize failed.') }
  }

  const isFinal = doc?.status === 'FINAL'

  return (
    <Layout>
      {err && <div className="mb-4 rounded-md border bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!doc ? <div className="text-sm text-gray-600">Loading…</div> : (
        <div className="space-y-4">
          <div className="rounded-md border bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold">{doc.type}</h1>
                <div className="text-sm text-gray-600">Status: <span className="font-medium">{doc.status}</span> • v{doc.version}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={save} disabled={saving}>Save</Button>
                <Button variant="secondary" onClick={() => setShowDiff(v => !v)}>{showDiff ? 'Hide diff' : 'Show diff'}</Button>
                <Button onClick={submitReview} disabled={doc.status !== 'DRAFT_AI'}>Submit Review</Button>
                <Button onClick={finalize} disabled={doc.status !== 'REVIEWED'}>Finalize</Button>
                <a
                  className={`rounded-md px-3 py-2 text-sm font-medium border ${isFinal ? 'bg-white hover:bg-gray-50' : 'opacity-50 pointer-events-none'}`}
                  href={api.documents.exportPDFUrl(did)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Export PDF
                </a>
                <Button variant="secondary" onClick={async () => {
                  try {
                    const data = await api.documents.exportJSON(did)
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `document_${did}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  } catch {
                    setErr('JSON export failed.')
                  }
                }} disabled={!isFinal}>Export JSON</Button>
              </div>
            </div>
          </div>

          {showDiff && (
            <div className="rounded-md border bg-white p-4">
              <div className="font-semibold mb-2">Diff (AI draft → edited)</div>
              <DiffView a={doc.ai_draft_text || ''} b={finalText || ''} />
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border bg-white p-4">
              <div className="font-semibold mb-2">AI draft (read-only)</div>
              <pre className="whitespace-pre-wrap text-sm rounded-md border p-3 bg-gray-50 overflow-auto">{doc.ai_draft_text || ''}</pre>
            </div>

            <div className="rounded-md border bg-white p-4">
              <div className="font-semibold mb-2">Clinician final text (editable)</div>
              <textarea
                className="w-full rounded-md border px-3 py-2 text-sm"
                rows={18}
                value={finalText}
                onChange={(e) => setFinalText(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border bg-white p-4">
            <div className="font-semibold mb-2">Structured fields (forms)</div>
            <textarea
              className="w-full rounded-md border px-3 py-2 font-mono text-xs"
              rows={8}
              value={JSON.stringify(structured || {}, null, 2)}
              onChange={(e) => {
                try { setStructured(JSON.parse(e.target.value)) } catch { /* ignore */ }
              }}
            />
            <div className="mt-2 text-xs text-gray-600">Tip: edit JSON carefully. This MVP stores it in `structured_json`.</div>
          </div>

          <div className="rounded-md border bg-white p-4">
            <div className="font-semibold mb-2">Audit trail</div>
            <div className="space-y-2">
              {(doc.audit_events || []).map((ev: any) => (
                <div key={ev.id} className="rounded-md border p-3 text-sm">
                  <div className="font-medium">{ev.action}</div>
                  <div className="text-xs text-gray-600">
                    {ev.actor?.email} • {new Date(ev.timestamp).toLocaleString()} • {ev.from_status || '—'} → {ev.to_status || '—'}
                  </div>
                </div>
              ))}
              {(doc.audit_events || []).length === 0 && <div className="text-sm text-gray-600">No events.</div>}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
