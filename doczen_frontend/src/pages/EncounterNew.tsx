import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Field from '../components/Field';

export default function EncounterNew() {
  const [notes, setNotes] = useState('Patient reports intermittent headaches and fatigue.');

  return (
    <div className="stack">
      <div className="card">
        <h2>New encounter</h2>
        <p className="muted">Create the raw note that will feed SOAP, AVS, or form generation.</p>
      </div>
      <div className="card form-grid">
        <Field label="Patient ID" placeholder="e.g. 1" />
        <Field label="Visit date" type="date" />
        <label className="field field-full">
          <span>Raw clinician notes</span>
          <textarea rows={8} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <div className="button-row field-full">
          <Button type="button">Save encounter</Button>
          <Link className="btn secondary" to="/app">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
