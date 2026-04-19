import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="center-page hero-page">
      <div className="card hero-card">
        <div className="eyebrow">Doczen AI</div>
        <h1>Turn clinician notes into reviewable documents.</h1>
        <p>
          Built for a single workflow: patient, encounter, draft generation, human review, final PDF export.
        </p>
        <div className="button-row">
          <Link className="btn" to="/login">
            Login
          </Link>
          <Link className="btn secondary" to="/register">
            Register
          </Link>
          <Link className="btn ghost" to="/app">
            Open App
          </Link>
        </div>
      </div>
    </div>
  );
}
