import { Activity } from "lucide-react";
import { Link } from "react-router-dom";

const FooterSection = () => {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/#features" },
        { label: "Security", href: "/#trust" },
        { label: "Pricing", href: "/#pricing" },
      ],
    },
    {
      title: "Get Started",
      links: [
        { label: "Request a Demo", href: "/register" },
        { label: "Sign In", href: "/login" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/#faq" },
        { label: "Terms of Service", href: "/#faq" },
      ],
    },
  ];

  return (
    <footer className="py-16 bg-[#061225] text-slate-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
                DocZen
              </span>
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              AI-powered medical documentation and administrative assistant for modern clinicians.
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              DocZen is a documentation and administrative assistant only. It does not provide medical advice, diagnoses, or treatment recommendations. All AI-generated content is reviewed and approved by the clinician.
            </p>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-slate-300 text-sm hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-300">
          <p className="text-slate-400 text-xs text-center md:text-left">
            © 2026 DocZen, Inc. All rights reserved. · HIPAA-ready architecture · Administrative/documentation assistant only. Not a medical device.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-slate-400 text-xs">All systems operational</span>
            </div>
            <span className="text-slate-600 text-xs">|</span>
            <Link to="/#faq" className="text-slate-400 text-xs hover:text-white transition-colors">Privacy</Link>
            <Link to="/#faq" className="text-slate-400 text-xs hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
