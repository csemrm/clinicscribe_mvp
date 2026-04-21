const stats = [
  { value: '30–40%', label: 'less admin time' },
  { value: '4.2 hrs', label: 'saved per clinician/day' },
  { value: '45 sec', label: 'to generate a draft' },
  { value: 'HIPAA', label: 'privacy-first workflow' },
]

const StatsBar = () => {
  return (
    <section className="bg-white border-y border-border py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div
                className="text-3xl md:text-4xl font-extrabold mb-1"
                style={{ fontFamily: 'Syne, sans-serif', color: 'hsl(var(--navy))' }}
              >
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsBar
