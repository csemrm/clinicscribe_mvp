import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const [encounters, setEncounters] = useState<any[]>([])
  const [pending, setPending] = useState<any[]>([])
  const [err, setErr] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const enc = await api.encounters.list()
        setEncounters(enc.slice(0, 10))
        // pending review = documents status DRAFT_AI across recent encounters (cheap approach)
        const docs: any[] = []
        for (const e of enc.slice(0, 15)) {
          const d = await api.encounters.docs(e.id)
          docs.push(...d.filter(x => x.status === 'DRAFT_AI'))
        }
        setPending(docs.slice(0, 10))
      } catch {
        setErr('Failed to load dashboard.')
      }
    })()
  }, [])

  return (
    <Layout>
      {err && <div className="mb-4 rounded-md border bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Recent encounters</h2>
            <Link className="text-sm underline" to="/encounters/new">New</Link>
          </div>
          <div className="space-y-2">
            {encounters.map(e => (
              <Link key={e.id} to={`/encounters/${e.id}`} className="block rounded-md border px-3 py-2 hover:bg-gray-50">
                <div className="text-sm font-medium">{e.patient?.name} — {e.visit_type}</div>
                <div className="text-xs text-gray-600">{new Date(e.occurred_at).toLocaleString()}</div>
              </Link>
            ))}
            {encounters.length === 0 && <div className="text-sm text-gray-600">No encounters yet.</div>}
          </div>
        </div>

        <div className="rounded-md border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Pending AI drafts</h2>
            <span className="text-xs text-gray-500">Requires review</span>
          </div>
          <div className="space-y-2">
            {pending.map(d => (
              <Link key={d.id} to={`/documents/${d.id}`} className="block rounded-md border px-3 py-2 hover:bg-gray-50">
                <div className="text-sm font-medium">{d.type}</div>
                <div className="text-xs text-gray-600">Status: {d.status}</div>
              </Link>
            ))}
            {pending.length === 0 && <div className="text-sm text-gray-600">No pending drafts.</div>}
          </div>
        </div>
      </div>
    </Layout>
  )
}
