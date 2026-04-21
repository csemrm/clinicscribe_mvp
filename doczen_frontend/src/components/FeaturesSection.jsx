import { Mic, FileText, Shield, Clock, Zap, BarChart3, User, Lock, Download } from "lucide-react";

const features = [
  {
    icon: User,
    title: "Unified Patient Profile",
    description: "Timeline, uploads, lab/imaging reports, and insurance info in one place. No more portal-switching.",
    accentVar: "--blue",
    bgVar: "--blue-light",
  },
  {
    icon: Mic,
    title: "Voice-to-SOAP in Seconds",
    description: "Speak naturally during or after your visit. DocZen AI drafts structured SOAP notes. You review and approve — every time.",
    accentVar: "--blue",
    bgVar: "--blue-light",
  },
  {
    icon: FileText,
    title: "Smart Form Autofill",
    description: "Insurance forms, referral letters, discharge summaries — DocZen drafts them from your approved notes. One-click population.",
    accentVar: "--teal",
    bgVar: "--blue-light",
  },
  {
    icon: Clock,
    title: "Real-Time Ambient Listening",
    description: "Ambient mode captures the entire consultation. AI generates a draft; nothing finalizes until you approve.",
    accentVar: "--blue",
    bgVar: "--blue-light",
  },
  {
    icon: Zap,
    title: "EHR Integration (Placeholder)",
    description: "Designed to push directly to Epic, Cerner, Athena, and 20+ EHR systems. Integration roadmap in progress.",
    accentVar: "--blue",
    bgVar: "--blue-light",
  },
  {
    icon: Lock,
    title: "Role-Based Access + Audit Logs",
    description: "RBAC ensures every user sees only what they should. Immutable audit logs track every action — always.",
    accentVar: "--teal",
    bgVar: "--blue-light",
  },
  {
    icon: Download,
    title: "One-Click Export",
    description: "Export finalized notes and forms as PDF or EHR-ready format. Your records, your control.",
    accentVar: "--blue",
    bgVar: "--blue-light",
  },
  {
    icon: Shield,
    title: "HIPAA-Ready Architecture",
    description: "End-to-end encryption, MFA, and data isolation. Customer data is never used to train public AI models.",
    accentVar: "--teal",
    bgVar: "--blue-light",
  },
  {
    icon: BarChart3,
    title: "Compliance Analytics",
    description: "Track documentation quality, billing accuracy, and audit readiness across your practice in a live dashboard.",
    accentVar: "--blue",
    bgVar: "--blue-light",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-light border border-blue/20 mb-5">
            <span className="text-blue text-xs font-semibold uppercase tracking-wider">Features</span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{ fontFamily: "Syne, sans-serif", color: "hsl(var(--navy))" }}
          >
            Everything a clinician needs.<br />
            <span className="text-blue">Nothing they don't.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built with practicing doctors, not just engineers. Every feature solves a real documentation pain point. AI drafts; you approve.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group p-7 rounded-2xl bg-white border border-border shadow-card hover:shadow-large transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-light flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-blue" />
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ fontFamily: "Syne, sans-serif", color: "hsl(var(--navy))" }}
                >
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-muted-foreground/60 text-xs mt-10 max-w-2xl mx-auto">
          DocZen is an administrative and documentation assistant only. It does not provide medical advice, diagnoses, or treatment recommendations. All AI-generated content is reviewed and approved by the licensed clinician.
        </p>
      </div>
    </section>
  );
};

export default FeaturesSection;
