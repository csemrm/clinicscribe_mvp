import React from 'react'
import { Link } from 'react-router-dom'
import { listPatients, listEncounters, listDocuments } from '../lib/api'

function Stat({ label, value }) {
  return (
    <div className="stat card">
      <div className="muted">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  )
}

export default function Dashboard() {
  const [patients, setPatients] = React.useState([])
  const [encounters, setEncounters] = React.useState([])
  const [documents, setDocuments] = React.useState([])
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    Promise.all([listPatients(), listEncounters()])
      .then(async ([p, e]) => {
        setPatients(Array.isArray(p) ? p : p.results || [])
        setEncounters(Array.isArray(e) ? e : e.results || [])
        if (e?.[0]?.id) {
          try {
            const docs = await listDocuments(e[0].id)
            setDocuments(Array.isArray(docs) ? docs : docs.results || [])
          } catch {
            setDocuments([])
          }
        }
      })
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="stack">
      <div>
        <h1>Dashboard</h1>
        <p className="muted">Clinic-scoped summary for demo testing.</p>
      </div>

      {error ? <div className="alert">{error}</div> : null}

      <div className="grid three">
        <Stat label="Patients" value={patients.length} />
        <Stat label="Encounters" value={encounters.length} />
        <Stat label="Documents" value={documents.length} />
      </div>

      <div className="grid two">
        <section className="card panel">
          <div className="panel-head">
            <h3>Recent patients</h3>
            <Link to="/app/patients">View all</Link>
          </div>
          <div className="list">
            {patients.slice(0, 5).map((p) => (
              <Link key={p.id} to={`/app/patients/${p.id}`} className="list-item">
                <strong>{p.first_name} {p.last_name}</strong>
                <span className="muted">MRN {p.mrn || '—'}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="card panel">
          <div className="panel-head">
            <h3>Recent encounters</h3>
            <Link to="/app/encounters/new">New encounter</Link>
          </div>
          <div className="list">
            {encounters.slice(0, 5).map((e) => (
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
