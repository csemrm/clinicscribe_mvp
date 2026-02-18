import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../lib/api'

export default function PatientDetailPage() {
  const { id } = useParams()
  const pid = Number(id)
  const [patient, setPatient] = useState<any>(null)
  const [encounters, setEncounters] = useState<any[]>([])
  const [err, setErr] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const p = await api.patients.get(pid)
        setPatient(p)
        const enc = await api.encounters.list()
        setEncounters(enc.filter(e => e.patient?.id === pid))
      } catch {
        setErr('Failed to load patient.')
      }
    })()
  }, [pid])

  return (
    <Layout>
      {err && <div className="mb-4 rounded-md border bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!patient ? <div className="text-sm text-gray-600">Loading…</div> : (
        <>
          <div className="rounded-md border bg-white p-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-semibold">{patient.name}</h1>
                <div className="text-sm text-gray-600">DOB: {patient.dob}{patient.mrn ? ` • MRN: ${patient.mrn}`:''}</div>
              </div>
              <Link to="/encounters/new" className="text-sm underline">New encounter</Link>
            </div>
            {patient.context && <div className="mt-3 text-sm whitespace-pre-wrap"><span className="font-medium">Context:</span> {patient.context}</div>}
          </div>

          <div className="rounded-md border bg-white">
            <div className="border-b px-4 py-3 font-semibold">Encounters</div>
            <div className="divide-y">
              {encounters.map(e => (
                <Link key={e.id} to={`/encounters/${e.id}`} className="block px-4 py-3 hover:bg-gray-50">
                  <div className="text-sm font-medium">{e.visit_type}</div>
                  <div className="text-xs text-gray-600">{new Date(e.occurred_at).toLocaleString()}</div>
                </Link>
              ))}
              {encounters.length === 0 && <div className="px-4 py-6 text-sm text-gray-600">No encounters yet.</div>}
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}
