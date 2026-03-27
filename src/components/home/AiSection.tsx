import { Badge } from "@/components/ui/badge";
import ScrollReveal from "./ScrollReveal";

const CHECKLIST = [
  {
    title: "Auto-tagging",
    description: "AI suggests relevant tags as you save",
  },
  {
    title: "AI Summaries",
    description: "One-line summaries for long notes and prompts",
  },
  {
    title: "Explain Code",
    description: "Understand any snippet in plain English",
  },
  {
    title: "Prompt Optimization",
    description: "Improve your AI prompts for better results",
  },
];

export default function AiSection() {
  return (
    <section id="ai" className="py-20 px-4 sm:px-6 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text */}
          <ScrollReveal className="flex-1">
            <Badge variant="outline" className="mb-4 text-yellow-400 border-yellow-400/30 bg-yellow-400/10">
              Pro Feature
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              AI Superpowers for Your Knowledge
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              DevStash uses AI to surface insights, generate tags, and help you understand
              code — automatically.
            </p>
            <ul className="space-y-4">
              {CHECKLIST.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <div>
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-muted-foreground"> — {item.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          {/* Code mockup */}
          <ScrollReveal className="flex-1 w-full">
            <div className="rounded-xl border border-border bg-[#0d1117] overflow-hidden text-sm font-mono">
              {/* Window bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#161b22]">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-3 text-xs text-slate-400">useDebounce.ts</span>
              </div>

              {/* Code */}
              <pre className="p-4 text-xs sm:text-sm leading-relaxed overflow-x-auto">
                <code>
                  <span className="text-blue-400">import</span>
                  <span className="text-slate-300"> {"{ useState, useEffect }"} </span>
                  <span className="text-blue-400">from</span>
                  <span className="text-green-400"> &apos;react&apos;</span>
                  {"\n\n"}
                  <span className="text-blue-400">export function</span>
                  <span className="text-yellow-300"> useDebounce</span>
                  <span className="text-slate-300">&lt;T&gt;(</span>
                  {"\n"}
                  <span className="text-slate-300">{"  "}value: T,</span>
                  {"\n"}
                  <span className="text-slate-300">{"  "}delay: </span>
                  <span className="text-cyan-400">number</span>
                  {"\n"}
                  <span className="text-slate-300">{"): T {"}</span>
                  {"\n"}
                  <span className="text-blue-400">{"  "}const</span>
                  <span className="text-slate-300"> [debouncedValue, setDebouncedValue]</span>
                  {"\n"}
                  <span className="text-slate-300">{"    = "}</span>
                  <span className="text-yellow-300">useState</span>
                  <span className="text-slate-300">(value)</span>
                  {"\n\n"}
                  <span className="text-yellow-300">{"  "}useEffect</span>
                  <span className="text-slate-300">{"(() => {"}</span>
                  {"\n"}
                  <span className="text-blue-400">{"    "}const</span>
                  <span className="text-slate-300"> timer = </span>
                  <span className="text-yellow-300">setTimeout</span>
                  <span className="text-slate-300">{"(() => {"}</span>
                  {"\n"}
                  <span className="text-yellow-300">{"      "}setDebouncedValue</span>
                  <span className="text-slate-300">(value)</span>
                  {"\n"}
                  <span className="text-slate-300">{"    }, delay)"}</span>
                  {"\n"}
                  <span className="text-blue-400">{"    "}return</span>
                  <span className="text-slate-300"> () =&gt; </span>
                  <span className="text-yellow-300">clearTimeout</span>
                  <span className="text-slate-300">(timer)</span>
                  {"\n"}
                  <span className="text-slate-300">{"  }, [value, delay])"}</span>
                  {"\n\n"}
                  <span className="text-blue-400">{"  "}return</span>
                  <span className="text-slate-300"> debouncedValue</span>
                  {"\n"}
                  <span className="text-slate-300">{"}"}</span>
                </code>
              </pre>

              {/* AI tags strip */}
              <div className="px-4 py-3 border-t border-white/10 bg-[#161b22]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400">AI Generated Tags</span>
                  {["react", "hooks", "debounce", "typescript", "performance"].map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
