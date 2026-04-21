import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const perks = [
  "No credit card required",
  "HIPAA-ready architecture",
  "AI drafts — you always approve",
  "Cancel anytime",
];

const CTASection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="relative p-12 md:p-16 rounded-3xl gradient-hero overflow-hidden">
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: "hsl(210, 100%, 56%)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: "hsl(173, 58%, 45%)" }}
          />

          <div className="relative z-10">
            <h2
              className="text-4xl md:text-5xl font-extrabold text-white mb-4"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Get your time back.
            </h2>
            <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto">
              Show the full clinic workflow in one polished home page: fast drafting, clear review, strong compliance cues, and a final PDF that looks ready for real use.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {perks.map((perk, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
                >
                  <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(var(--teal))" }} />
                  <span className="text-white/90 text-sm font-medium">{perk}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-10 py-4 rounded-xl gradient-blue text-white font-semibold text-lg shadow-glow hover:opacity-90 hover:scale-105 transition-all"
              >
                Request a Demo
              </Link>
              <Link
                to="/login"
                className="px-10 py-4 rounded-xl border border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-all"
              >
                See the workflow
              </Link>
            </div>

            <p className="text-white/40 text-xs mt-8">
              DocZen is an administrative and documentation assistant only. Not a clinical tool. No diagnosis. No prescribing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
