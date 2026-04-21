const faqs = [
  {
    q: "Does DocZen diagnose patients?",
    a: "No. DocZen is an administrative and documentation assistant only. It does not provide medical advice, diagnoses, or treatment recommendations of any kind.",
  },
  {
    q: "Does DocZen prescribe medications?",
    a: "No. DocZen has no prescribing capabilities. All clinical decisions remain with the licensed clinician.",
  },
  {
    q: "How do you handle Protected Health Information (PHI)?",
    a: "PHI is encrypted in transit (TLS 1.3) and at rest (AES-256). Customer data is strictly isolated, never used to train public AI models, and handled in accordance with HIPAA-ready architecture principles.",
  },
  {
    q: "Can DocZen integrate with our EHR?",
    a: "EHR integration is on our roadmap, with plans to support Epic, Cerner, Athena, and others. Current export options include PDF and structured formats. Contact us for your specific EHR.",
  },
  {
    q: "Who approves notes before they're finalized?",
    a: "Always the licensed clinician. AI-generated content is clearly labeled as a draft at all times. Nothing finalizes or exports without explicit clinician review and approval.",
  },
  {
    q: "What formats can we export to?",
    a: "PDF export is available today. EHR-ready structured formats are in development. All exports are logged in the audit trail.",
  },
  {
    q: "What is the onboarding time?",
    a: "Most practices are up and running within a day. Our team provides guided onboarding, configuration, and training sessions tailored to your workflow.",
  },
  {
    q: "What about audit trails and access controls?",
    a: "Every access, edit, and approval is recorded in an immutable audit log. Role-based access control (RBAC) ensures staff see only what their role permits. MFA is required for all accounts.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-light border border-blue/20 mb-5">
            <span className="text-blue text-xs font-semibold uppercase tracking-wider">FAQ</span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{ fontFamily: "Syne, sans-serif", color: "hsl(var(--navy))" }}
          >
            Common questions answered.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group rounded-xl border border-border bg-background overflow-hidden"
            >
              <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none hover:bg-muted/50 transition-colors">
                <span
                  className="font-semibold text-base pr-4"
                  style={{ color: "hsl(var(--navy))" }}
                >
                  {faq.q}
                </span>
                <span className="text-blue text-xl flex-shrink-0 transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="px-6 pb-5">
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
