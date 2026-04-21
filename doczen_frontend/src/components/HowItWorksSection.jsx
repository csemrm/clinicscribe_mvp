import { User, ClipboardList, Sparkles, MessageSquareText, FileCheck2 } from 'lucide-react'

const steps = [
  {
    icon: User,
    number: '01',
    title: 'Select patient',
    description: 'Find or create the patient record for the visit.',
  },
  {
    icon: ClipboardList,
    number: '02',
    title: 'Write encounter notes',
    description: 'Capture the visit details, attachments, and context.',
  },
  {
    icon: Sparkles,
    number: '03',
    title: 'Generate AI draft',
    description: 'Create SOAP, AVS, or form drafts from the encounter.',
  },
  {
    icon: MessageSquareText,
    number: '04',
    title: 'Review & edit',
    description: 'Clinicians check and refine the text before finalizing.',
  },
  {
    icon: FileCheck2,
    number: '05',
    title: 'Finalize PDF',
    description: 'Lock the document and export a clean printable PDF.',
  },
]

const HowItWorksSection = () => {
  return (
    <section id="workflow" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-light border border-blue/20 mb-5">
            <span className="text-blue text-xs font-semibold uppercase tracking-wider">Workflow</span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{ fontFamily: 'Syne, sans-serif', color: 'hsl(var(--navy))' }}
          >
            From appointment to approved note<br />
            <span className="text-blue">in under a minute.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            No new workflows to learn. DocZen fits into how you already practice. AI drafts; you always approve.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue/10 via-blue/40 to-blue/10" />

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="relative text-center group">
                  <div className="relative z-10 w-20 h-20 mx-auto rounded-2xl gradient-blue flex items-center justify-center mb-5 shadow-glow group-hover:scale-105 transition-transform">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-blue text-xs font-bold mb-1">{step.number}</div>
                  <h3
                    className="text-base font-bold mb-2"
                    style={{ fontFamily: 'Syne, sans-serif', color: 'hsl(var(--navy))' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed max-w-40 mx-auto">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
