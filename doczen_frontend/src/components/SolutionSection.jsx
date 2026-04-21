import { Camera, FileText, Shield } from 'lucide-react'

const solutions = [
  {
    icon: Camera,
    title: 'Upload Patient Photo',
    description: 'Capture a patient photo or ID image and keep it attached to the encounter record.',
  },
  {
    icon: FileText,
    title: 'AI Encounter Summaries',
    description: 'Generate structured summaries from raw notes in seconds for review and approval.',
  },
  {
    icon: Shield,
    title: 'Secure System Integrations',
    description: 'Keep every export and data handoff logged, encrypted, and ready for clinic workflows.',
  },
]

const SolutionSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-light border border-blue/20 mb-5">
            <span className="text-blue text-xs font-semibold uppercase tracking-wider">One platform</span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{ fontFamily: 'Syne, sans-serif', color: 'hsl(var(--navy))' }}
          >
            All your admin work handled.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            DocZen centralizes patient information and automates non-clinical documentation — so clinicians spend time with patients, not paperwork.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((s, i) => {
            const Icon = s.icon
            return (
              <div
                key={i}
                className="relative p-8 rounded-2xl bg-white border border-border shadow-card hover:shadow-large transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-14 h-14 rounded-2xl gradient-blue flex items-center justify-center mb-6 shadow-glow group-hover:scale-105 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ fontFamily: 'Syne, sans-serif', color: 'hsl(var(--navy))' }}
                >
                  {s.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-0">{s.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default SolutionSection
