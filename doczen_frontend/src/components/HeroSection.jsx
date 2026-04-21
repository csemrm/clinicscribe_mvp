import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const HeroSection = () => {
  return (
    <section className="relative min-h-screen gradient-hero flex flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16">
      <div
        className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'hsl(210, 100%, 56%)' }}
      />
      <div
        className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'hsl(173, 58%, 45%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'hsl(var(--teal))' }} />
            <span className="text-white/90 text-xs font-medium tracking-wide">Healthcare-grade documentation workflow</span>
          </div>

          <h1
            className="text-white text-4xl md:text-6xl font-extrabold leading-tight mb-6"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Cut documentation time.<br />
            Reduce burnout.<br />
            <span style={{ color: 'hsl(var(--blue))' }}>Stay compliant.</span>
          </h1>

          <p className="text-white/75 text-lg md:text-xl max-w-lg mb-3 leading-relaxed">
            DocZen turns raw clinician notes into structured, reviewable documents with one focused workflow: patient, encounter, AI draft, human review, and final PDF.
          </p>
          <p className="text-white/50 text-sm mb-10">
            No diagnosis. No prescribing. AI drafts; clinician reviews and approves.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl gradient-blue text-white font-semibold text-lg shadow-glow hover:opacity-90 hover:scale-105 transition-all text-center inline-flex items-center justify-center gap-2"
            >
              Request a Demo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/#workflow"
              className="px-8 py-4 rounded-xl border border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm text-center"
            >
              See the workflow
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            {['Patient → Encounter → Draft → Review → PDF', 'Clinic-scoped data', 'Audit trail included'].map((b) => (
              <span
                key={b}
                className="px-3 py-1 rounded-full text-xs font-medium border border-white/15 bg-white/8 text-white/70"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute -inset-4 rounded-3xl blur-2xl opacity-20"
            style={{ background: 'hsl(210, 100%, 56%)' }}
          />
          <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-large">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 flex items-center gap-2 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <div className="w-3 h-3 rounded-full bg-green-400/70" />
              <div className="flex-1 mx-4 h-4 rounded-full bg-white/10" />
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Patients', value: '128' },
                  { label: 'Open encounters', value: '14' },
                  { label: 'Drafts awaiting review', value: '6' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-3 border border-white/10"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  >
                    <div className="text-white/50 text-xs mb-1">{stat.label}</div>
                    <div className="text-white text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/70 text-xs font-medium uppercase tracking-wider">SOAP Note Draft</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'hsl(173, 58%, 45% / 0.3)', color: 'hsl(173, 58%, 70%)' }}
                  >
                    AI Draft
                  </span>
                </div>
                {[
                  'S: Patient reports persistent lower back pain...',
                  'O: BP 122/78 · HR 72 · Temp 98.4°F',
                  'A: Lumbar muscle strain, uncomplicated',
                  'P: NSAIDs PRN · Follow up 2 weeks',
                ].map((line) => (
                  <div key={line} className="text-white/60 text-xs py-1 border-b border-white/5 last:border-0">
                    {line}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg text-xs font-medium text-white gradient-blue">
                  Approve & Export
                </button>
                <button className="px-4 py-2 rounded-lg text-xs font-medium border border-white/20 text-white/70">
                  Edit Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}

export default HeroSection
