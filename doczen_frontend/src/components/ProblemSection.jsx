import { AlertTriangle, Layers, ClipboardX, BrainCog } from "lucide-react";

const problems = [
  {
    icon: ClipboardX,
    text: "Doctors spend 30–40% of their time on documentation, not patients.",
  },
  {
    icon: Layers,
    text: "Fragmented systems — EHR, hospital portals, insurance platforms — force constant context-switching.",
  },
  {
    icon: AlertTriangle,
    text: "Manual data re-entry across systems increases errors, delays, and liability.",
  },
  {
    icon: BrainCog,
    text: "Administrative burden is a leading driver of clinician burnout and early retirement.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-light border border-blue/20 mb-5">
              <span className="text-blue text-xs font-semibold uppercase tracking-wider">The Problem</span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-extrabold mb-6"
              style={{ fontFamily: "Syne, sans-serif", color: "hsl(var(--navy))" }}
            >
              Paperwork is stealing time<br />
              <span className="text-blue">from patient care.</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Clinicians didn't go to medical school to fill out forms. Yet documentation, data entry, and administrative overhead consume hours every day — time that should be spent with patients.
            </p>
          </div>

          <div className="space-y-4">
            {problems.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 rounded-xl bg-background border border-border"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-light flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-blue" />
                  </div>
                  <p className="text-foreground text-base leading-relaxed">{p.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
