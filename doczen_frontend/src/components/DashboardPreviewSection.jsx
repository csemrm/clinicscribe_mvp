import { Clock, FileText, Users, BarChart3 } from "lucide-react";

const widgets = [
  {
    icon: Users,
    label: "Today's Patients",
    value: "14",
    sub: "3 in progress",
    color: "hsl(var(--blue))",
  },
  {
    icon: FileText,
    label: "Pending Documentation",
    value: "2",
    sub: "Awaiting your approval",
    color: "hsl(var(--teal))",
  },
  {
    icon: Clock,
    label: "Recently Updated",
    value: "6",
    sub: "Records updated today",
    color: "hsl(var(--blue))",
  },
  {
    icon: BarChart3,
    label: "Time Saved",
    value: "3.8h",
    sub: "vs. manual documentation",
    color: "hsl(var(--teal))",
  },
];

const DashboardPreviewSection = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-light border border-blue/20 mb-5">
            <span className="text-blue text-xs font-semibold uppercase tracking-wider">Dashboard Preview</span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{ fontFamily: "Syne, sans-serif", color: "hsl(var(--navy))" }}
          >
            Everything at a glance.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A clean, focused dashboard designed for busy clinicians — not IT departments.
          </p>
        </div>

        {/* Mock dashboard */}
        <div className="relative max-w-5xl mx-auto">
          <div
            className="absolute -inset-4 rounded-3xl blur-3xl opacity-10 pointer-events-none"
            style={{ background: "hsl(var(--blue))" }}
          />
          <div className="relative rounded-2xl border border-border shadow-large overflow-hidden bg-background">
            {/* Browser chrome */}
            <div className="bg-muted border-b border-border px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <div className="w-3 h-3 rounded-full bg-green-400/70" />
              <div className="flex-1 mx-4 h-5 rounded-full bg-border max-w-48 mx-auto" />
              <span className="text-muted-foreground text-xs ml-auto">DocZen — Dashboard</span>
            </div>

            {/* Dashboard body */}
            <div className="p-6">
              {/* Top nav */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Good morning, Dr. Okonkwo</div>
                  <div
                    className="text-xl font-bold"
                    style={{ fontFamily: "Syne, sans-serif", color: "hsl(var(--navy))" }}
                  >
                    Tuesday, Feb 18 · 12 patients scheduled
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="px-4 py-2 rounded-lg gradient-blue text-white text-xs font-semibold shadow-glow">
                    + New Note
                  </div>
                </div>
              </div>

              {/* Widgets */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {widgets.map((w) => {
                  const Icon = w.icon;
                  return (
                    <div key={w.label} className="p-4 rounded-xl border border-border bg-white shadow-card">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4" style={{ color: w.color }} />
                        <span className="text-muted-foreground text-xs">{w.label}</span>
                      </div>
                      <div
                        className="text-2xl font-extrabold mb-0.5"
                        style={{ fontFamily: "Syne, sans-serif", color: "hsl(var(--navy))" }}
                      >
                        {w.value}
                      </div>
                      <div className="text-muted-foreground text-xs">{w.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Patient list mockup */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-muted px-4 py-3 flex items-center gap-4 border-b border-border">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient</span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-auto">Status</span>
                </div>
                {[
                  { name: "J. Martinez", time: "9:00 AM", status: "Note Approved", statusColor: "hsl(152, 60%, 38%)" },
                  { name: "P. Chen", time: "9:30 AM", status: "AI Draft Ready", statusColor: "hsl(var(--blue))" },
                  { name: "A. Williams", time: "10:00 AM", status: "In Progress", statusColor: "hsl(32, 95%, 50%)" },
                  { name: "R. Kumar", time: "10:30 AM", status: "Upcoming", statusColor: "hsl(var(--muted-foreground))" },
                ].map((row) => (
                  <div key={row.name} className="px-4 py-3 flex items-center gap-4 border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <div className="w-7 h-7 rounded-full gradient-blue flex items-center justify-center text-white text-xs font-bold">
                      {row.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: "hsl(var(--navy))" }}>{row.name}</div>
                      <div className="text-muted-foreground text-xs">{row.time}</div>
                    </div>
                    <div className="ml-auto text-xs font-semibold" style={{ color: row.statusColor }}>
                      {row.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreviewSection;
