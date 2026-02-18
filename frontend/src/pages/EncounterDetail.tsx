import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { Button } from '../components/Button'
import { Field } from '../components/Field'

const FORM_TYPES = [
  { key: 'FORM_PRIOR_AUTH', label: 'Prior Authorization request' },
  { key: 'FORM_REFERRAL', label: 'Referral letter' },
  { key: 'FORM_EXCUSE', label: 'Work/school excuse note' },
  { key: 'FORM_MED_NECESSITY', label: 'Medical necessity letter' },
]

export default function EncounterDetailPage() {
  const { id } = useParams()
  const eid = Number(id)
  const [enc, setEnc] = useState<any>(null)
  const [docs, setDocs] = useState<any[]>([])
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [rawNotes, setRawNotes] = useState('')
  const [redFlag, setRedFlag] = useState(false)
  const [formType, setFormType] = useState(FORM_TYPES[0].key)
  const [extraFieldsJson, setExtraFieldsJson] = useState('{}')

  async function load() {
    setErr('')
    try {
      const e = await api.encounters.get(eid)
      setEnc(e)
      setRawNotes(e.raw_notes || '')
      setDocs(await api.encounters.docs(eid))
    } catch {
      setErr('Failed to load encounter.')
    }
  }

  useEffect(() => { load() }, [eid])

  async function saveNotes() {
    setSaving(true); setErr('')
    try {
      await api.encounters.update(eid, { ...enc, patient_id: enc.patient.id, raw_notes: rawNotes, clinician_id: enc.clinician.id })
      await load()
    } catch {
      setErr('Failed to save notes.')
    } finally {
      setSaving(false)
    }
  }

  async function runGenerate(kind: 'soap'|'avs'|'form') {
    setErr('')
    try {
      let res: any
      if (kind === 'soap') res = await api.encounters.generateSOAP(eid)
      if (kind === 'avs') res = await api.encounters.generateAVS(eid)
      if (kind === 'form') {
        let extra: any = {}
        try { extra = JSON.parse(extraFieldsJson || '{}') } catch { extra = {} }
        res = await api.encounters.generateForm(eid, formType, extra)
      }
      setRedFlag(Boolean(res.red_flag))
      // generation happens async; refresh list after a short delay
      setTimeout(load, 800)
    } catch {
      setErr('Generation failed (rate limit or server error).')
    }
  }

  return (
    <Layout>
      {err && <div className="mb-4 rounded-md border bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {redFlag && (
        <div className="mb-4 rounded-md border bg-amber-50 p-3 text-sm">
          <div className="font-medium">This content may require urgent clinical attention.</div>
          <div className="text-gray-700">Follow your clinic protocol.</div>
        </div>
      )}

      {!enc ? <div className="text-sm text-gray-600">Loading…</div> : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-md border bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold">{enc.patient?.name} — {enc.visit_type}</h1>
                  <div className="text-sm text-gray-600">{new Date(enc.occurred_at).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={saveNotes} disabled={saving}>Save notes</Button>
                </div>
              </div>

              <div className="mt-4">
                <Field label="Raw notes">
                  <textarea className="w-full rounded-md border px-3 py-2" rows={10} value={rawNotes} onChange={(e) => setRawNotes(e.target.value)} />
                </Field>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => runGenerate('soap')}>Generate SOAP</Button>
                <Button onClick={() => runGenerate('avs')}>Generate AVS</Button>
              </div>

              <div className="mt-4 rounded-md border p-3">
                <div className="text-sm font-semibold mb-2">Generate form</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Form type">
                    <select className="w-full rounded-md border px-3 py-2" value={formType} onChange={(e) => setFormType(e.target.value)}>
                      {FORM_TYPES.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Extra fields (JSON)">
                    <input className="w-full rounded-md border px-3 py-2 font-mono text-xs" value={extraFieldsJson} onChange={(e) => setExtraFieldsJson(e.target.value)} />
                  </Field>
                </div>
                <div className="mt-3">
                  <Button onClick={() => runGenerate('form')}>Generate Form Draft</Button>
                </div>
              </div>

              <div className="mt-4">
                <Field label="Upload attachment (stored only; no OCR in MVP)">
                  <input type="file" onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      await api.encounters.uploadAttachment(eid, file)
                      await load()
                    } catch {
                      setErr('Upload failed.')
                    } finally {
                      e.currentTarget.value = ''
                    }
                  }} />
                </Field>
              </div>
            </div>

            <div className="rounded-md border bg-white">
              <div className="border-b px-4 py-3 font-semibold">Generated documents</div>
              <div className="divide-y">
                {docs.map(d => (
                  <Link key={d.id} to={`/documents/${d.id}`} className="block px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{d.type}</div>
                      <div className="text-xs rounded-full border px-2 py-1">{d.status}</div>
                    </div>
                    <div className="text-xs text-gray-600">v{d.version} • {new Date(d.created_at).toLocaleString()}</div>
                  </Link>
                ))}
                {docs.length === 0 && <div className="px-4 py-6 text-sm text-gray-600">No documents yet. Generate one above.</div>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-md border bg-white p-4">
              <div className="font-semibold mb-2">Patient context</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{enc.patient?.context || '—'}</div>
            </div>
            <div className="rounded-md border bg-white p-4">
              <div className="font-semibold mb-2">Safety</div>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                <li>Not a diagnostic tool.</li>
                <li>Human review required before final export.</li>
                <li>Do not paste content you should not store.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
