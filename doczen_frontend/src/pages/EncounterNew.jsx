import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mic, MicOff, Sparkles, ClipboardList, FileText, ShieldCheck, ArrowRight } from 'lucide-react'
import Button from '../components/Button'
import Field from '../components/Field'
import { createEncounter, listPatients, previewChiefComplaint } from '../lib/api'

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export default function EncounterNew() {
  const navigate = useNavigate()
  const [patients, setPatients] = React.useState([])
  const [error, setError] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [previewBusy, setPreviewBusy] = React.useState(false)
  const autoFillChief = React.useRef(true)
  const [previewMeta, setPreviewMeta] = React.useState({ chief_complaint: '', source: '', error: '' })
  const [form, setForm] = React.useState({ patient: '', visit_date: '', chief_complaint: '', raw_notes: '' })
  const [dictationError, setDictationError] = React.useState('')
  const [isListening, setIsListening] = React.useState(false)
  const recognitionRef = React.useRef(null)

  const appendNotes = React.useCallback((transcript) => {
    const cleanTranscript = transcript.trim()
    if (!cleanTranscript) return

    setForm((current) => {
      const existing = (current.raw_notes || '').trim()
      const nextNotes = existing ? `${existing} ${cleanTranscript}` : cleanTranscript
      return { ...current, raw_notes: nextNotes }
    })
  }, [])

  const stopListening = React.useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) {
      setIsListening(false)
      return
    }

    try {
      recognition.onend = null
      recognition.stop()
    } catch {
      // ignore stop errors
    }

    recognitionRef.current = null
    setIsListening(false)
  }, [])

  const startListening = React.useCallback(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setDictationError('Voice input is not supported in this browser.')
      return
    }

    setDictationError('')

    const recognition = recognitionRef.current || new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = true

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += `${result[0].transcript} `
        }
      }
      appendNotes(finalTranscript)
    }

    recognition.onerror = (event) => {
      setDictationError(event.error ? `Voice input error: ${event.error}` : 'Voice input failed.')
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      if (recognitionRef.current && isListening) {
        try {
          recognition.start()
        } catch {
          setIsListening(false)
          recognitionRef.current = null
        }
        return
      }
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
      setIsListening(true)
    } catch {
      setDictationError('Could not start voice input. Try again.')
      setIsListening(false)
      recognitionRef.current = null
    }
  }, [appendNotes, isListening])

  React.useEffect(() => {
    listPatients()
      .then((data) => setPatients(Array.isArray(data) ? data : data.results || []))
      .catch((err) => setError(err.message))
  }, [])

  React.useEffect(() => {
    const notes = (form.raw_notes || '').trim()
    if (!notes) {
      setPreviewMeta({ chief_complaint: '', source: '', error: '' })
      return undefined
    }

    const timer = window.setTimeout(async () => {
      try {
        setPreviewBusy(true)
        const result = await previewChiefComplaint(notes)
        const suggestion = result?.chief_complaint || ''
        const source = result?.metadata?.source || ''
        setPreviewMeta({ chief_complaint: suggestion, source, error: '' })
        setForm((current) => {
          if (!autoFillChief.current) return current
          if ((current.chief_complaint || '').trim()) return current
          return { ...current, chief_complaint: suggestion }
        })
      } catch (err) {
        setPreviewMeta((current) => ({ ...current, error: err.message }))
      } finally {
        setPreviewBusy(false)
      }
    }, 650)

    return () => window.clearTimeout(timer)
  }, [form.raw_notes])

  React.useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

  const regenerateChiefComplaint = async () => {
    const notes = (form.raw_notes || '').trim()
    if (!notes) return
    setBusy(true)
    setError('')
    try {
      const result = await previewChiefComplaint(notes)
      const suggestion = result?.chief_complaint || ''
      setPreviewMeta({ chief_complaint: suggestion, source: result?.metadata?.source || '', error: '' })
      autoFillChief.current = true
      setForm((current) => ({ ...current, chief_complaint: suggestion }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const created = await createEncounter({ ...form, patient: Number(form.patient) })
      navigate(`/app/encounters/${created.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const listeningLabel = isListening ? 'Stop voice input' : 'Use voice input'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[28px] bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 px-6 py-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
                <Sparkles className="h-3.5 w-3.5" />
                New encounter
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Create a new encounter with voice dictation.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Speak naturally into Raw notes, keep recording until you press Stop, and let the chief complaint update from the encounter text.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
              <StatCard label="Patients" value={patients.length.toString()} icon={ClipboardList} />
              <StatCard label="Dictation" value={isListening ? 'Live' : 'Ready'} icon={Mic} />
              <StatCard label="Review" value="Auto" icon={ShieldCheck} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <form className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8" onSubmit={onSubmit}>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Encounter details</h2>
                <p className="mt-1 text-sm text-slate-600">Fill the encounter, dictate raw notes, then review the chief complaint.</p>
              </div>
              <Link
                to="/app/documents"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <FileText className="h-4 w-4" />
                Documents
              </Link>
            </div>

            <div className="grid gap-5">
              <label className="field">
                <span className="field-label">Patient</span>
                <select className="input" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required>
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name}
                    </option>
                  ))}
                </select>
              </label>

              <Field
                label="Visit date"
                type="date"
                value={form.visit_date}
                onChange={(e) => setForm({ ...form, visit_date: e.target.value })}
                required
              />

              <Field
                label="Chief complaint"
                value={form.chief_complaint}
                onChange={(e) => {
                  autoFillChief.current = false
                  setForm({ ...form, chief_complaint: e.target.value })
                }}
                hint={
                  dictationError
                    ? dictationError
                    : previewBusy
                      ? 'Generating suggestion…'
                      : previewMeta.chief_complaint
                        ? `AI suggestion: ${previewMeta.chief_complaint}${previewMeta.source ? ` · ${previewMeta.source}` : ''}`
                        : 'The chief complaint will auto-fill from Raw notes.'
                }
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-950">Raw notes</div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Speak naturally. Raw notes keep listening until you press Stop.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      isListening
                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                        : 'bg-sky-500 text-white hover:bg-sky-600'
                    }`}
                    onClick={isListening ? stopListening : startListening}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {listeningLabel}
                  </button>
                </div>

                <textarea
                  className="min-h-[220px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  value={form.raw_notes}
                  onChange={(e) => setForm({ ...form, raw_notes: e.target.value })}
                  placeholder="Type the encounter notes or start voice input and speak naturally..."
                  required
                />

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">Voice stays on until Stop</span>
                  <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">Speech to text</span>
                  <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">Chief complaint auto-generation</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="secondary" onClick={regenerateChiefComplaint} disabled={!form.raw_notes || busy}>
                  Regenerate chief complaint
                </Button>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                  {previewMeta.error ? <span>{previewMeta.error}</span> : null}
                  {dictationError ? <span>{dictationError}</span> : null}
                </div>
              </div>

              {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

              <div className="pt-2">
                <Button type="submit" disabled={busy}>
                  {busy ? 'Creating…' : 'Create encounter'}
                </Button>
              </div>
            </div>
          </form>

          <aside className="grid gap-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Voice dictation</h3>
                  <p className="text-sm text-slate-600">Press Start, speak, and stop when you are done.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {[
                  'Keep the button on until you finish speaking.',
                  'Your transcript is appended into Raw notes.',
                  'Chief complaint is refreshed from the full note.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Workflow preview</h3>
                  <p className="text-sm text-slate-300">Raw notes drive the chief complaint automatically.</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">Chief complaint</div>
                  <div className="mt-2 text-sm leading-6 text-slate-100">
                    {form.chief_complaint || (previewBusy ? 'Generating suggestion…' : 'Waiting for raw notes')}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">Raw notes</div>
                  <div className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-100">
                    {form.raw_notes || 'Your voice transcript will appear here.'}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
