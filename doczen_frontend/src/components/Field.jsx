import React from 'react'

export default function Field({ label, hint, error, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      <span className="field-label">{label}</span>
      <input className={`input ${error ? 'input-error' : ''}`.trim()} {...props} />
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  )
}
