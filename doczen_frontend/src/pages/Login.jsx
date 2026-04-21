import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import Button from '../components/Button'
import Field from '../components/Field'
import { login, setToken } from '../lib/api'
import Navbar from '../components/Navbar'
import FooterSection from '../components/FooterSection'

const COLORS = {
  page: '#f4f7fb',
  surface: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  muted: '#64748b',
  blue: '#2563eb',
  cyan: '#38bdf8',
  navy: '#07172f',
}

const highlights = [
  'Clinic-scoped workflow',
  'Review before finalize',
  'Clean PDF export',
]

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = React.useState({ email: '', password: '' })
  const [error, setError] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await login(form)
      setToken(data.access)
      navigate('/app')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07172f', color: COLORS.text }}>
      <Navbar />

      <section
        style={{
          background:
            'radial-gradient(circle at top left, rgba(56,189,248,0.20), transparent 28%), radial-gradient(circle at top right, rgba(37,99,235,0.18), transparent 30%), linear-gradient(180deg, #07172f 0%, #0b2547 100%)',
        }}
      >
        <header style={{ maxWidth: 1180, margin: '0 auto', padding: '22px 24px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', textDecoration: 'none' }}>
            <div style={{ width: 14, height: 14, borderRadius: 999, background: COLORS.cyan, boxShadow: '0 0 0 5px rgba(56,189,248,0.15)' }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>Doczen</div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <div style={{ color: '#fff', fontSize: 13, opacity: 0.85 }}>Create account</div>
            </Link>
          </div>
        </header>

        <main style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 24px 78px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.95fr', gap: 34, alignItems: 'center', padding: '18px 0 72px' }}>
            <div
              style={{
                color: '#fff',
                maxWidth: 620,
                background: 'linear-gradient(180deg, rgba(7, 23, 47, 0.82), rgba(11, 37, 71, 0.72))',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 28,
                padding: 28,
                boxShadow: '0 18px 50px rgba(0,0,0,0.18)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 10, height: 10, borderRadius: 999, background: COLORS.cyan }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fbff' }}>Clinic admin assistant</div>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: 999,
                  border: '1px solid rgba(96, 165, 250, 0.20)',
                  background: 'rgba(59, 130, 246, 0.06)',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  padding: '7px 14px',
                  marginBottom: 14,
                }}
              >
                Secure clinician access
              </div>

              <h1 style={{ fontSize: 54, lineHeight: 1.06, margin: 0, letterSpacing: '-0.04em', color: '#ffffff' }}>
                Welcome back.
                <br />
                Sign in to continue
                <br />
                your workflow.
              </h1>
              <p style={{ marginTop: 18, fontSize: 17, lineHeight: 1.8, color: 'rgba(248,250,252,0.90)', maxWidth: 540 }}>
                Use the same focused Doczen experience from the landing page: patient intake, encounter drafting, human review, and final PDF export in one place.
              </p>

              <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 6, color: '#ffffff' }}>
                {highlights.map((item) => (
                  <span key={item} style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.06)', borderRadius: 999, padding: '8px 12px', color: '#ffffff', fontSize: 13 }}>
                    {item}
                  </span>
                ))}
              </div>

              <div style={{ marginTop: 28, display: 'grid', gap: 12, maxWidth: 500 }}>
                {[
                  ['Review before finalize', 'Clinicians approve every draft before export.', ShieldCheck],
                  ['Clean document output', 'Generate polished, printable PDF files.', ArrowRight],
                  ['Fast re-entry', 'Get back to the same clinic workflow in seconds.', Sparkles],
                ].map(([title, desc, Icon]) => (
                  <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', borderRadius: 18, border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.06)', padding: 16 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 14, background: 'linear-gradient(135deg, rgba(56,189,248,0.14), rgba(37,99,235,0.12))', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>{title}</div>
                      <div style={{ marginTop: 4, fontSize: 13, lineHeight: 1.7, color: 'rgba(248,250,252,0.82)' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  borderRadius: 28,
                  border: `1px solid ${COLORS.border}`,
                  background: '#ffffff',
                  boxShadow: '0 20px 60px rgba(15, 23, 42, 0.12)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: 24, borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 14, background: 'linear-gradient(135deg, #38bdf8, #1d4ed8)', boxShadow: '0 10px 30px rgba(37,99,235,0.24)', display: 'grid', placeItems: 'center' }}>
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>Doczen AI</div>
                      <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Sign in to your clinic workspace</div>
                    </div>
                  </div>
                </div>

                <form onSubmit={onSubmit} style={{ padding: 24 }}>
                  <h2 style={{ fontSize: 28, lineHeight: 1.1, margin: 0, color: COLORS.text }}>Login</h2>
                  <p style={{ marginTop: 8, marginBottom: 20, color: COLORS.muted, fontSize: 14, lineHeight: 1.7 }}>
                    Continue to patient records, encounters, and draft review.
                  </p>

                  <div style={{ display: 'grid', gap: 14 }}>
                    <Field
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                    <Field
                      label="Password"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </div>

                  {error ? (
                    <div
                      style={{
                        marginTop: 16,
                        borderRadius: 14,
                        border: '1px solid rgba(239, 68, 68, 0.18)',
                        background: 'rgba(254, 242, 242, 1)',
                        color: '#b91c1c',
                        padding: '12px 14px',
                        fontSize: 14,
                      }}
                    >
                      {error}
                    </div>
                  ) : null}

                  <div style={{ marginTop: 18 }}>
                    <Button type="submit" disabled={busy}>
                      {busy ? 'Signing in…' : 'Sign in'}
                    </Button>
                  </div>

                  <p style={{ marginTop: 16, marginBottom: 0, fontSize: 14, color: COLORS.muted }}>
                    Need an account?{' '}
                    <Link to="/register" style={{ color: COLORS.blue, fontWeight: 600, textDecoration: 'none' }}>
                      Register
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </main>
      </section>

      <FooterSection />
    </div>
  )
}
