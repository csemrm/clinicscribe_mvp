import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'

export default function Landing() {
  return (
    <div className="landing">
      <div className="hero card">
        <div>
          <p className="eyebrow">Doczen AI</p>
          <h1>Turn clinician notes into reviewable documents.</h1>
          <p className="lead">
            Patient → Encounter → AI Draft → Human Review → Final PDF.
          </p>
          <div className="actions">
            <Link to="/login"><Button>Login</Button></Link>
            <Link to="/register"><Button variant="secondary">Register</Button></Link>
          </div>
        </div>
      </div>
    </div>
  )
}
