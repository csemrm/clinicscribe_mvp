const testimonials = [
  {
    quote: "I used to spend 2+ hours after clinic charting. With DocZen, my documentation drafts are ready before I leave the exam room — I just review and approve. It's genuinely changed my evenings.",
    name: "Dr. Sarah Okonkwo",
    title: "Family Medicine · Private Practice",
    initials: "SO",
  },
  {
    quote: "The SOAP note drafts are impressively structured. I still review everything carefully, but the cognitive lift of starting from a blank page is gone. My billing team has noticed the accuracy improvements.",
    name: "Dr. James Park",
    title: "Internal Medicine · Group Practice",
    initials: "JP",
  },
  {
    quote: "As a hospitalist seeing 20+ patients a day, having a first draft ready for review — rather than starting from scratch — changes everything. The audit trail gives me confidence for compliance reviews.",
    name: "Dr. Priya Mehta",
    title: "Hospitalist · Hospital Medicine",
    initials: "PM",
  },
  {
    quote: "I was skeptical. But the admin burden reduction is real. I still review and approve every note — DocZen just means I'm not the one writing the first draft from a blank screen at 9pm.",
    name: "Dr. Marcus Rivera",
    title: "Emergency Medicine",
    initials: "MR",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-light border border-blue/20 mb-5">
            <span className="text-blue text-xs font-semibold uppercase tracking-wider">Testimonials</span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{ fontFamily: "Syne, sans-serif", color: "hsl(var(--navy))" }}
          >
            Clinicians getting time back.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Real feedback from physicians who've reduced their documentation burden.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-background border border-border shadow-card hover:shadow-large transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <span key={s} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <blockquote className="text-foreground text-base leading-relaxed mb-6 italic">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-full gradient-blue flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                >
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "hsl(var(--navy))" }}>{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground/50 text-xs mt-8">
          All testimonials represent administrative and workflow improvements only. DocZen does not provide clinical decision support, diagnosis, or prescribing.
        </p>
      </div>
    </section>
  );
};

export default TestimonialsSection;
