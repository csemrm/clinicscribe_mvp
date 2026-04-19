import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';

export default function DocumentEditor() {
  const { documentId } = useParams();
  const [content, setContent] = useState(
    'Subjective: Patient reports headaches and fatigue.\n\nAssessment: Symptoms are non-specific.\n\nPlan: Continue hydration and monitor.',
  );

  return (
    <div className="stack">
      <div className="card">
        <div className="eyebrow">Document</div>
        <h2>Document #{documentId}</h2>
        <p className="muted">Edit draft text, submit for review, finalize, then export PDF.</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Editor</h3>
          <textarea className="editor" value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div className="card">
          <h3>Actions</h3>
          <div className="button-column">
            <Button>Submit review</Button>
            <Button className="secondary">Finalize</Button>
            <Button className="ghost">Export JSON</Button>
            <Button className="ghost">Export PDF</Button>
          </div>
          <div className="banner warning">Final documents are read-only and clinic-scoped.</div>
          <Link to="/app" className="muted link-inline">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
