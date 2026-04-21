import { Shield, Lock, FileCheck, Users, Eye, Server } from "lucide-react";
import { Link } from "react-router-dom";

const trustItems = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "All data encrypted in transit (TLS 1.3) and at rest (AES-256). PHI never travels unencrypted.",
  },
  {
    icon: Users,
    title: "Role-Based Access Control",
    description: "Granular RBAC ensures staff see only what their role permits. Principle of least privilege enforced by design.",
  },
  {
    icon: FileCheck,
    title: "Immutable Audit Logs",
    description: "Every access, edit, and approval is logged and tamper-proof. Always audit-ready.",
  },
  {
    icon: Shield,
    title: "Multi-Factor Authentication",
    description: "MFA required for all accounts. No exceptions. Protects against credential-based attacks.",
  },
  {
    icon: Eye,
    title: "No AI Training on Your Data",
    description: "Customer data is never used to train public AI models. Your patients' information stays private — always.",
  },
  {
    icon: Server,
    title: "Administrative Only",
    description: "DocZen is a documentation and admin assistant. No clinical decision-making. No diagnosis. No prescribing.",
  },
];

const SecurityTrustSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-light border border-blue/20 mb-5">
            <span className="text-blue text-xs font-semibold uppercase tracking-wider">Security & Compliance</span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{ fontFamily: "Syne, sans-serif", color: "hsl(var(--navy))" }}
          >
            Built for healthcare-grade trust.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            HIPAA-ready architecture from the ground up. Security isn't a feature — it's the foundation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {trustItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-white border border-border shadow-card">
                <div className="w-10 h-10 rounded-xl bg-blue-light flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue" />
                </div>
                <h3
                  className="text-base font-bold mb-2"
                  style={{ fontFamily: "Syne, sans-serif", color: "hsl(var(--navy))" }}
                >
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-white shadow-card text-sm font-semibold hover:shadow-large transition-all hover:-translate-y-0.5"
            style={{ color: "hsl(var(--navy))" }}
          >
            <Shield className="w-4 h-4 text-blue" />
            Request a Demo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SecurityTrustSection;
