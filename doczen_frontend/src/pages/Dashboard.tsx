import { Link } from 'react-router-dom';

const recentPatients = [
  { id: '1', name: 'Ava Johnson', mrn: 'MRN-10021' },
  { id: '2', name: 'Noah Patel', mrn: 'MRN-10022' },
];

const recentEncounters = [
  { id: 'e1', title: 'Follow-up visit', status: 'draft' },
  { id: 'e2', title: 'Annual physical', status: 'final' },
];

export default function Dashboard() {
  return (
    <div className="stack">
      <section className="grid-2">
        <div className="card">
          <h3>Quick actions</h3>
          <div className="button-row wrap">
            <Link className="btn" to="/app/encounters/new">
              New encounter
            </Link>
            <Link className="btn secondary" to="/app/patients">
              View patients
            </Link>
          </div>
        </div>
        <div className="card banner warning">
          <strong>Safety banner:</strong> Generated content is a draft only and requires human review before finalization.
        </div>
      </section>

      <section className="grid-2">
        <div className="card">
          <h3>Recent patients</h3>
          <div className="list">
            {recentPatients.map((patient) => (
              <Link key={patient.id} to={`/app/patients/${patient.id}`} className="list-item">
                <div>
                  <strong>{patient.name}</strong>
                  <p className="muted">{patient.mrn}</p>
                </div>
                <span>Open</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Recent encounters</h3>
          <div className="list">
            {recentEncounters.map((encounter) => (
              <Link key={encounter.id} to={`/app/encounters/${encounter.id}`} className="list-item">
                <div>
                  <strong>{encounter.title}</strong>
                  <p className="muted">Status: {encounter.status}</p>
                </div>
                <span>Open</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
