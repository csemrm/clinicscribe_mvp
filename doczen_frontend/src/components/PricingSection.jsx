import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Basic",
    target: "Solo & Private Practice",
    price: "Contact Sales",
    description: "For individual clinicians who want to eliminate documentation overhead.",
    features: [
      "1 clinician seat",
      "Voice-to-SOAP notes",
      "Smart form autofill",
      "PDF export",
      "Audit logs",
      "MFA",
      "Email support",
    ],
    cta: "Request a Demo",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    target: "Small Clinics & Group Practices",
    price: "Contact Sales",
    description: "For small teams needing collaboration, admin controls, and deeper integrations.",
    features: [
      "Up to 15 clinician seats",
      "Everything in Basic",
      "Team admin controls",
      "Role-based access control",
      "Visit summaries + history retrieval",
      "Priority support",
      "Onboarding assistance",
    ],
    cta: "Request a Demo",
    href: "/register",
    highlight: true,
  },
  {
    name: "Enterprise",
    target: "Hospitals & Networks",
    price: "Custom",
    description: "For large organizations requiring custom integrations, SSO, and SLA guarantees.",
    features: [
      "Unlimited seats",
      "Everything in Pro",
      "SSO / SAML",
      "EHR integration (roadmap)",
      "Dedicated success manager",
      "SLA guarantee",
      "Custom BAA available",
    ],
    cta: "Contact Sales",
    href: "/register",
    highlight: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-light border border-blue/20 mb-5">
            <span className="text-blue text-xs font-semibold uppercase tracking-wider">Pricing</span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{ fontFamily: "Syne, sans-serif", color: "hsl(var(--navy))" }}
          >
            Simple, transparent pricing.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-2">
            Keep it easy to understand for a demo: one lightweight tier for clinics, one pro tier for growing teams, and enterprise for custom deployment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                plan.highlight
                  ? "gradient-hero border-blue/30 shadow-large"
                  : "bg-white border-border shadow-card"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full gradient-blue text-white text-xs font-bold shadow-glow">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div
                  className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                    plan.highlight ? "text-white/60" : "text-blue"
                  }`}
                >
                  {plan.target}
                </div>
                <h3
                  className={`text-2xl font-extrabold mb-2 ${plan.highlight ? "text-white" : ""}`}
                  style={{
                    fontFamily: "Syne, sans-serif",
                    color: plan.highlight ? undefined : "hsl(var(--navy))",
                  }}
                >
                  {plan.name}
                </h3>
                <div className={`text-3xl font-extrabold mb-1 ${plan.highlight ? "text-white" : "text-blue"}`}
                  style={{ fontFamily: "Syne, sans-serif" }}>
                  {plan.price}
                </div>
                <p className={`text-sm leading-relaxed ${plan.highlight ? "text-white/70" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: plan.highlight ? "hsl(var(--teal))" : "hsl(var(--blue))" }}
                    />
                    <span className={`text-sm ${plan.highlight ? "text-white/80" : "text-muted-foreground"}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.href}
                className={`block w-full py-3 rounded-xl text-center text-sm font-semibold transition-all hover:scale-105 ${
                  plan.highlight
                    ? "gradient-blue text-white shadow-glow"
                    : "border border-border bg-background hover:shadow-card"
                }`}
                style={{ color: plan.highlight ? undefined : "hsl(var(--navy))" }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground/60 text-xs mt-8">
          All plans include HIPAA-ready architecture, end-to-end encryption, MFA, and audit logs. DocZen is an administrative assistant only.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
