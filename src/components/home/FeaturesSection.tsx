import ScrollReveal from "./ScrollReveal";

const FEATURES = [
  {
    accent: "#3b82f6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: "Code Snippets",
    description:
      "Save reusable code with syntax highlighting, language labels, and searchable tags.",
  },
  {
    accent: "#f59e0b",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI Prompts",
    description:
      "Organize your best prompts for ChatGPT, Claude, Gemini, and other AI tools.",
  },
  {
    accent: "#06b6d4",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M8 9l4 3-4 3M13 15h3" />
      </svg>
    ),
    title: "Commands",
    description:
      "Never forget a CLI command again. Store, tag, and copy terminal commands instantly.",
  },
  {
    accent: "#22c55e",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    title: "Notes & Docs",
    description:
      "Markdown-powered notes for architecture decisions, workflows, and documentation.",
  },
  {
    accent: "#6366f1",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: "Instant Search",
    description:
      "Full-text search across titles, content, tags, and types. Find anything in milliseconds.",
  },
  {
    accent: "#64748b",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
      </svg>
    ),
    title: "Collections",
    description:
      "Group mixed item types into collections. React Patterns, Context Files, Python Snippets.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything in One Place</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Seven item types, one hub. Every piece of developer knowledge you create or collect,
            organized and searchable.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <ScrollReveal key={feature.title}>
              <div
                className="rounded-xl border border-border bg-card p-6 h-full hover:border-white/20 transition-colors"
                style={{ borderLeftColor: feature.accent + "60", borderLeftWidth: 2 }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: feature.accent + "20", color: feature.accent }}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
