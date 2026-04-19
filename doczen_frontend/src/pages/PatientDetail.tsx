import { Link, useParams } from 'react-router-dom';

export default function PatientDetail() {
  const { patientId } = useParams();

  return (
    <div className="stack">
      <div className="card">
        <div className="eyebrow">Patient</div>
        <h2>Patient #{patientId}</h2>
        <p className="muted">Patient details, encounter history, and quick-create entry point.</p>
        <div className="button-row">
          <Link className="btn" to="/app/encounters/new">
            New encounter
          </Link>
          <Link className="btn secondary" to="/app/patients">
            Back to patients
          </Link>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Encounter history</h3>
          <ul className="bullets">
            <li>Visit note draft</li>
            <li>Follow-up encounter</li>
            <li>Finalized AVS PDF</li>
          </ul>
        </div>
        <div className="card banner warning">
          This is a demo scaffold. Wire this page to <code>/api/patients/:id/</code> and encounter queries.
        </div>
      </div>
    </div>
  );
}
