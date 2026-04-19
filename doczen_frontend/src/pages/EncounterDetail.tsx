import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';

export default function EncounterDetail() {
  const { encounterId } = useParams();

  return (
    <div className="stack">
      <div className="card">
        <div className="eyebrow">Encounter</div>
        <h2>Encounter #{encounterId}</h2>
        <p className="muted">Raw notes, attachment upload, generation controls, and document list.</p>
      </div>

      <section className="grid-2">
        <div className="card">
          <h3>Raw notes</h3>
          <p>
            Patient reports intermittent headaches and fatigue. No acute distress. Recommend review of hydration,
            sleep, and follow-up if symptoms persist.
          </p>
        </div>
        <div className="card">
          <h3>Generation</h3>
          <div className="button-row wrap">
            <Button>Generate SOAP</Button>
            <Button className="secondary">Generate AVS</Button>
            <Button className="ghost">Generate Form</Button>
          </div>
          <div className="banner warning">Red flags detected: none</div>
        </div>
      </section>

      <div className="card">
        <h3>Documents</h3>
        <div className="list">
          <Link to="/app/documents/soap-1" className="list-item">
            <div>
              <strong>SOAP Draft</strong>
              <p className="muted">Status: draft</p>
            </div>
            <span>Open</span>
          </Link>
          <Link to="/app/documents/avs-1" className="list-item">
            <div>
              <strong>AVS Draft</strong>
              <p className="muted">Status: in review</p>
            </div>
            <span>Open</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
